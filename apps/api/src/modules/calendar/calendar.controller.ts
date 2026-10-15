import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { CalendarService } from './calendar.service';

// ─── Calendar Syncs ──────────────────────────────────────

export const getCalendarSyncs = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const syncs = await CalendarService.getCalendarSyncs(companyId);
    res.json(syncs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCalendarSync = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const sync = await CalendarService.getCalendarSync(companyId, id);
    if (!sync) return res.status(404).json({ message: 'Sync not found' });
    res.json(sync);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCalendarSync = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const sync = await CalendarService.createCalendarSync(companyId, req.body);
    res.status(201).json(sync);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCalendarSync = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const sync = await CalendarService.updateCalendarSync(companyId, id, req.body);
    res.json(sync);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCalendarSync = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await CalendarService.deleteCalendarSync(companyId, id);
    res.json({ message: 'Calendar sync deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Calendar Events ──────────────────────────────────────

export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const result = await CalendarService.getEvents(companyId, req.query as any);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvent = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const event = await CalendarService.getEvent(companyId, id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const event = await CalendarService.createEvent(companyId, req.body);
    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const event = await CalendarService.updateEvent(companyId, id, req.body);
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await CalendarService.deleteEvent(companyId, id);
    res.json({ message: 'Event deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
