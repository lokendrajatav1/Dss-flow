import nodemailer from 'nodemailer';

import { prisma } from '../../lib/db';

export class EmailService {
  // ─── Email Accounts ────────────────────────────────────────────

  static async getEmailAccounts(companyId: string) {
    return prisma.emailAccount.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getEmailAccount(companyId: string, accountId: string) {
    return prisma.emailAccount.findFirst({
      where: { id: accountId, companyId },
    });
  }

  static async createEmailAccount(companyId: string, data: any) {
    const existing = await prisma.emailAccount.findFirst({
      where: { companyId, email: data.email },
    });

    if (existing) {
      throw new Error('This email account is already connected.');
    }

    return prisma.emailAccount.create({
      data: {
        companyId,
        provider: data.provider,
        email: data.email,
        accessToken: data.accessToken,
        refreshToken: data.provider === 'other' ? JSON.stringify({ imapHost: data.imapHost, smtpHost: data.smtpHost }) : data.refreshToken,
        status: 'connected',
        syncEnabled: data.syncEnabled ?? false,
        syncInterval: data.syncInterval ?? 300,
      },
    });
  }

  static async updateEmailAccount(companyId: string, accountId: string, data: any) {
    return prisma.emailAccount.update({
      where: { id: accountId },
      data: {
        ...(data.accessToken !== undefined && { accessToken: data.accessToken }),
        ...(data.refreshToken !== undefined && { refreshToken: data.refreshToken }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.syncEnabled !== undefined && { syncEnabled: data.syncEnabled }),
        ...(data.syncInterval !== undefined && { syncInterval: data.syncInterval }),
        updatedAt: new Date(),
      },
    });
  }

  static async deleteEmailAccount(companyId: string, accountId: string) {
    await prisma.emailMessage.deleteMany({
      where: { emailAccountId: accountId, companyId },
    });
    return prisma.emailAccount.delete({
      where: { id: accountId, companyId },
    });
  }

  // ─── Email Messages ────────────────────────────────────────────

  static async getMessages(companyId: string, filters: any = {}) {
    const { accountId, direction, folder, search, searchIn, dateRange, page = 1, pageSize = 20 } = filters;

    const where: any = { companyId };
    if (accountId) where.emailAccountId = accountId;
    if (direction) where.direction = direction;
    if (folder && folder !== 'all') where.folder = folder;

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      if (dateRange === '7days') {
        where.receivedAt = { gte: new Date(now.setDate(now.getDate() - 7)) };
      } else if (dateRange === '30days') {
        where.receivedAt = { gte: new Date(now.setDate(now.getDate() - 30)) };
      }
    }

    if (search) {
      let parsedSearchIn: any = { sender: true, recipient: true, subject: true, body: true };
      if (searchIn) {
        try { parsedSearchIn = JSON.parse(searchIn); } catch (e) {}
      }

      const orConditions = [];
      
      if (parsedSearchIn.sender) {
        orConditions.push({ from: { contains: search, mode: 'insensitive' } });
        orConditions.push({ fromName: { contains: search, mode: 'insensitive' } });
      }
      if (parsedSearchIn.subject) {
        orConditions.push({ subject: { contains: search, mode: 'insensitive' } });
      }
      if (parsedSearchIn.body) {
        orConditions.push({ snippet: { contains: search, mode: 'insensitive' } });
        orConditions.push({ body: { contains: search, mode: 'insensitive' } });
      }
      // For recipients (to array), Prisma doesn't support partial match on String[] easily.
      // We will rely on exact match or skip it, but exact match is via `has` which might be too strict.
      // Adding it as exact match fallback.
      if (parsedSearchIn.recipient) {
         orConditions.push({ to: { has: search } });
      }

      if (orConditions.length > 0) {
        where.OR = orConditions;
      }
    }

    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;

    const total = await prisma.emailMessage.count({ where });
    const messages = await prisma.emailMessage.findMany({
      where,
      include: {
        emailAccount: { select: { email: true, provider: true } },
        lead: { select: { name: true } },
        customer: { select: { name: true } },
        deal: { select: { title: true } },
      },
      orderBy: { receivedAt: 'desc' },
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
    });

    const unreadCount = await prisma.emailMessage.count({
      where: { ...where, read: false },
    });

    return { messages, total, unreadCount, page: pageNum, pageSize: pageSizeNum, totalPages: Math.ceil(total / pageSizeNum) };
  }

  static async getMessage(companyId: string, messageId: string) {
    return prisma.emailMessage.findFirst({
      where: { id: messageId, companyId },
      include: {
        emailAccount: { select: { email: true, provider: true } },
        lead: true,
        customer: true,
        deal: true,
      },
    });
  }

  static async createMessage(companyId: string, data: any) {
    return prisma.emailMessage.create({
      data: {
        companyId,
        emailAccountId: data.emailAccountId,
        messageId: data.messageId,
        subject: data.subject,
        from: data.from,
        fromName: data.fromName,
        to: data.to || [],
        cc: data.cc || [],
        bcc: data.bcc || [],
        body: data.body,
        snippet: data.snippet,
        direction: data.direction,
        read: data.read ?? false,
        folder: data.folder || 'inbox',
        receivedAt: data.receivedAt ? new Date(data.receivedAt) : null,
        sentAt: data.sentAt ? new Date(data.sentAt) : null,
        attachments: data.attachments ?? null,
        leadId: data.leadId ?? null,
        customerId: data.customerId ?? null,
        dealId: data.dealId ?? null,
      },
    });
  }

  static async markRead(companyId: string, messageId: string, read: boolean) {
    return prisma.emailMessage.update({
      where: { id: messageId },
      data: { read },
    });
  }

  static async markStarred(companyId: string, messageId: string, starred: boolean) {
    return prisma.emailMessage.update({
      where: { id: messageId },
      data: { starred },
    });
  }

  static async updateFolder(companyId: string, messageId: string, folder: string) {
    return prisma.emailMessage.update({
      where: { id: messageId, companyId },
      data: { folder },
    });
  }

  static async deleteMessage(companyId: string, messageId: string) {
    const message = await prisma.emailMessage.findFirst({
      where: { id: messageId, companyId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.folder === 'trash') {
      return prisma.emailMessage.delete({
        where: { id: messageId },
      });
    } else {
      return prisma.emailMessage.update({
        where: { id: messageId },
        data: { folder: 'trash' },
      });
    }
  }

  static async emptyTrash(companyId: string, accountId?: string) {
    const where: any = { companyId, folder: 'trash' };
    if (accountId && accountId !== 'all') {
      where.emailAccountId = accountId;
    }
    return prisma.emailMessage.deleteMany({ where });
  }

  static async sendEmail(companyId: string, data: any) {
    const account = await prisma.emailAccount.findFirst({
      where: { id: data.emailAccountId, companyId },
    });

    if (!account) {
      throw new Error('Email account not found or not connected');
    }

    let transporter;
    if (account.provider === 'gmail') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: account.email,
          pass: account.accessToken || undefined,
        },
      });
    } else if (account.provider === 'outlook') {
      transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: account.email,
          pass: account.accessToken || undefined,
        },
      });
    } else if (account.provider === 'other') {
      let settings = { smtpHost: '' };
      try { settings = JSON.parse(account.refreshToken || '{}'); } catch (e) { }

      transporter = nodemailer.createTransport({
        host: settings.smtpHost || account.email.split('@')[1],
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: account.email,
          pass: account.accessToken || undefined,
        },
      });
    } else {
      throw new Error(`Unsupported email provider: ${account.provider}`);
    }

    let htmlContent = data.html || data.text || '';
    const attachments = [...(data.attachments || [])];

    // Convert inline base64 images to CID attachments
    htmlContent = htmlContent.replace(/<img([^>]+)src="data:image\/([a-zA-Z0-9]+);base64,([^"]+)"([^>]*)>/g, (fullMatch: string, beforeSrc: string, ext: string, base64Data: string, afterSrc: string) => {
      const cid = `image-${Date.now()}-${Math.random().toString(36).substring(7)}@crm`;
      attachments.push({
        filename: `inline-image.${ext}`,
        content: base64Data,
        encoding: 'base64',
        cid: cid
      });
      return `<img${beforeSrc}src="cid:${cid}"${afterSrc}>`;
    });

    const info = await transporter.sendMail({
      from: `"${data.fromName || account.email}" <${account.email}>`,
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      text: data.text || '',
      html: htmlContent,
      attachments: attachments,
    });

    // Save sent message to database
    const sentMessage = await prisma.emailMessage.create({
      data: {
        companyId,
        emailAccountId: account.id,
        messageId: info.messageId,
        subject: data.subject,
        from: account.email,
        fromName: data.fromName || null,
        to: Array.isArray(data.to) ? data.to : [data.to],
        cc: Array.isArray(data.cc) ? data.cc : (data.cc ? [data.cc] : []),
        bcc: Array.isArray(data.bcc) ? data.bcc : (data.bcc ? [data.bcc] : []),
        body: data.html || data.text || '',
        snippet: (data.text || data.html || '').replace(/<[^>]*>?/gm, '').substring(0, 100),
        direction: 'outbound',
        read: true,
        folder: 'sent',
        sentAt: new Date(),
        receivedAt: new Date(),
        attachments: attachments,
      },
    });

    return sentMessage;
  }

  // ─── Sync Helpers ──────────────────────────────────────────────

  static async updateLastSync(companyId: string, accountId: string) {
    return prisma.emailAccount.update({
      where: { id: accountId },
      data: { lastSyncAt: new Date() },
    });
  }
}
