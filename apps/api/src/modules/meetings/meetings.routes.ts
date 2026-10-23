import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  bulkDeleteMeetings
} from './meetings.controller';

const router = Router();

router.use(protect);

router.get('/', getMeetings);
router.post('/', createMeeting);
router.post('/bulk-delete', bulkDeleteMeetings);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);

export default router;
