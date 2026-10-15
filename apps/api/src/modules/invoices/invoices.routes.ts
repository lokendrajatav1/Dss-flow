import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getNextInvoiceNumber
} from './invoices.controller';

const router = Router();
router.use(protect);

router.get('/next-number', getNextInvoiceNumber);
router.get('/', getInvoices);
router.post('/', createInvoice);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
