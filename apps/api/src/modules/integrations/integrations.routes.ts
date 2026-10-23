import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getIntegrations,
  saveIntegration,
  saveWhatsAppConfig,
  deleteIntegration,
  getTataTeleConfig,
  saveTataTeleConfig,
  initiateTataTeleCall,
  testTataTeleConnection
} from './integrations.controller';

const router = Router();

router.use(protect);

router.get('/', getIntegrations);
router.post('/save', saveIntegration);
router.post('/whatsapp', saveWhatsAppConfig);
router.delete('/:providerName', deleteIntegration);

// Tata Tele Smartflo Endpoints
router.get('/telephony/tata-config', getTataTeleConfig);
router.post('/telephony/save-tata', saveTataTeleConfig);
router.post('/telephony/test-tata', testTataTeleConnection);
router.post('/telephony/call', initiateTataTeleCall);

export default router;

