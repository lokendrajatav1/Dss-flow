import { Router } from 'express';
import { getTickets, getTicketById, updateTicketStatus, addMessageToTicket } from './tickets.controller';
import { protect } from '../../../middlewares/authMiddleware';

const router = Router();

router.get('/tickets', protect, getTickets);
router.get('/tickets/:id', protect, getTicketById);
router.put('/tickets/:id/status', protect, updateTicketStatus);
router.post('/tickets/:id/messages', protect, addMessageToTicket);

export default router;