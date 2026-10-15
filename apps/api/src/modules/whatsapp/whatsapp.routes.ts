import { Router } from 'express';
import { getStatus, initialize, logout, getConversations, getMessages, sendMessage, getContactInfo, checkWhatsApp } from './whatsapp.controller';

const router = Router();

router.get('/status', getStatus);
router.post('/initialize', initialize);
router.post('/logout', logout);

router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/messages', sendMessage);
router.get('/contact/:id', getContactInfo);
router.get('/check/:phone', checkWhatsApp);

export default router;
