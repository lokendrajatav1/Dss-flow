import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import { getPriceBooks, getPriceBookById, createPriceBook, updatePriceBook, deletePriceBook } from './pricebooks.controller';

const router = Router();
router.use(protect);

router.get('/', getPriceBooks);
router.post('/', createPriceBook);
router.get('/:id', getPriceBookById);
router.put('/:id', updatePriceBook);
router.delete('/:id', deletePriceBook);

export default router;