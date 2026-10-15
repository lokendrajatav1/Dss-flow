import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import { getLayout, saveLayout } from './form-layouts.controller';

const router = Router();

router.use(protect);

router.get('/', getLayout);
router.post('/', saveLayout);

export default router;
