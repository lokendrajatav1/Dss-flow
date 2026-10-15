import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  getNextSalesOrderNumber
} from './salesorders.controller';

const router = Router();
router.use(protect);

router.get('/next-number', getNextSalesOrderNumber);
router.get('/', getSalesOrders);
router.post('/', createSalesOrder);
router.get('/:id', getSalesOrderById);
router.put('/:id', updateSalesOrder);
router.delete('/:id', deleteSalesOrder);

export default router;