import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { SettingsService } from './settings.service';

/**
 * Controller dedicated to Workspace Settings, Team Members, and Overview Activity
 */
export const getWorkspaceSettings = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ message: 'No company associated with this user' });
        }
        const settings = await SettingsService.getWorkspaceSettings(companyId);
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateWorkspaceSettings = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ message: 'No company associated with this user' });
        }
        const updates = req.body;
        const settings = await SettingsService.updateWorkspaceSettings(companyId, updates);
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getTeamMembers = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const teamMembers = await SettingsService.getTeamMembers(companyId);
        res.json(teamMembers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getRecentActivity = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const limit = parseInt(req.query.limit as string) || 20;
        const activity = await SettingsService.getRecentActivity(companyId, limit);
        res.json(activity);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};