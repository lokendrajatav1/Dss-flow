import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from './products.controller';

const router = Router();
router.use(protect);

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;