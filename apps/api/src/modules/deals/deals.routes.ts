import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getAllDeals,
  getPipelines,
  getPipelineWithDeals,
  getDealById,
  updateDeal,
  updateDealStage,
  createDeal,
  deleteDeal
} from './deals.controller';

const router = Router();

router.use(protect); // All deals routes require authentication

router.get('/', getAllDeals);
router.get('/pipelines', getPipelines);
router.get('/pipelines/:pipelineId/stages', getPipelineWithDeals);
router.get('/:id', getDealById);
router.post('/', createDeal);
router.put('/:id/stage', updateDealStage);
router.patch('/:id/stage', updateDealStage);
router.put('/:id', updateDeal);
router.patch('/:id', updateDeal);
router.delete('/:id', deleteDeal);

export default router;
