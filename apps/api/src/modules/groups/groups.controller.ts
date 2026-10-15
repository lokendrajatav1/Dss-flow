import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { GroupsService } from './groups.service';

export const getGroups = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const groups = await GroupsService.getGroups(companyId);
    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const group = await GroupsService.createGroup(companyId, req.user!.id, req.body);
    res.status(201).json(group);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateGroup = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const group = await GroupsService.updateGroup(companyId, req.params.id, req.body);
    res.json(group);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteGroup = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    await GroupsService.deleteGroup(companyId, req.params.id);
    res.json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
