import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import { getActivities, createActivity, deleteActivity } from './activities.controller';

const router = Router({ mergeParams: true });
router.use(protect);

router.get('/', getActivities);
router.post('/', createActivity);
router.delete('/:activityId', deleteActivity);

export default router;
