import { Router } from 'express';
import {
    getWorkspaceSettings,
    updateWorkspaceSettings,
    getTeamMembers,
    getRecentActivity
} from './settings.controller';
import {
    getMyCompany as getCompanyProfile,
    updateMyCompany as updateCompanyProfile
} from '../companies/companies.controller';
import { protect } from '../../middlewares/authMiddleware';

const router = Router();

// Company Profile endpoints (Delegated to dedicated Companies controller)
router.get('/company-profile', protect, getCompanyProfile);
router.put('/company-profile', protect, updateCompanyProfile);
router.patch('/company-profile', protect, updateCompanyProfile);

// Workspace & Dashboard Overview endpoints
router.get('/workspace-settings', protect, getWorkspaceSettings);
router.put('/workspace-settings', protect, updateWorkspaceSettings);

// Team & Activity endpoints
router.get('/team-members', protect, getTeamMembers);
router.get('/recent-activity', protect, getRecentActivity);

export default router;