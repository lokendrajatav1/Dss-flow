import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { ActivitiesService } from './activities.service';

export const getActivities = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const activities = await ActivitiesService.getActivities(companyId, id);
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createActivity = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const userId = req.user!.id;
    const { id } = req.params;
    const activity = await ActivitiesService.createActivity(companyId, id, userId, req.body);
    res.status(201).json(activity);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteActivity = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id, activityId } = req.params;
    await ActivitiesService.deleteActivity(companyId, id, activityId);
    res.json({ message: 'Activity deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
