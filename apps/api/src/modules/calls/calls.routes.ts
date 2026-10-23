import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import {
  getCalls,
  createCall,
  updateCall,
  deleteCall,
  bulkDeleteCalls
} from './calls.controller';

const router = Router();

router.use(protect);

router.get('/', getCalls);
router.post('/', createCall);
router.post('/bulk-delete', bulkDeleteCalls);
router.put('/:id', updateCall);
router.delete('/:id', deleteCall);

export default router;
