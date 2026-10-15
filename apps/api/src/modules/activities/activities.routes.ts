import { Router } from 'express';
import { getActivities, createActivity, deleteActivity } from './activities.controller';

const router = Router({ mergeParams: true });

router.get('/', getActivities);
router.post('/', createActivity);
router.delete('/:activityId', deleteActivity);

export default router;
