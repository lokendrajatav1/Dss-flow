import { Request, Response } from 'express';
import { prisma } from '../../lib/db';

export const verifyFacebookWebhook = (req: Request, res: Response) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'my_secure_verify_token';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('FACEBOOK WEBHOOK VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
};

export const handleFacebookWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const urlCompanyId = req.params.companyId;

    // Direct Test Lead from CRM or testing tools
    if (body.name || body.phone || body.email || body.test) {
      let targetCompanyId = urlCompanyId || body.companyId;
      if (!targetCompanyId) {
        const firstComp = await prisma.company.findFirst({ select: { id: true } });
        targetCompanyId = firstComp?.id;
      }

      if (!targetCompanyId) {
        return res.status(400).json({ success: false, message: 'Company not found' });
      }

      const testLead = await prisma.lead.create({
        data: {
          companyId: targetCompanyId,
          name: body.name || 'Meta Test Lead',
          phone: body.phone || '+919876543210',
          email: body.email || 'meta_lead@example.com',
          city: body.city || 'Mumbai',
          source: 'Meta Ads (Facebook/Instagram)',
          status: 'New',
          callStatus: 'Untouched',
          notes: 'Direct Test Lead from Meta Integration Console',
          customData: {
            is_test_event: true,
            created_at: new Date().toISOString()
          }
        }
      });

      console.log(`[Facebook Webhook] Direct test lead created: ${testLead.id}`);
      return res.status(200).json({ success: true, message: 'Test Meta Lead created successfully!', lead: testLead });
    }

    if (body.object === 'page') {
      // Respond 200 immediately to Meta so webhook does not timeout
      res.status(200).send('EVENT_RECEIVED');

      if (!Array.isArray(body.entry)) return;

      for (const entry of body.entry) {
        const pageId = String(entry.id);

        if (!Array.isArray(entry.changes)) continue;

        for (const change of entry.changes) {
          if (change.field === 'leadgen' && change.value) {
            const leadgenId = change.value.leadgen_id;
            console.log(`[Facebook Webhook] New lead received! Lead ID: ${leadgenId}, Page ID: ${pageId}`);

            try {
              // 1. Locate company integration for Facebook
              let targetCompanyId: string | undefined = urlCompanyId;
              let token: string | null | undefined = undefined;

              if (targetCompanyId) {
                const compIntegration = await prisma.integration.findFirst({
                  where: { companyId: targetCompanyId, providerName: 'facebook', status: 'active' }
                });
                token = compIntegration?.accessToken;
              } else {
                const allFbIntegrations = await prisma.integration.findMany({
                  where: { providerName: 'facebook', status: 'active' }
                });

                let matchedIntegration = allFbIntegrations.find(i => {
                  if (!i.configJson) return false;
                  try {
                    const cfg = JSON.parse(i.configJson);
                    if (Array.isArray(cfg.pageIds) && cfg.pageIds.includes(pageId)) return true;
                  } catch (e) {}
                  return false;
                });

                if (!matchedIntegration && allFbIntegrations.length > 0) {
                  matchedIntegration = allFbIntegrations[0];
                }

                targetCompanyId = matchedIntegration?.companyId;
                token = matchedIntegration?.accessToken;
              }

              let leadName = 'Meta Lead';
              let leadPhone: string | null = null;
              let leadEmail: string | null = null;
              let leadCity: string | null = null;
              const customData: Record<string, any> = {
                facebook_leadgen_id: leadgenId,
                facebook_page_id: pageId,
                created_time: change.value.created_time || new Date().toISOString()
              };

              // 2. Fetch lead data from Meta Graph API if access token is available
              if (token) {
                try {
                  const graphUrl = `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${encodeURIComponent(token)}`;
                  const graphRes = await fetch(graphUrl);
                  if (graphRes.ok) {
                    const leadPayload: any = await graphRes.json();
                    if (Array.isArray(leadPayload.field_data)) {
                      for (const field of leadPayload.field_data) {
                        const fieldName = String(field.name || '').toLowerCase();
                        const fieldVal = Array.isArray(field.values) && field.values.length > 0 ? field.values[0] : '';
                        if (!fieldVal) continue;

                        if (['full_name', 'name', 'first_name'].includes(fieldName)) {
                          leadName = String(fieldVal);
                        } else if (['phone_number', 'phone', 'mobile_number', 'contact_number'].includes(fieldName)) {
                          leadPhone = String(fieldVal);
                        } else if (['email', 'email_address'].includes(fieldName)) {
                          leadEmail = String(fieldVal);
                        } else if (['city', 'location'].includes(fieldName)) {
                          leadCity = String(fieldVal);
                        } else {
                          customData[field.name || fieldName] = fieldVal;
                        }
                      }
                    }
                  } else {
                    console.warn(`[Facebook Webhook] Graph API returned ${graphRes.status} for lead ${leadgenId}`);
                  }
                } catch (graphErr) {
                  console.error('[Facebook Webhook] Failed to fetch lead from Graph API:', graphErr);
                }
              }

              // 3. Save Lead into DB for the matched company (or fallback first company)
              if (!targetCompanyId) {
                const firstCompany = await prisma.company.findFirst({ select: { id: true } });
                targetCompanyId = firstCompany?.id;
              }

              if (targetCompanyId) {
                // Deduplicate by phone if phone is available
                if (leadPhone) {
                  const existingLead = await prisma.lead.findFirst({
                    where: { companyId: targetCompanyId, phone: leadPhone }
                  });
                  if (existingLead) {
                    await prisma.lead.update({
                      where: { id: existingLead.id },
                      data: {
                        name: leadName !== 'Meta Lead' ? leadName : existingLead.name,
                        email: leadEmail || existingLead.email,
                        city: leadCity || existingLead.city,
                        customData: {
                          ...(existingLead.customData as any || {}),
                          ...customData
                        }
                      }
                    });
                    console.log(`[Facebook Webhook] Updated existing lead for phone ${leadPhone}`);
                    continue;
                  }
                }

                const createdLead = await prisma.lead.create({
                  data: {
                    companyId: targetCompanyId,
                    name: leadName,
                    phone: leadPhone,
                    email: leadEmail,
                    city: leadCity,
                    source: 'Meta Ads (Facebook/Instagram)',
                    status: 'New',
                    callStatus: 'Untouched',
                    notes: `Meta Leadgen ID: ${leadgenId}\nPage ID: ${pageId}`,
                    customData
                  }
                });

                console.log(`[Facebook Webhook] Successfully created lead: ${createdLead.id} (${leadName}) for company ${targetCompanyId}`);
              } else {
                console.warn('[Facebook Webhook] No company found to assign Facebook lead.');
              }
            } catch (leadProcErr) {
              console.error('[Facebook Webhook] Error processing leadgen item:', leadProcErr);
            }
          }
        }
      }
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Facebook Webhook Error:', error);
    if (!res.headersSent) {
      res.status(500).send('SERVER_ERROR');
    }
  }
};
