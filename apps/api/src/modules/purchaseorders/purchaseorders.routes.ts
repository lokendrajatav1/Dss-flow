import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  getNextPurchaseOrderNumber
} from './purchaseorders.controller';

const router = Router();
router.use(protect);

router.get('/next-number', getNextPurchaseOrderNumber);
router.get('/', getPurchaseOrders);
router.post('/', createPurchaseOrder);
router.get('/:id', getPurchaseOrderById);
router.put('/:id', updatePurchaseOrder);
router.delete('/:id', deletePurchaseOrder);

export default router;
