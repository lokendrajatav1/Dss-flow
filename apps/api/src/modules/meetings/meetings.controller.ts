import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { MeetingsService } from './meetings.service';

export const getMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { search, status, platform, hostId, leadId } = req.query as any;
    const meetings = await MeetingsService.getMeetings(companyId, {
      search,
      status,
      platform,
      hostId,
      leadId
    });
    res.json(meetings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const userId = req.user!.id;
    const meeting = await MeetingsService.createMeeting(companyId, userId, req.body);
    res.status(201).json(meeting);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const meeting = await MeetingsService.updateMeeting(companyId, id, req.body);
    res.json(meeting);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await MeetingsService.deleteMeeting(companyId, id);
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const bulkDeleteMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required' });
    }
    await MeetingsService.bulkDeleteMeetings(companyId, ids);
    res.json({ message: 'Meetings deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
