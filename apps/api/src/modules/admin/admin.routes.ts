import { Router } from 'express';
import { 
    adminLogin, 
    getTenants, 
    getPlatformAdmins, 
    createPlatformAdmin,
    getUsageMetrics, 
    getSystemOverview, 
    getRecentTenants 
} from './admin.controller';
import { protect } from '../../middlewares/authMiddleware';

const router = Router();

// Public Admin Login route
router.post('/login', adminLogin);

// Protected Admin routes
router.get('/tenants', protect, getTenants);
router.get('/platform-admins', protect, getPlatformAdmins);
router.post('/platform-admins', protect, createPlatformAdmin);
router.get('/usage-metrics', protect, getUsageMetrics);
router.get('/system-overview', protect, getSystemOverview);
router.get('/recent-tenants', protect, getRecentTenants);

export default router;