import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { NotificationsService } from './notifications.service';

const notificationsService = new NotificationsService();

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID required' });
    }

    const notifications = await notificationsService.getNotifications(companyId, userId);

    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error: any) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};
