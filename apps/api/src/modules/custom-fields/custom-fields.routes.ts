import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import { getFields, createField, updateField, deleteField } from './custom-fields.controller';

const router = Router();

router.use(protect);

router.get('/', getFields);
router.post('/', createField);
router.put('/:id', updateField);
router.delete('/:id', deleteField);

export default router;
