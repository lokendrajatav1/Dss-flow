import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { TasksService } from './tasks.service';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const tasks = await TasksService.getTasks(companyId, id);
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const userId = req.user!.id;
    const { id } = req.params;
    const task = await TasksService.createTask(companyId, id, userId, req.body);
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { taskId } = req.params;
    const { status } = req.body;
    const task = await TasksService.updateTaskStatus(companyId, taskId, status);
    res.json(task);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
