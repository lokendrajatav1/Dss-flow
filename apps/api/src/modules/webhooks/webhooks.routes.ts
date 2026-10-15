import { Router } from 'express';
import { verifyFacebookWebhook, handleFacebookWebhook } from './facebook.controller';
import { handleJustdialWebhook } from './justdial.controller';
import { handleIndiamartWebhook } from './indiamart.controller';
import { handleSulekhaWebhook } from './sulekha.controller';
import { handleTradeIndiaWebhook } from './tradeindia.controller';
import { handleGenericWebhook } from './generic.controller';
import { handleGoogleSheetsWebhook } from './google-sheets.controller';

const router = Router();

// Facebook Webhooks
router.get('/facebook', verifyFacebookWebhook);
router.post('/facebook', handleFacebookWebhook);

// Justdial Webhooks
router.get('/justdial/:companyId', handleJustdialWebhook);
router.post('/justdial/:companyId', handleJustdialWebhook);

// IndiaMART Webhooks
router.get('/indiamart/:companyId', handleIndiamartWebhook);
router.post('/indiamart/:companyId', handleIndiamartWebhook);

// Sulekha Webhooks
router.get('/sulekha/:companyId', handleSulekhaWebhook);
router.post('/sulekha/:companyId', handleSulekhaWebhook);

// TradeIndia Webhooks
router.get('/tradeindia/:companyId', handleTradeIndiaWebhook);
router.post('/tradeindia/:companyId', handleTradeIndiaWebhook);

// Generic / Website / Pabbly Webhooks
router.get('/generic/:companyId', handleGenericWebhook);
router.post('/generic/:companyId', handleGenericWebhook);

// Google Sheets Webhooks
router.post('/google-sheets/:companyId', handleGoogleSheetsWebhook);

export default router;
