import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getAllDeals,
  getPipelines,
  getPipelineWithDeals,
  updateDealStage,
  createDeal,
  deleteDeal
} from './deals.controller';

const router = Router();

router.use(protect); // All deals routes require authentication

router.get('/', getAllDeals);
router.get('/pipelines', getPipelines);
router.get('/pipelines/:pipelineId/stages', getPipelineWithDeals);
router.post('/', createDeal);
router.patch('/:id/stage', updateDealStage);
router.delete('/:id', deleteDeal);

export default router;
