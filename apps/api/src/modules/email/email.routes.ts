import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getEmailAccounts,
  getEmailAccount,
  createEmailAccount,
  updateEmailAccount,
  deleteEmailAccount,
  getMessages,
  getMessage,
  createMessage,
  markRead,
  markStarred,
  updateFolder,
  deleteMessage,
  emptyTrash,
  sendEmail,
  syncEmails,
} from './email.controller';

const router = Router();

router.use(protect);

// Email accounts
router.get('/accounts', getEmailAccounts);
router.get('/accounts/:id', getEmailAccount);
router.post('/accounts', createEmailAccount);
router.patch('/accounts/:id', updateEmailAccount);
router.delete('/accounts/:id', deleteEmailAccount);
router.post('/accounts/:id/sync', syncEmails);

// Messages
router.get('/messages', getMessages);
router.get('/messages/:id', getMessage);
router.post('/messages', createMessage);
router.patch('/messages/:id/read', markRead);
router.patch('/messages/:id/star', markStarred);
router.patch('/messages/:id/folder', updateFolder);
router.delete('/messages/trash/empty', emptyTrash);
router.delete('/messages/:id', deleteMessage);

// Send email
router.post('/send', sendEmail);

export default router;
