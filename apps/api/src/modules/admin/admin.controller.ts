import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { AdminService } from './admin.service';
import { prisma } from '../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        const ADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@platform.com';
        const ADMIN_PASS = process.env.SUPERADMIN_PASSWORD || 'admin123';

        let user = await prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });

        // If user does not exist yet and matches master platform admin, auto-create
        if (!user && email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS) {
            let company = await prisma.company.findFirst({
                where: { domain: 'platform.local' }
            });
            if (!company) {
                company = await prisma.company.create({
                    data: {
                        name: 'Platform Administration',
                        domain: 'platform.local',
                        plan: 'enterprise',
                        active: true
                    }
                });
            }

            let role = await prisma.role.findFirst({
                where: { companyId: company.id, name: 'superadmin' }
            });
            if (!role) {
                role = await prisma.role.create({
                    data: {
                        companyId: company.id,
                        name: 'superadmin',
                        permissions: ['*']
                    }
                });
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            user = await prisma.user.create({
                data: {
                    name: 'Platform Super Admin',
                    email,
                    passwordHash,
                    roleId: role.id,
                    companyId: company.id,
                    active: true
                },
                include: { role: true }
            });
        }

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch && !(email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS)) {
            return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
        }

        // Verify superadmin privilege
        const roleName = user.role?.name?.toLowerCase().replace(/[\s_-]/g, '');
        const isSuperAdmin = roleName === 'superadmin' || user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        if (!isSuperAdmin) {
            return res.status(403).json({ success: false, error: 'Access denied: Not a super administrator' });
        }

        const token = jwt.sign(
            { userId: user.id, companyId: user.companyId },
            process.env.JWT_SECRET || 'super-secret-jwt-key-replace-me-in-production',
            { expiresIn: '7d' }
        );

        return res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: 'superadmin',
                    companyId: user.companyId
                }
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getTenants = async (req: AuthRequest, res: Response) => {
    try {
        const tenants = await AdminService.getTenants();
        res.json(tenants);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPlatformAdmins = async (req: AuthRequest, res: Response) => {
    try {
        const admins = await AdminService.getPlatformAdmins();
        res.json(admins);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUsageMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const metrics = await AdminService.getUsageMetrics();
        res.json(metrics);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSystemOverview = async (req: AuthRequest, res: Response) => {
    try {
        const overview = await AdminService.getSystemOverview();
        res.json(overview);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getRecentTenants = async (req: AuthRequest, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const tenants = await AdminService.getRecentTenants(limit);
        res.json(tenants);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createPlatformAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, password, role, phone } = req.body;
        if (!name || !email) {
            return res.status(400).json({ success: false, error: 'Name and email are required' });
        }

        const existing = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });
        if (existing) {
            return res.status(400).json({ success: false, error: 'User with this email already exists' });
        }

        const admin = await AdminService.createPlatformAdmin({ name, email, password, role, phone });
        res.status(201).json({ success: true, data: admin });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};