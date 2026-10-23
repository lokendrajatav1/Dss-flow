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
    
    // Support multiple payload formats:
    // 1. { data: [...] }
    // 2. Direct array: [...]
    // 3. Single object: { name, phone, ... }
    // 4. { data: { ... } }
    let records: any[] = [];
    if (Array.isArray(payload)) {
      records = payload;
    } else if (Array.isArray(payload.data)) {
      records = payload.data;
    } else if (payload.data && typeof payload.data === 'object') {
      records = [payload.data];
    } else if (payload.name || payload.phone || payload.email || payload.Mobile || payload.Phone || payload.Name) {
      records = [payload];
    }

    const groupId = payload.groupId || null;
    const funnelId = payload.funnelId || null;
    const assignedToIds = Array.isArray(payload.assignedTo) ? payload.assignedTo : [];

    if (records.length === 0) {
      return res.status(200).json({ success: true, message: 'No records to process', received: payload });
    }

    let successCount = 0;

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      if (!row || typeof row !== 'object') continue;

      const normalizeKey = (k: string) => String(k || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      const getField = (matchers: string[]) => {
        const normalizedMatchers = matchers.map(normalizeKey);
        
        // Exact match on normalized keys
        for (const [rk, rv] of Object.entries(row)) {
          if (rv === null || rv === undefined || String(rv).trim() === '') continue;
          const nrk = normalizeKey(rk);
          if (normalizedMatchers.includes(nrk)) return rv;
        }

        // Substring / partial match on normalized keys
        for (const [rk, rv] of Object.entries(row)) {
          if (rv === null || rv === undefined || String(rv).trim() === '') continue;
          const nrk = normalizeKey(rk);
          for (const m of normalizedMatchers) {
            if (nrk.includes(m)) return rv;
          }
        }
        return null;
      };

      const nameRaw = getField(['name', 'fullname', 'customername', 'leadname', 'clientname', 'personname']);
      const name = nameRaw ? String(nameRaw).trim() : 'Google Sheet Lead';

      const phoneRaw = getField(['phone', 'mobile', 'mobilenumber', 'phonenumber', 'contact', 'contactnumber', 'whatsapp', 'cell', 'cellphone']);
      const phone = phoneRaw ? String(phoneRaw).trim() : null;

      const emailRaw = getField(['email', 'emailaddress', 'mail', 'emailid']);
      const email = emailRaw ? String(emailRaw).trim() : null;

      const cityRaw = getField(['city', 'location', 'town']);
      const city = cityRaw ? String(cityRaw).trim() : null;
      
      const customData: any = {};
      
      let assignedToId = null;
      if (assignedToIds.length > 0) {
        // Round Robin / Sequential assignment
        assignedToId = assignedToIds[i % assignedToIds.length];
      }
      
      // Standard Fields mapping by normalized key
      const standardMap: Record<string, string> = {
        'companyname': 'companyName',
        'company': 'companyName',
        'address': 'address',
        'city': 'city',
        'state': 'state',
        'jobtitle': 'jobTitle',
        'industry': 'industry',
        'alternatenumber': 'alternatePhone',
        'alternatephone': 'alternatePhone',
        'whatsapp': 'whatsappNumber',
        'whatsappnumber': 'whatsappNumber',
        'facebookurl': 'facebookUrl',
        'twitterurl': 'twitterUrl',
        'linkedinurl': 'linkedinUrl',
        'websiteurl': 'websiteUrl',
        'website': 'websiteUrl',
        'notes': 'notes',
        'note': 'notes'
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
      if (city) leadData.city = city;

      for (const [key, value] of Object.entries(row)) {
        if (value === null || value === undefined || String(value).trim() === '') continue;
        const normKey = normalizeKey(key);
        
        // Skip primary columns to avoid duplicating in customData
        if (['name', 'fullname', 'customername', 'leadname', 'phone', 'mobile', 'mobilenumber', 'phonenumber', 'contact', 'email', 'emailaddress', 'emailid'].includes(normKey)) {
          continue;
        }

        if (standardMap[normKey]) {
          leadData[standardMap[normKey]] = String(value);
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
