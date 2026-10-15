import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { prisma } from '../../lib/db';

const activeSyncs = new Set<string>();

export class ImapService {
  static async syncIncomingEmails(companyId: string, accountId: string) {
    if (activeSyncs.has(accountId)) {
      console.log(`Sync already in progress for account ${accountId}`);
      return { success: true, syncedCount: 0, message: 'Sync already in progress' };
    }
    
    activeSyncs.add(accountId);

    try {
      const account = await prisma.emailAccount.findFirst({
      where: { id: accountId, companyId },
    });

    if (!account) {
      throw new Error('Email account not found or not connected');
    }

    if (account.provider !== 'gmail' && account.provider !== 'other') {
      throw new Error('IMAP Sync is currently only supported for Gmail and Custom providers.');
    }

    let imapHost = 'imap.gmail.com';
    if (account.provider === 'other') {
      try {
        const settings = JSON.parse(account.refreshToken || '{}');
        if (settings.imapHost) {
          imapHost = settings.imapHost;
        } else {
          imapHost = `imap.${account.email.split('@')[1]}`;
        }
      } catch (e) {}
    }

    const config = {
      imap: {
        user: account.email,
        password: account.accessToken as string, // accessToken stores the App Password
        host: imapHost,
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 15000,
      },
    };

      const connection = await imaps.connect(config);
      await connection.openBox('INBOX');

      // Fetch emails from the last 3 days
      const delay = 3 * 24 * 3600 * 1000; // 3 days
      const sinceDate = new Date(Date.now() - delay);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedSinceDate = `${sinceDate.getDate()}-${months[sinceDate.getMonth()]}-${sinceDate.getFullYear()}`;
      
      const searchCriteria = [['SINCE', formattedSinceDate]];
      const fetchOptions = {
        bodies: [''],
        markSeen: false,
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      let syncedCount = 0;

      for (let item of messages) {
        const part = item.parts.find((p) => p.which === '');
        if (!part) continue;

        const parsed = await simpleParser(part.body);
        const messageId = parsed.messageId || String(item.attributes.uid);

        // Check if message already exists in DB
        const exists = await prisma.emailMessage.findFirst({
          where: { messageId, emailAccountId: account.id },
        });

        if (exists) continue;

        const fromAddress = parsed.from?.value[0]?.address || account.email;
        const fromName = parsed.from?.value[0]?.name || '';
        const toAddresses = parsed.to
          ? (Array.isArray(parsed.to) ? parsed.to : [parsed.to]).flatMap((t: any) => t.value.map((v: any) => v.address))
          : [];

        // Determine if this is actually a sent email that somehow ended up in INBOX
        const direction = fromAddress.toLowerCase() === account.email.toLowerCase() ? 'outbound' : 'inbound';
        
        // Skip outbound if it's from us, to avoid duplicating sent items
        if (direction === 'outbound') continue;

        await prisma.emailMessage.create({
          data: {
            companyId,
            emailAccountId: account.id,
            messageId,
            subject: parsed.subject || '(No Subject)',
            from: fromAddress,
            fromName: fromName,
            to: toAddresses,
            body: parsed.html || parsed.textAsHtml || parsed.text || '',
            snippet: parsed.text ? parsed.text.substring(0, 150) : '',
            direction: 'inbound',
            read: false,
            folder: 'inbox',
            receivedAt: parsed.date || new Date(),
          },
        });

        syncedCount++;
      }

      connection.end();

      // Update last sync time
      await prisma.emailAccount.update({
        where: { id: account.id },
        data: { lastSyncAt: new Date() },
      });

      return { success: true, syncedCount };
    } catch (error: any) {
      console.error('IMAP Sync Error:', error);
      throw new Error('Failed to sync emails: ' + error.message);
    } finally {
      activeSyncs.delete(accountId);
    }
  }
}
