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
    const { assignedToId, startDate, endDate, search } = req.query;

    const stages = await DealsService.getPipelineWithDeals(companyId, pipelineId, {
      assignedToId: assignedToId ? String(assignedToId) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      search: search ? String(search) : undefined,
    });
    res.json(stages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDealById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const deal = await DealsService.getDealById(companyId, id);
    res.json(deal);
  } catch (error: any) {
    res.status(error.message.includes('not found') ? 404 : 500).json({ message: error.message });
  }
};

export const updateDeal = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const updatedDeal = await DealsService.updateDeal(companyId, id, req.body);
    res.json(updatedDeal);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDealStage = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const { stageId, value, title, leadId, expectedCloseDate, priority, notes, assignedToId, startDate, callStatus, funnelId, groupId, attachmentUrl } = req.body;
    
    if (!stageId) {
      return res.status(400).json({ message: 'stageId is required' });
    }

    const updatedDeal = await DealsService.updateDealStage(companyId, id, stageId, value, title, leadId, expectedCloseDate, priority, notes, assignedToId, { startDate, callStatus, funnelId, groupId, attachmentUrl });
    res.json(updatedDeal);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createDeal = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { 
      title, stageId, leadId, customerId, value, 
      startDate, expectedCloseDate, priority, notes, assignedToId,
      callStatus, funnelId, groupId, attachmentUrl 
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    const pipelines = await DealsService.getPipelines(companyId);
    const allStages = pipelines.flatMap(p => p.stages || []);

    let finalStageId = stageId;
    if (stageId) {
      const matchById = allStages.find(s => s.id === stageId);
      const matchByName = allStages.find(s => s.name.toLowerCase() === String(stageId).toLowerCase());
      if (matchById) {
        finalStageId = matchById.id;
      } else if (matchByName) {
        finalStageId = matchByName.id;
      }
    }

    if (!finalStageId && allStages.length > 0) {
      finalStageId = allStages[0].id;
    }

    if (!finalStageId) {
      return res.status(400).json({ message: 'stageId is required and no pipeline stage could be found or created' });
    }

    const newDeal = await DealsService.createDeal(companyId, { 
      title, stageId: finalStageId, leadId, customerId, value, 
      startDate, expectedCloseDate, priority, notes, assignedToId,
      callStatus, funnelId, groupId, attachmentUrl 
    });
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
