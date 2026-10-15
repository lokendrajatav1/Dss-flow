import { Request, Response } from 'express';
import { whatsappService } from './whatsapp.service';
import { prisma } from '../../lib/db';

export const getStatus = async (req: Request, res: Response) => {
  try {
    const status = whatsappService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
};

export const initialize = async (req: Request, res: Response) => {
  try {
    whatsappService.initialize();
    res.json({ message: 'Initialization started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    await whatsappService.logout();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const company = await prisma.company.findFirst();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    
    const conversations = await prisma.conversation.findMany({
      where: { 
        companyId: company.id,
        NOT: [
          { status: { contains: '@lid' } },
          { status: 'status@broadcast' }
        ]
      },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { timestamp: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { to, content } = req.body;
    const company = await prisma.company.findFirst();
    if (!company) return res.status(404).json({ error: 'Company not found' });
    
    const message = await whatsappService.sendMessage(to, content, company.id);
    res.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Check if a phone number has WhatsApp registered
export const checkWhatsApp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    if (whatsappService.getStatus().status !== 'CONNECTED') {
      return res.status(503).json({ error: 'WhatsApp not connected' });
    }
    const isRegistered = await whatsappService.isRegisteredUser(phone);
    res.json({ phone, isRegistered });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check WhatsApp' });
  }
};


// In-memory cache: contactId -> { name, profilePicUrl, fetchedAt, isReadOnly }
const contactCache = new Map<string, { name: string; profilePicUrl: string | null; fetchedAt: number; isReadOnly?: boolean }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Sequential queue to avoid hammering WhatsApp with simultaneous pic requests
let picFetchQueue = Promise.resolve();

const fetchProfilePicQueued = (targetId: string): Promise<string | null> => {
  return new Promise((resolve) => {
    picFetchQueue = picFetchQueue.then(async () => {
      try {
        await whatsappService.getChatById(targetId).catch(() => null);
        const url = await whatsappService.getProfilePicUrl(targetId);
        resolve(url ?? null);
      } catch (_err) {
        resolve(null);
      }
      // Small delay between requests to avoid WhatsApp rate-limit
      await new Promise(r => setTimeout(r, 300));
    });
  });
};

export const getContactInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contactId = id.includes('@') ? id : `${id}@c.us`;

    // Serve from cache if fresh
    const cached = contactCache.get(contactId);
    if (cached && (Date.now() - cached.fetchedAt) < CACHE_TTL_MS) {
      return res.json({ name: cached.name, profilePicUrl: cached.profilePicUrl });
    }

    if (whatsappService.getStatus().status !== 'CONNECTED') {
      return res.json({ name: id.replace('@c.us', ''), profilePicUrl: null });
    }

    const contact = await whatsappService.getContactById(contactId);
    const targetId = contact?.id?._serialized || contactId;
    const name = contact?.name || contact?.pushname || contact?.verifiedName || id.replace('@c.us', '');

    const profilePicUrl = await fetchProfilePicQueued(targetId);

    let isReadOnly = false;
    try {
      const chat = await whatsappService.getChatById(contactId);
      isReadOnly = chat?.isReadOnly || false;
    } catch (err) {
      // Ignore chat fetch errors
    }

    // Store in cache
    contactCache.set(contactId, { name, profilePicUrl, fetchedAt: Date.now(), isReadOnly });

    res.json({ name, profilePicUrl, isReadOnly });
  } catch (error) {
    console.error('Failed to fetch contact info:', error);
    res.status(500).json({ error: 'Failed to fetch contact info' });
  }
};
