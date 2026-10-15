import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleGenericWebhook = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }

    const data = req.method === 'GET' ? req.query : req.body;

    // A generic webhook tries to guess the common field names
    const name = data.name || data.first_name || data.fullName || data.sender_name || 'Website Lead';
    const phone = data.phone || data.mobile || data.contact || data.phone_number || null;
    const email = data.email || data.email_address || null;
    const city = data.city || data.location || null;
    
    // Convert the entire payload to string to save in notes if fields don't match
    const rawData = JSON.stringify(data, null, 2);

    const newLead = await prisma.lead.create({
      data: {
        companyId,
        name: name as string,
        phone: phone as string,
        email: email as string,
        city: city as string,
        notes: `Raw Webhook Data:\n${rawData}`,
        source: data.source || 'Website',
        leadType: 'Inbound',
        status: 'New',
        priority: 'Normal'
      }
    });

    console.log(`Generic Webhook lead saved successfully for company ${companyId}: ${newLead.id}`);

    // Return JSON so Pabbly/Zapier recognizes it
    res.status(200).json({ success: true, leadId: newLead.id });
  } catch (error: any) {
    console.error('Generic Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
