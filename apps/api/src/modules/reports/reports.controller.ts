import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { ReportsService } from './reports.service';

export const getRevenueData = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const range = req.query.range as string || '30d';
    const revenueData = await ReportsService.getRevenueData(companyId, range);
    res.json(revenueData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDealsData = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const range = req.query.range as string || '30d';
    const dealsData = await ReportsService.getDealsData(companyId, range);
    res.json(dealsData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeadsData = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const range = req.query.range as string || '30d';
    const leadsData = await ReportsService.getLeadsData(companyId, range);
    res.json(leadsData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOverview = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const overviewData = await ReportsService.getOverview(companyId);
    res.json(overviewData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
