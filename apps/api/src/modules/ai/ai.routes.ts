import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import { getAIOverview, generateCopilot, batchScoreLeads } from './ai.controller';

const router = Router();

router.use(protect);

router.get('/overview', getAIOverview);
router.post('/generate-copilot', generateCopilot);
router.post('/batch-score', batchScoreLeads);

export default router;
