import { Router } from 'express';
import { getTasks, createTask, updateTaskStatus } from './tasks.controller';

const router = Router({ mergeParams: true });

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:taskId/status', updateTaskStatus);

export default router;
