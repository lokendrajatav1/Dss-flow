import { Request, Response } from 'express';

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

    if (body.object === 'page') {
      body.entry?.forEach((entry: any) => {
        const pageId = entry.id;

        entry.changes?.forEach(async (change: any) => {
          if (change.field === 'leadgen') {
            const leadgenId = change.value.leadgen_id;
            console.log(`New lead received from Facebook! Lead ID: ${leadgenId}, Page ID: ${pageId}`);

            // Logic to fetch from Graph API and save to DB will go here
          }
        });
      });

      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Facebook Webhook Error:', error);
    res.status(500).send('SERVER_ERROR');
  }
};
