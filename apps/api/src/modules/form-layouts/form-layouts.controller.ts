import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { FormLayoutsService } from './form-layouts.service';

export const getLayout = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { entityType } = req.query;

    if (!entityType || typeof entityType !== 'string') {
      return res.status(400).json({ message: 'entityType query parameter is required (e.g., ?entityType=lead)' });
    }

    const layout = await FormLayoutsService.getLayout(companyId, entityType);
    res.json(layout); // Returns null if no custom layout is defined yet
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const saveLayout = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { entityType, layoutJson } = req.body;

    if (!entityType || !layoutJson) {
      return res.status(400).json({ message: 'entityType and layoutJson are required' });
    }

    const savedLayout = await FormLayoutsService.saveLayout(companyId, entityType, layoutJson);
    res.json(savedLayout);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
