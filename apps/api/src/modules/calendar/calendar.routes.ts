import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getCalendarSyncs,
  getCalendarSync,
  createCalendarSync,
  updateCalendarSync,
  deleteCalendarSync,
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from './calendar.controller';

const router = Router();

router.use(protect);

// Calendar syncs
router.get('/syncs', getCalendarSyncs);
router.get('/syncs/:id', getCalendarSync);
router.post('/syncs', createCalendarSync);
router.patch('/syncs/:id', updateCalendarSync);
router.delete('/syncs/:id', deleteCalendarSync);

// Events
router.get('/events', getEvents);
router.get('/events/:id', getEvent);
router.post('/events', createEvent);
router.patch('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

export default router;
