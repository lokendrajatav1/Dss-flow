import { Router } from 'express';
import { getGroups, createGroup, updateGroup, deleteGroup } from './groups.controller';

const router = Router({ mergeParams: true });

router.get('/', getGroups);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

export default router;
