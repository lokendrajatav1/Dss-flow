import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import { getRevenueData, getDealsData, getLeadsData, getOverview } from './reports.controller';

const router = Router();

router.use(protect);

router.get('/revenue', getRevenueData);
router.get('/deals', getDealsData);
router.get('/leads', getLeadsData);
router.get('/overview', getOverview);

export default router;