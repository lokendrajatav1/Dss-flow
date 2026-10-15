import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  getNextQuotationNumber
} from './quotations.controller';

const router = Router();
router.use(protect);

router.get('/next-number', getNextQuotationNumber);
router.get('/', getQuotations);
router.post('/', createQuotation);
router.get('/:id', getQuotationById);
router.put('/:id', updateQuotation);
router.delete('/:id', deleteQuotation);

export default router;