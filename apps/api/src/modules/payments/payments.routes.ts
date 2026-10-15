import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import { getPayments, getPaymentById, createPayment, updatePayment, deletePayment } from './payments.controller';

const router = Router();
router.use(protect);

router.get('/', getPayments);
router.post('/', createPayment);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export default router;