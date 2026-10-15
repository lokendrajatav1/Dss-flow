import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { SolutionsService } from './solutions.service';

export class SolutionsController {
  static async getSolutions(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const filters = req.query;
      const solutions = await SolutionsService.getSolutions(companyId, filters);
      return res.json(solutions);
    } catch (err: any) {
      console.error('Error fetching solutions:', err);
      return res.status(500).json({ message: err.message || 'Failed to fetch solutions' });
    }
  }

  static async getSolutionById(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const { id } = req.params;
      const item = await SolutionsService.getSolutionById(companyId, id);
      return res.json(item);
    } catch (err: any) {
      return res.status(404).json({ message: err.message || 'Solution not found' });
    }
  }

  static async createSolution(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const item = await SolutionsService.createSolution(companyId, req.body);
      return res.status(201).json(item);
    } catch (err: any) {
      console.error('Error creating solution:', err);
      return res.status(400).json({ message: err.message || 'Failed to create solution' });
    }
  }

  static async updateSolution(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const { id } = req.params;
      const item = await SolutionsService.updateSolution(companyId, id, req.body);
      return res.json(item);
    } catch (err: any) {
      console.error('Error updating solution:', err);
      return res.status(400).json({ message: err.message || 'Failed to update solution' });
    }
  }

  static async deleteSolution(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const { id } = req.params;
      await SolutionsService.deleteSolution(companyId, id);
      return res.json({ success: true, message: 'Solution deleted successfully' });
    } catch (err: any) {
      console.error('Error deleting solution:', err);
      return res.status(400).json({ message: err.message || 'Failed to delete solution' });
    }
  }

  static async voteHelpfulSolution(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.companyId || 'default';
      const { id } = req.params;
      const item = await SolutionsService.voteHelpfulSolution(companyId, id);
      return res.json(item);
    } catch (err: any) {
      console.error('Error voting solution:', err);
      return res.status(400).json({ message: err.message || 'Failed to vote solution' });
    }
  }
}
