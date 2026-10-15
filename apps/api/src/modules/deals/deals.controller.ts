import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { DealsService } from './deals.service';

export const getAllDeals = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const deals = await DealsService.getAllDeals(companyId);
    res.json(deals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPipelines = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const pipelines = await DealsService.getPipelines(companyId);
    res.json(pipelines);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPipelineWithDeals = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { pipelineId } = req.params;
    const stages = await DealsService.getPipelineWithDeals(companyId, pipelineId);
    res.json(stages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDealStage = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const { stageId, value, title, leadId, expectedCloseDate, priority, notes, assignedToId } = req.body;
    
    if (!stageId) {
      return res.status(400).json({ message: 'stageId is required' });
    }

    const updatedDeal = await DealsService.updateDealStage(companyId, id, stageId, value, title, leadId, expectedCloseDate, priority, notes, assignedToId);
    res.json(updatedDeal);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createDeal = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { title, stageId, leadId, customerId, value, expectedCloseDate, priority, notes, assignedToId } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }
    if (!stageId) {
      return res.status(400).json({ message: 'stageId is required' });
    }

    const newDeal = await DealsService.createDeal(companyId, { title, stageId, leadId, customerId, value, expectedCloseDate, priority, notes, assignedToId });
    res.status(201).json(newDeal);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDeal = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;

    await DealsService.deleteDeal(companyId, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
