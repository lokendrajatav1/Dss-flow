import { Client, LocalAuth, Message as WAMessage } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import { prisma } from '../../lib/db';
import { getIO } from '../../socket';

class WhatsAppService {
  private client: Client;
  private qrCodeUrl: string | null = null;
  private status: 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'CONNECTED' = 'DISCONNECTED';
  private connectionInfo: any = null;
  private processedMessageIds = new Set<string>();
  private isReinitializing = false;

  constructor() {
    this.client = this.createClient();
    this.setupListeners();
  }

  private createClient() {
    // Use a unique userDataDir to avoid browser session conflicts on restart.
    // LocalAuth caches the session under the default .wwebjs_auth dir; when the
    // server restarts (e.g. ts-node-dev) an old browser may still hold that
    // session, causing "The browser is already running" errors. A unique path
    // lets the app cleanly start a new session each time.
    const userDataDir = `.wwebjs_auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return new Client({
      authStrategy: new LocalAuth({
        dataPath: userDataDir,
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        // Allow override via env for custom Chromium paths
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      }
    });
  }

  private setupListeners() {
    this.client.on('qr', async (qr) => {
      console.log('QR Code generated');
      this.status = 'QR_READY';
      this.qrCodeUrl = await qrcode.toDataURL(qr);
    });

    this.client.on('ready', () => {
      console.log('WhatsApp Client is ready!');
      this.status = 'CONNECTED';
      this.qrCodeUrl = null;
      this.connectionInfo = this.client.info;
      this.isReinitializing = false;
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp Authenticated');
    });

    this.client.on('auth_failure', msg => {
      console.error('WhatsApp Auth failure', msg);
      this.status = 'DISCONNECTED';
    });

    const handleMessage = async (msg: WAMessage) => {
      try {
        if (!msg.from || !msg.to) return;
        if (msg.from === 'status@broadcast') return;

        // Determine basic chat ID
        let actualChatId = msg.fromMe ? msg.to : msg.from;
        if (!actualChatId) return;

        // Extract real phone number for @lid
        if (actualChatId.includes('@lid')) {
          try {
            const contact = await this.client.getContactById(actualChatId);

            if (contact && contact.id && contact.id.server === 'c.us') {
              actualChatId = contact.id._serialized;
            } else if (contact && contact.number && !contact.number.includes('lid')) {
              actualChatId = `${contact.number}@c.us`;
            } else {
              await new Promise(r => setTimeout(r, 1000));
              const chat = await msg.getChat();
              if (chat && chat.id && chat.id.server === 'c.us') {
                actualChatId = chat.id._serialized;
              }
            }
          } catch (e) {
            console.warn('Could not resolve @lid:', actualChatId);
            this.checkAndRecoverError(e);
          }
        }

        if (actualChatId.includes('@lid') && !msg.body && !msg.hasMedia) return;

        const logStr = `[Sync] ID: ${msg.id?.id} (fromMe: ${msg.fromMe}) - actualChat: ${actualChatId} | body: ${msg.body}\n`;
        console.log(logStr);

        // Deduplicate
        if (this.processedMessageIds.has(msg.id.id)) return;
        this.processedMessageIds.add(msg.id.id);

        if (this.processedMessageIds.size > 1000) {
          const arr = Array.from(this.processedMessageIds);
          this.processedMessageIds = new Set(arr.slice(arr.length - 500));
        }

        const company = await prisma.company.findFirst();
        if (!company) return;

        let conversation = await prisma.conversation.findFirst({
          where: { companyId: company.id, channel: 'whatsapp', status: actualChatId }
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              companyId: company.id,
              channel: 'whatsapp',
              status: actualChatId,
            }
          });
        }

        const savedMsg = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            direction: msg.fromMe ? 'outbound' : 'inbound',
            content: msg.body,
            ack: msg.fromMe ? 1 : 0,
            whatsappMsgId: msg.id?.id || null,
          }
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() }
        });

        // Smart conversation routing and analysis
        await this.processIncomingMessage(conversation, msg, actualChatId);

        const io = getIO();
        if (io) {
          io.to(conversation.id).emit('new_message', savedMsg);
          io.emit('conversations_updated');
        }
      } catch (err) {
        console.error('Error handling message', err);
      }
    };

    this.client.on('message', handleMessage);
    this.client.on('message_create', handleMessage);

    this.client.on('message_ack', async (msg, ack) => {
      try {
        const msgId = msg.id?.id;
        if (!msgId) return;
        const updated = await prisma.message.updateMany({
          where: { whatsappMsgId: msgId },
          data: { ack }
        });
        if (updated.count > 0) {
          const dbMsg = await prisma.message.findFirst({ where: { whatsappMsgId: msgId } });
          if (dbMsg) {
            const io = getIO();
            if (io) io.to(dbMsg.conversationId).emit('message_ack', { id: dbMsg.id, ack });
          }
        }
      } catch (err) {
        console.error('Error handling message_ack', err);
      }
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp Client was logged out', reason);
      this.status = 'DISCONNECTED';
      this.connectionInfo = null;
      this.qrCodeUrl = null;
    });
  }

  // Smart conversation routing and analysis
  private async processIncomingMessage(conversation: any, msg: WAMessage, actualChatId: string) {
    try {
      // Get company
      const company = await prisma.company.findFirst();
      if (!company) return;

      // Get or create contact
      const phoneNumber = actualChatId.includes('@c.us') ? actualChatId.replace('@c.us', '') : actualChatId;
      let contact = await prisma.contact.findFirst({
        where: { companyId: company.id, phone: phoneNumber }
      });

      if (!contact) {
        contact = await prisma.contact.create({
          data: {
            companyId: company.id,
            name: msg.from ? msg.from.replace('@c.us', '') : 'Unknown',
            phone: phoneNumber,
            lastMessageAt: new Date(),
            status: 'NEW'
          }
        });
      }

      // Update contact
      await prisma.contact.update({
        where: { id: contact.id },
        data: { lastMessageAt: new Date() }
      });

      // Smart routing based on message content and contact
      await this.routeMessage(conversation, contact, msg);

      // Check for lead qualification triggers
      await this.checkLeadQualificationTriggers(conversation, contact, msg);

    } catch (err) {
      console.error('Error in processIncomingMessage:', err);
    }
  }

  // Smart message routing based on content and contact
  private async routeMessage(conversation: any, contact: any, msg: WAMessage) {
    const company = await prisma.company.findFirst();
    if (!company) return;

    const messageContent = msg.body?.toLowerCase() || '';
    const contactName = contact.name?.toLowerCase() || '';

    // Determine conversation category based on content
    let category = 'GENERAL';
    let priority = 'MEDIUM';

    // Lead qualification keywords
    const leadKeywords = ['price', 'cost', 'buy', 'purchase', 'demo', 'trial', 'quote', 'pricing', 'interested', 'want', 'need'];
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'immediately', 'now', 'today', 'quick'];
    const supportKeywords = ['problem', 'issue', 'bug', 'error', 'help', 'support', 'technical'];
    const salesKeywords = ['sale', 'discount', 'offer', 'deal', 'promotion', 'special'];

    if (leadKeywords.some(keyword => messageContent.includes(keyword))) {
      category = 'LEAD';
      priority = urgentKeywords.some(keyword => messageContent.includes(keyword)) ? 'HIGH' : 'MEDIUM';
    } else if (supportKeywords.some(keyword => messageContent.includes(keyword))) {
      category = 'SUPPORT';
      priority = urgentKeywords.some(keyword => messageContent.includes(keyword)) ? 'HIGH' : 'LOW';
    } else if (salesKeywords.some(keyword => messageContent.includes(keyword))) {
      category = 'SALES';
      priority = 'MEDIUM';
    } else if (urgentKeywords.some(keyword => messageContent.includes(keyword))) {
      category = 'URGENT';
      priority = 'HIGH';
    }

    // Update conversation with routing info
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        category,
        priority,
        contactName: contact.name,
        lastMessageAt: new Date()
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        companyId: company.id,
        type: 'CONVERSATION',
        title: `WhatsApp Message - ${category}`,
        description: `Message from ${contact.name}: ${msg.body?.substring(0, 100)}...`,
        metadata: {
          conversationId: conversation.id,
          contactId: contact.id,
          category,
          priority,
          messageId: msg.id?.id
        },
        performedById: null, // System automated
        leadId: contact.leadId || null,
        customerId: contact.customerId || null,
        dealId: null
      }
    });

    // Smart routing to appropriate team member
    await this.routeToTeam(conversation, contact, category, priority);
  }

  // Route conversation to appropriate team member based on category and priority
  private async routeToTeam(conversation: any, contact: any, category: string, priority: string) {
    const company = await prisma.company.findFirst();
    if (!company) return;

    // Find available team members for the category
    let assignedToId: string | null = null;

    switch (category) {
      case 'LEAD':
        // Route to sales team for lead qualification
        const salesUsers = await prisma.user.findMany({
          where: {
            companyId: company.id,
            role: { name: 'Sales Executive' }
          }
        });
        if (salesUsers.length > 0) {
          assignedToId = salesUsers[0].id;
        }
        break;

      case 'SUPPORT':
        // Route to support team
        const supportUsers = await prisma.user.findMany({
          where: {
            companyId: company.id,
            role: { name: 'Support User' }
          }
        });
        if (supportUsers.length > 0) {
          assignedToId = supportUsers[0].id;
        }
        break;

      case 'SALES':
        // Route to sales manager for special offers
        const salesManagerUsers = await prisma.user.findMany({
          where: {
            companyId: company.id,
            role: { name: 'Sales Manager' }
          }
        });
        if (salesManagerUsers.length > 0) {
          assignedToId = salesManagerUsers[0].id;
        }
        break;

      case 'URGENT':
        // Route to available team member (highest priority)
        const allUsers = await prisma.user.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: 'desc' }
        });
        if (allUsers.length > 0) {
          assignedToId = allUsers[0].id;
        }
        break;

      default:
        // Default to sales executive
        const defaultUsers = await prisma.user.findMany({
          where: {
            companyId: company.id,
            role: { name: 'Sales Executive' }
          }
        });
        if (defaultUsers.length > 0) {
          assignedToId = defaultUsers[0].id;
        }
    }

    // Update conversation with assignment
    if (assignedToId) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          // assignedToId, // TODO: Add assignedToId to Conversation model
          status: 'ASSIGNED'
        }
      });
    }
  }

  // Check for lead qualification triggers
  private async checkLeadQualificationTriggers(conversation: any, contact: any, msg: WAMessage) {
    const company = await prisma.company.findFirst();
    if (!company) return;

    const messageContent = msg.body?.toLowerCase() || '';
    const contactName = contact.name?.toLowerCase() || '';

    // Check if this message indicates a qualified lead
    const qualificationTriggers = [
      'interested in demo',
      'want to buy',
      'need pricing',
      'interested in trial',
      'want to purchase',
      'interested in quote'
    ];

    const isQualified = qualificationTriggers.some(trigger =>
      messageContent.includes(trigger)
    ) || contactName.includes('ceo') || contactName.includes('director') ||
      contactName.includes('manager') || contactName.includes('owner');

    if (isQualified) {
      // Create or update lead
      let lead = await prisma.lead.findFirst({
        where: {
          companyId: company.id,
          phone: contact.phone
        }
      });

      if (!lead) {
        // Create new lead
        lead = await prisma.lead.create({
          data: {
            companyId: company.id,
            name: contact.name,
            phone: contact.phone,
            email: contact.email || null,
            source: 'WhatsApp',
            status: 'New',
            priority: 'High',
            assignedToId: conversation.assignedToId || null,
            groupId: null,
            funnelId: null
          }
        });

        // Update contact with lead reference
        // TODO: Add leadId to Contact model
        /*
        await prisma.contact.update({
          where: { id: contact.id },
          data: { leadId: lead.id }
        });
        */
      }

      // Update lead status to indicate qualification
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: 'Qualified',
          qualificationData: {
            source: 'WhatsApp',
            messageId: msg.id?.id,
            qualificationDate: new Date().toISOString(),
            qualificationReason: 'High intent message detected'
          }
        }
      });

      // Create activity for lead qualification
      await prisma.activity.create({
        data: {
          companyId: company.id,
          type: 'LEAD_QUALIFICATION',
          title: 'Lead Qualified from WhatsApp',
          description: `Lead ${contact.name} qualified based on WhatsApp message: ${msg.body?.substring(0, 100)}...`,
          metadata: {
            conversationId: conversation.id,
            contactId: contact.id,
            leadId: lead.id,
            qualificationSource: 'WhatsApp'
          },
          performedById: null,
          leadId: lead.id,
          customerId: null,
          dealId: null
        }
      });

      // Notify team
      const io = getIO();
      if (io) {
        io.emit('lead_qualified', {
          leadId: lead.id,
          contactName: contact.name,
          conversationId: conversation.id
        });
      }
    }
  }

  // Auto-recovery mechanism for detached frames
  private async checkAndRecoverError(err: any) {
    if (this.isReinitializing) return;
    const errorMsg = err?.message || err?.toString() || '';
    if (
      errorMsg.includes('detached Frame') ||
      errorMsg.includes('Target closed') ||
      errorMsg.includes('Session closed') ||
      errorMsg.includes('Execution context was destroyed')
    ) {
      console.error('CRITICAL PUPPETEER ERROR DETECTED:', errorMsg);
      console.log('Initiating WhatsApp client auto-recovery...');

      this.isReinitializing = true;
      this.status = 'INITIALIZING';

      try {
        await this.client.destroy();
      } catch (e) {
        console.log('Old client instance destroy failed (already dead).');
      }

      // Wait a moment before recreating
      setTimeout(async () => {
        try {
          this.client = this.createClient();
          this.setupListeners();
          await this.client.initialize();
        } catch (e) {
          console.error('Failed to auto-recover WhatsApp client', e);
          this.status = 'DISCONNECTED';
          this.isReinitializing = false;
        }
      }, 3000);
    }
  }

  public async initialize() {
    if (this.status === 'DISCONNECTED') {
      this.status = 'INITIALIZING';
      try {
        await this.client.initialize();
      } catch (err) {
        console.error('Failed to initialize WhatsApp client', err);
        this.status = 'DISCONNECTED';
        this.checkAndRecoverError(err);
      }
    }
  }

  public getStatus() {
    return {
      status: this.status,
      qrCodeUrl: this.qrCodeUrl,
      info: this.connectionInfo
    };
  }

  public async sendMessage(to: string, content: string, companyId: string) {
    if (this.status !== 'CONNECTED') {
      throw new Error('WhatsApp is not connected');
    }
    const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
    try {
      await this.client.sendMessage(chatId, content);
      return { success: true };
    } catch (err) {
      this.checkAndRecoverError(err);
      throw err;
    }
  }

  public async getContactById(id: string) {
    try {
      return await this.client.getContactById(id);
    } catch (err) {
      this.checkAndRecoverError(err);
      throw err;
    }
  }

  public async getChatById(id: string) {
    try {
      return await this.client.getChatById(id);
    } catch (err) {
      this.checkAndRecoverError(err);
      throw err;
    }
  }

  public async getProfilePicUrl(id: string) {
    try {
      return await this.client.getProfilePicUrl(id);
    } catch (err) {
      this.checkAndRecoverError(err);
      throw err;
    }
  }

  public async isRegisteredUser(phone: string): Promise<boolean> {
    const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    try {
      return await this.client.isRegisteredUser(chatId);
    } catch (err) {
      this.checkAndRecoverError(err);
      throw err;
    }
  }

  public async logout() {
    if (this.status === 'CONNECTED') {
      await this.client.logout();
      this.status = 'DISCONNECTED';
    }
  }

  public async destroy() {
    try {
      await this.client.destroy();
    } catch (_) { }
    this.status = 'DISCONNECTED';
  }
}

export const whatsappService = new WhatsAppService();
