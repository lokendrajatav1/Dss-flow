import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleJustdialWebhook = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }

    // Justdial typically sends data in Query Parameters (GET) or Body (POST)
    const data = req.method === 'GET' ? req.query : req.body;

    const {
      leadid,
      name,
      mobile,
      email,
      category,
      city,
      area
    } = data;

    if (!name && !mobile) {
      return res.status(400).json({ success: false, message: 'Name or Mobile is required' });
    }

    // Save lead in the database
    const newLead = await prisma.lead.create({
      data: {
        companyId,
        name: (name as string) || 'Justdial Lead',
        phone: (mobile as string) || null,
        email: (email as string) || null,
        city: (city as string) || null,
        address: (area as string) || null,
        industry: (category as string) || null,
        source: 'Justdial',
        leadType: 'Inbound',
        status: 'New',
        priority: 'High',
        notes: `Justdial Lead ID: ${leadid || 'N/A'}`
      }
    });

    console.log(`Justdial lead saved successfully for company ${companyId}: ${newLead.id}`);

    // Justdial expects a simple success response
    res.status(200).send('Success');
  } catch (error: any) {
    console.error('Justdial Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
};
