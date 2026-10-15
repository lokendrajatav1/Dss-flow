import { Router } from 'express';
import { getFunnels, createFunnel, updateFunnel, deleteFunnel } from './funnels.controller';

const router = Router({ mergeParams: true });

router.get('/', getFunnels);
router.post('/', createFunnel);
router.put('/:id', updateFunnel);
router.delete('/:id', deleteFunnel);

export default router;
