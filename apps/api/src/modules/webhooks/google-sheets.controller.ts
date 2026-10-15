import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleGoogleSheetsWebhook = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }

    const payload = req.method === 'GET' ? req.query : req.body;
    
    // The payload is expected to have { data: [...], groupId, funnelId, assignedTo: [...] }
    const records = Array.isArray(payload.data) ? payload.data : [];
    const groupId = payload.groupId || null;
    const funnelId = payload.funnelId || null;
    const assignedToIds = Array.isArray(payload.assignedTo) ? payload.assignedTo : [];

    if (records.length === 0) {
      return res.status(200).json({ success: true, message: 'No records to process' });
    }

    let successCount = 0;

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      if (!row || typeof row !== 'object') continue;

      const name = row['name'] || 'Google Sheet Lead';
      const phone = row['phone'] ? String(row['phone']) : null;
      const email = row['email'] ? String(row['email']) : null;
      
      const customData: any = {};
      
      let assignedToId = null;
      if (assignedToIds.length > 0) {
        // Round Robin / Sequential assignment
        assignedToId = assignedToIds[i % assignedToIds.length];
      }
      
      // Standard Fields mapping
      const standardMap: Record<string, string> = {
        'company_name': 'companyName',
        'address': 'address',
        'city': 'city',
        'state': 'state',
        'job_title': 'jobTitle',
        'industry': 'industry',
        'alternate_number': 'alternatePhone',
        'whatsapp': 'whatsappNumber',
        'facebook_url': 'facebookUrl',
        'twitter_url': 'twitterUrl',
        'linkedin_url': 'linkedinUrl',
        'website_url': 'websiteUrl',
        'notes': 'notes'
      };

      const leadData: any = {
        companyId,
        name: String(name),
        source: 'Google Sheets',
        callStatus: 'Untouched',
        groupId: groupId || undefined,
        funnelId: funnelId || undefined,
        assignedToId: assignedToId || undefined
      };

      if (phone) leadData.phone = phone;
      if (email) leadData.email = email;

      for (const [key, value] of Object.entries(row)) {
        if (!value) continue;
        if (key === 'name' || key === 'phone' || key === 'email') continue;

        if (standardMap[key]) {
          leadData[standardMap[key]] = String(value);
        } else {
          customData[key] = value;
        }
      }

      if (Object.keys(customData).length > 0) {
        leadData.customData = customData;
      }

      // Upsert by phone if provided to avoid duplicates
      if (phone) {
        const existing = await prisma.lead.findFirst({
          where: { companyId, phone: leadData.phone }
        });
        if (existing) {
          await prisma.lead.update({
            where: { id: existing.id },
            data: leadData
          });
          successCount++;
          continue;
        }
      }

      await prisma.lead.create({ data: leadData });
      successCount++;
    }

    console.log(`Google Sheets Webhook: Processed ${successCount} leads for company ${companyId}`);

    res.status(200).json({ success: true, processed: successCount });
  } catch (error: any) {
    console.error('Google Sheets Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
