import { Router } from 'express';
import {
    getMyCompany,
    updateMyCompany,
    getCompanies,
    createCompany,
    getCompanyById,
    updateCompany,
    deleteCompany,
    uploadCompanyMedia
} from './companies.controller';
import { protect } from '../../middlewares/authMiddleware';

const router = Router();

// Current tenant company routes (Industry standard REST: /companies/me)
router.get('/me', protect, getMyCompany);
router.put('/me', protect, updateMyCompany);
router.patch('/me', protect, updateMyCompany);
router.post('/upload', protect, uploadCompanyMedia);

// Admin / Multi-tenant routes
router.get('/', protect, getCompanies);
router.post('/', protect, createCompany);
router.get('/:id', protect, getCompanyById);
router.put('/:id', protect, updateCompany);
router.delete('/:id', protect, deleteCompany);

export default router;
