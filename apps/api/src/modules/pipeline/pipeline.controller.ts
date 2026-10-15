import { Response, NextFunction } from 'express';
import { PipelineService } from './pipeline.service';
import { AuthRequest } from '../../middlewares/authMiddleware';

export class PipelineController {
  private pipelineService: PipelineService;

  constructor() {
    this.pipelineService = new PipelineService();
  }

  getPipelines = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const type = req.query.type as string;
      const pipelines = await this.pipelineService.getPipelines(companyId, type);
      res.status(200).json(pipelines);
    } catch (error) {
      next(error);
    }
  };

  getPipeline = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const { id } = req.params;
      const pipeline = await this.pipelineService.getPipeline(companyId, id);
      res.status(200).json(pipeline);
    } catch (error) {
      next(error);
    }
  };

  getPipelineWithDeals = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const { id } = req.params;
      const pipeline = await this.pipelineService.getPipelineWithDeals(companyId, id);
      res.status(200).json(pipeline);
    } catch (error) {
      next(error);
    }
  };

  createPipeline = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const pipeline = await this.pipelineService.createPipeline(companyId, req.body);
      res.status(201).json(pipeline);
    } catch (error) {
      next(error);
    }
  };

  updatePipeline = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const { id } = req.params;
      const pipeline = await this.pipelineService.updatePipeline(companyId, id, req.body);
      res.status(200).json(pipeline);
    } catch (error) {
      next(error);
    }
  };

  deletePipeline = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const { id } = req.params;
      await this.pipelineService.deletePipeline(companyId, id);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  assignTeam = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const { id } = req.params;
      const { userIds } = req.body;
      const pipeline = await this.pipelineService.assignTeam(companyId, id, userIds);
      res.status(200).json(pipeline);
    } catch (error) {
      next(error);
    }
  };

  createStage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const { pipelineId } = req.params;
      const stage = await this.pipelineService.createStage(companyId, pipelineId, req.body);
      res.status(201).json(stage);
    } catch (error) {
      next(error);
    }
  };

  updateStage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const { pipelineId, stageId } = req.params;
      const stage = await this.pipelineService.updateStage(companyId, pipelineId, stageId, req.body);
      res.status(200).json(stage);
    } catch (error) {
      next(error);
    }
  };

  deleteStage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const { pipelineId, stageId } = req.params;
      await this.pipelineService.deleteStage(companyId, pipelineId, stageId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };
}
