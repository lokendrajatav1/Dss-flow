import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { CasesService } from './cases.service';

export class CasesController {
  static async getCases(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const filters = req.query;
      const cases = await CasesService.getCases(companyId, filters);
      return res.json(cases);
    } catch (err: any) {
      console.error('Error fetching cases:', err);
      return res.status(500).json({ message: err.message || 'Failed to fetch cases' });
    }
  }

  static async getCaseById(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const { id } = req.params;
      const item = await CasesService.getCaseById(companyId, id);
      return res.json(item);
    } catch (err: any) {
      return res.status(404).json({ message: err.message || 'Case not found' });
    }
  }

  static async createCase(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const item = await CasesService.createCase(companyId, req.body);
      return res.status(201).json(item);
    } catch (err: any) {
      console.error('Error creating case:', err);
      return res.status(400).json({ message: err.message || 'Failed to create case' });
    }
  }

  static async updateCase(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const { id } = req.params;
      const item = await CasesService.updateCase(companyId, id, req.body);
      return res.json(item);
    } catch (err: any) {
      console.error('Error updating case:', err);
      return res.status(400).json({ message: err.message || 'Failed to update case' });
    }
  }

  static async deleteCase(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const { id } = req.params;
      await CasesService.deleteCase(companyId, id);
      return res.json({ success: true, message: 'Case deleted successfully' });
    } catch (err: any) {
      console.error('Error deleting case:', err);
      return res.status(400).json({ message: err.message || 'Failed to delete case' });
    }
  }

  static async bulkDeleteCases(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const { ids } = req.body;
      await CasesService.bulkDeleteCases(companyId, ids || []);
      return res.json({ success: true, message: 'Cases deleted successfully' });
    } catch (err: any) {
      console.error('Error bulk deleting cases:', err);
      return res.status(400).json({ message: err.message || 'Failed to bulk delete cases' });
    }
  }

  static async addCaseComment(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const { id } = req.params;
      const item = await CasesService.addCaseComment(companyId, id, req.body);
      return res.status(201).json(item);
    } catch (err: any) {
      console.error('Error adding comment:', err);
      return res.status(400).json({ message: err.message || 'Failed to add comment' });
    }
  }
}
