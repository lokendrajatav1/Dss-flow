import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { AIService } from './ai.service';

export const getAIOverview = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const overview = await AIService.getOverview(companyId);
    res.json(overview);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch AI overview' });
  }
};

export const generateCopilot = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const result = await AIService.generateCopilot(companyId, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to generate copilot response' });
  }
};

export const batchScoreLeads = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const result = await AIService.batchScoreAll(companyId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to batch score leads' });
  }
};
