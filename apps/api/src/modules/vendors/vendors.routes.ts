import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
} from './vendors.controller';

const router = Router();
router.use(protect);

router.get('/', getVendors);
router.post('/', createVendor);
router.get('/:id', getVendorById);
router.put('/:id', updateVendor);
router.delete('/:id', deleteVendor);

export default router;
