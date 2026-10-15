import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { CompaniesService } from './companies.service';

/**
 * GET /api/v1/companies/me - Get current user's company profile
 */
export const getMyCompany = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(401).json({ message: 'Not authorized or company not found' });
        }

        const company = await CompaniesService.getMyCompany(companyId);
        res.status(200).json(company);
    } catch (error: any) {
        res.status(error.message === 'Company not found' ? 404 : 500).json({ message: error.message });
    }
};

/**
 * PUT /api/v1/companies/me - Update current user's company profile
 */
export const updateMyCompany = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(401).json({ message: 'Not authorized or company not found' });
        }

        const updated = await CompaniesService.updateMyCompany(companyId, req.body);
        res.status(200).json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/v1/companies - List companies with pagination (Admin/Multi-tenant)
 */
export const getCompanies = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '10');
        const search = (req.query.search as string) || '';

        const result = await CompaniesService.listCompanies(page, limit, search);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/v1/companies/:id - Get company by ID
 */
export const getCompanyById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const company = await CompaniesService.getMyCompany(id);
        res.status(200).json(company);
    } catch (error: any) {
        res.status(error.message === 'Company not found' ? 404 : 500).json({ message: error.message });
    }
};

/**
 * POST /api/v1/companies - Create a company
 */
export const createCompany = async (req: AuthRequest, res: Response) => {
    try {
        const { name, domain, plan } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Company name is required' });
        }

        const company = await CompaniesService.createCompany({ name, domain, plan });
        res.status(201).json(company);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Company with this domain already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * PUT /api/v1/companies/:id - Update company by ID
 */
export const updateCompany = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updated = await CompaniesService.updateCompanyById(id, req.body);
        res.status(200).json(updated);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Company not found' });
        }
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Company with this domain already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * DELETE /api/v1/companies/:id - Delete company
 */
export const deleteCompany = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await CompaniesService.deleteCompany(id);
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/v1/companies/upload - Upload media (logo, signature) to Cloudinary via backend
 */
export const uploadCompanyMedia = async (req: AuthRequest, res: Response) => {
    try {
        const { file, folder } = req.body;
        if (!file) {
            return res.status(400).json({ message: 'No file provided' });
        }
        const result = await CompaniesService.uploadMedia(file, folder || 'company_branding');
        res.status(200).json(result);
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: error.message || 'Failed to upload media to Cloudinary' });
    }
};
