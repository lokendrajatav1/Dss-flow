import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { FunnelsService } from './funnels.service';

export const getFunnels = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const funnels = await FunnelsService.getFunnels(companyId);
    res.json(funnels);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createFunnel = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const funnel = await FunnelsService.createFunnel(companyId, req.body);
    res.status(201).json(funnel);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateFunnel = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const funnel = await FunnelsService.updateFunnel(companyId, req.params.id, req.body);
    res.json(funnel);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFunnel = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    await FunnelsService.deleteFunnel(companyId, req.params.id);
    res.json({ message: 'Funnel deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
