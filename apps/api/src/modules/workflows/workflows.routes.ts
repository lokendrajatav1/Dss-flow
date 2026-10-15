import { Router } from 'express';
import {
    getWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflowTest,
    getWorkflowLogs
} from './workflows.controller';
import { protect } from '../../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getWorkflows);
router.get('/logs', getWorkflowLogs);
router.get('/:id/logs', getWorkflowLogs);
router.post('/', createWorkflow);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);
router.post('/:id/test', executeWorkflowTest);

export default router;
