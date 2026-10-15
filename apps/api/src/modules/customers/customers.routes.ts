import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from './customers.controller';

const router = Router();

router.use(protect);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
