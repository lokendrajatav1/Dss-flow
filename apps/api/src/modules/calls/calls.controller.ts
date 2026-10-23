import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { CallsService } from './calls.service';

export const getCalls = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { page, limit, search, direction, status, outcome, agentId } = req.query;

    const result = await CallsService.getCalls(companyId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search ? String(search) : undefined,
      direction: direction ? String(direction) : undefined,
      status: status ? String(status) : undefined,
      outcome: outcome ? String(outcome) : undefined,
      agentId: agentId ? String(agentId) : undefined
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch calls' });
  }
};

export const createCall = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const userId = req.user!.id;
    const call = await CallsService.createCall(companyId, userId, req.body);
    res.status(201).json(call);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create call' });
  }
};

export const updateCall = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const updated = await CallsService.updateCall(companyId, id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update call' });
  }
};

export const deleteCall = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await CallsService.deleteCall(companyId, id);
    res.json({ message: 'Call record deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to delete call' });
  }
};

export const bulkDeleteCalls = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required' });
    }
    const result = await CallsService.bulkDeleteCalls(companyId, ids);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to bulk delete calls' });
  }
};
