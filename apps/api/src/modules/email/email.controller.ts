import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { EmailService } from './email.service';
import { ImapService } from './imap.service';

// ─── Email Accounts ────────────────────────────────────────────

export const getEmailAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const accounts = await EmailService.getEmailAccounts(companyId);
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmailAccount = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const account = await EmailService.getEmailAccount(companyId, id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createEmailAccount = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const account = await EmailService.createEmailAccount(companyId, req.body);
    res.status(201).json(account);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmailAccount = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const account = await EmailService.updateEmailAccount(companyId, id, req.body);
    res.json(account);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmailAccount = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await EmailService.deleteEmailAccount(companyId, id);
    res.json({ message: 'Account deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncEmails = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const result = await ImapService.syncIncomingEmails(companyId, id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Email Messages ────────────────────────────────────────────

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const result = await EmailService.getMessages(companyId, req.query as any);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessage = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const message = await EmailService.getMessage(companyId, id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const message = await EmailService.createMessage(companyId, req.body);
    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markRead = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const { read } = req.body;
    const message = await EmailService.markRead(companyId, id, read);
    res.json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markStarred = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const { starred } = req.body;
    const message = await EmailService.markStarred(companyId, id, starred);
    res.json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFolder = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const { folder } = req.body;
    const message = await EmailService.updateFolder(companyId, id, folder);
    res.json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await EmailService.deleteMessage(companyId, id);
    res.json({ message: 'Message deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const emptyTrash = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const accountId = req.query.accountId as string;
    await EmailService.emptyTrash(companyId, accountId);
    res.json({ message: 'Trash emptied successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendEmail = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const sentMessage = await EmailService.sendEmail(companyId, req.body);
    res.status(201).json(sentMessage);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
