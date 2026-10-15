import { Router } from 'express';
import { PipelineController } from './pipeline.controller';
import { protect } from '../../middlewares/authMiddleware';

const router = Router();
const pipelineController = new PipelineController();

router.use(protect);

router.get('/', pipelineController.getPipelines);
router.post('/', pipelineController.createPipeline);
router.put('/:id', pipelineController.updatePipeline);
router.delete('/:id', pipelineController.deletePipeline);
router.get('/:id', pipelineController.getPipeline);

router.get('/:id/deals', pipelineController.getPipelineWithDeals);
router.put('/:id/assign', pipelineController.assignTeam);

// Stages
router.post('/:pipelineId/stages', pipelineController.createStage);
router.put('/:pipelineId/stages/:stageId', pipelineController.updateStage);
router.delete('/:pipelineId/stages/:stageId', pipelineController.deleteStage);

export default router;
