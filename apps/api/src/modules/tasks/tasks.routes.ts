import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  bulkDeleteTasks
} from './tasks.controller';

const router = Router({ mergeParams: true });

router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.post('/bulk-delete', bulkDeleteTasks);
router.put('/:taskId/status', updateTaskStatus);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

export default router;
