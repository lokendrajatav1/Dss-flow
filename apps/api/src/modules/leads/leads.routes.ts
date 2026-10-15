import { Router } from 'express';
import { protect } from '../../middlewares/authMiddleware';
import { getLeads, getLeadById, createLead, updateLeadStatus, updateLead, deleteLead, convertLead, importCsvLeads, scoreLead, qualifyLead } from './leads.controller';
import activitiesRoutes from '../activities/activities.routes';
import tasksRoutes from '../tasks/tasks.routes';
import filesRoutes from '../files/files.routes';
import groupsRoutes from '../groups/groups.routes';
import funnelsRoutes from '../funnels/funnels.routes';

const router = Router();

router.use(protect);

router.get('/', getLeads);
router.post('/', createLead);
router.post('/import-csv', importCsvLeads);

router.use('/groups', groupsRoutes);
router.use('/funnels', funnelsRoutes);

router.put('/:id/status', updateLeadStatus);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/convert', convertLead);
router.post('/:id/score', scoreLead);
router.post('/:id/qualify', qualifyLead);
router.get('/:id', getLeadById);

// Sub-routers for polymorphic entities
router.use('/:id/activities', activitiesRoutes);
router.use('/:id/tasks', tasksRoutes);
router.use('/:id/files', filesRoutes);

export default router;
