import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { FilesService } from './files.service';

export const getFiles = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const files = await FilesService.getFiles(companyId, id);
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const userId = req.user!.id;
    const { id } = req.params;
    const file = await FilesService.uploadFile(companyId, id, userId, req.body);
    res.status(201).json(file);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
