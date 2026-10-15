import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleSulekhaWebhook = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }

    const data = req.method === 'GET' ? req.query : req.body;

    const {
      LeadId,
      Name,
      Mobile,
      Email,
      Category,
      City,
      Location
    } = data;

    if (!Name && !Mobile) {
      return res.status(400).json({ success: false, message: 'Name or Mobile is required' });
    }

    const newLead = await prisma.lead.create({
      data: {
        companyId,
        name: (Name as string) || 'Sulekha Lead',
        phone: (Mobile as string) || null,
        email: (Email as string) || null,
        city: (City as string) || null,
        address: (Location as string) || null,
        industry: (Category as string) || null,
        notes: `Sulekha Lead ID: ${LeadId || 'N/A'}`,
        source: 'Sulekha',
        leadType: 'Inbound',
        status: 'New',
        priority: 'High'
      }
    });

    console.log(`Sulekha lead saved successfully for company ${companyId}: ${newLead.id}`);

    res.status(200).send('Success');
  } catch (error: any) {
    console.error('Sulekha Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
};
