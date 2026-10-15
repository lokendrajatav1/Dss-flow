import { PrismaClient } from '@prisma/client';
import { ImapService } from './src/modules/email/imap.service';

const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.emailAccount.findMany();
  if (accounts.length === 0) {
    console.log('No email accounts found in DB.');
    return;
  }
  
  const account = accounts[0];
  console.log(`Found account: ${account.email} (Provider: ${account.provider})`);

  try {
    console.log('Testing IMAP connection and sync...');
    const result = await ImapService.syncIncomingEmails(account.companyId, account.id);
    console.log('Sync result:', result);

    const emails = await prisma.emailMessage.findMany({
      where: { emailAccountId: account.id },
      orderBy: { receivedAt: 'desc' },
      take: 5
    });

    console.log('\nTop 5 recent emails in DB for this account:');
    emails.forEach(e => console.log(`- [${e.receivedAt}] ${e.subject} (From: ${e.from})`));
  } catch (err: any) {
    console.error('Error during test:', err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
