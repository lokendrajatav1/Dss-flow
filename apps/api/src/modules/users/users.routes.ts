import { Router } from 'express';
import { getCurrentUser, getCompanyUsers, createUser, deleteUser, updateUserRole, updateUser } from './users.controller';

import { protect } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/', protect, getCompanyUsers);
router.post('/', protect, createUser);
router.patch('/:id/role', protect, updateUserRole);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);
router.get('/me', protect, getCurrentUser);

export default router;
