import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleTradeIndiaWebhook = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }

    const data = req.method === 'GET' ? req.query : req.body;

    // TradeIndia typical fields
    const {
      sender_name,
      sender_mobile,
      sender_email,
      subject,
      message,
      sender_city,
      inquiry_id
    } = data;

    if (!sender_name && !sender_mobile) {
      return res.status(400).json({ success: false, message: 'Name or Mobile is required' });
    }

    const newLead = await prisma.lead.create({
      data: {
        companyId,
        name: (sender_name as string) || 'TradeIndia Lead',
        phone: (sender_mobile as string) || null,
        email: (sender_email as string) || null,
        city: (sender_city as string) || null,
        notes: `Product: ${subject || 'N/A'}\nMessage: ${message || 'N/A'}\nTradeIndia ID: ${inquiry_id || 'N/A'}`,
        source: 'TradeIndia',
        leadType: 'Inbound',
        status: 'New',
        priority: 'High'
      }
    });

    console.log(`TradeIndia lead saved successfully for company ${companyId}: ${newLead.id}`);

    res.status(200).send('Success');
  } catch (error: any) {
    console.error('TradeIndia Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
};
