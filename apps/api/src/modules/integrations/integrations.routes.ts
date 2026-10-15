import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import { getIntegrations, saveIntegration, saveWhatsAppConfig, deleteIntegration } from './integrations.controller';

const router = Router();

router.use(protect);

router.get('/', getIntegrations);
router.post('/save', saveIntegration);
router.post('/whatsapp', saveWhatsAppConfig);
router.delete('/:providerName', deleteIntegration);

export default router;
