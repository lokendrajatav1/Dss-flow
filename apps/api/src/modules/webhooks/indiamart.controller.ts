import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleIndiamartWebhook = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }

    const data = req.method === 'GET' ? req.query : req.body;

    const {
      sender_name,
      sender_mobile,
      sender_email,
      subject,
      query_message,
      sender_city,
      UNIQUE_QUERY_ID
    } = data;

    if (!sender_name && !sender_mobile) {
      return res.status(400).json({ success: false, message: 'Name or Mobile is required' });
    }

    const newLead = await prisma.lead.create({
      data: {
        companyId,
        name: (sender_name as string) || 'IndiaMART Lead',
        phone: (sender_mobile as string) || null,
        email: (sender_email as string) || null,
        city: (sender_city as string) || null,
        notes: `Product/Subject: ${subject || 'N/A'}\nMessage: ${query_message || 'N/A'}\nIndiaMART Lead ID: ${UNIQUE_QUERY_ID || 'N/A'}`,
        source: 'IndiaMART',
        leadType: 'Inbound',
        status: 'New',
        priority: 'High'
      }
    });

    console.log(`IndiaMART lead saved successfully for company ${companyId}: ${newLead.id}`);

    res.status(200).send('Success');
  } catch (error: any) {
    console.error('IndiaMART Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
};
