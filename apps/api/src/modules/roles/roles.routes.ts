import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getCompanyRoles,
  getPermissionsCatalog,
  createRole,
  updateRole,
  deleteRole
} from './roles.controller';

const router = Router();

router.use(protect);

router.get('/', getCompanyRoles);
router.get('/catalog', getPermissionsCatalog);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;
