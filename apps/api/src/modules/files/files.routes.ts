import { Router } from 'express';
import { getFiles, uploadFile } from './files.controller';

const router = Router({ mergeParams: true });

router.get('/', getFiles);
router.post('/', uploadFile);

export default router;
