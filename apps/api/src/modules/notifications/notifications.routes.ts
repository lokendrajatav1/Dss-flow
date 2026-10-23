import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware';
import { getNotifications } from './notifications.controller';

const router = Router();

router.get('/', authenticate, getNotifications);

export default router;
