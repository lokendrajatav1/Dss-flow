import { prisma } from '../../lib/db';
import { uploadToCloudinary } from '../../lib/cloudinary';

export class CompaniesService {
    /**
     * Safely fetch profileJson from database using raw query to avoid Prisma Client sync issues
     */
    private static async getRawProfileJson(companyId: string): Promise<string | null> {
        try {
            const result: any[] = await prisma.$queryRawUnsafe(
                'SELECT "profileJson" FROM "Company" WHERE id = $1 LIMIT 1',
                companyId
            );
            return result[0]?.profileJson || null;
        } catch {
            // If column doesn't exist yet, ensure it exists
            try {
                await prisma.$executeRawUnsafe('ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "profileJson" TEXT;');
            } catch {}
            return null;
        }
    }

    /**
     * Safely save profileJson to database
     */
    private static async saveRawProfileJson(companyId: string, profileJson: string, name?: string): Promise<void> {
        try {
            if (name) {
                await prisma.$executeRawUnsafe(
                    'UPDATE "Company" SET name = $1, "profileJson" = $2, "updatedAt" = NOW() WHERE id = $3',
                    name,
                    profileJson,
                    companyId
                );
            } else {
                await prisma.$executeRawUnsafe(
                    'UPDATE "Company" SET "profileJson" = $1, "updatedAt" = NOW() WHERE id = $2',
                    profileJson,
                    companyId
                );
            }
        } catch {
            // Column may not exist, create it and retry
            try {
                await prisma.$executeRawUnsafe('ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "profileJson" TEXT;');
                if (name) {
                    await prisma.$executeRawUnsafe(
                        'UPDATE "Company" SET name = $1, "profileJson" = $2, "updatedAt" = NOW() WHERE id = $3',
                        name,
                        profileJson,
                        companyId
                    );
                } else {
                    await prisma.$executeRawUnsafe(
                        'UPDATE "Company" SET "profileJson" = $1, "updatedAt" = NOW() WHERE id = $2',
                        profileJson,
                        companyId
                    );
                }
            } catch {}
        }
    }

    /**
     * Safely parse profile JSON string
     */
    static parseProfile(profileJson?: string | null): Record<string, any> {
        if (!profileJson) return {};
        try {
            return JSON.parse(profileJson);
        } catch {
            return {};
        }
    }

    /**
     * Format company object with parsed profile properties
     */
    static formatCompany(company: any, profileJson?: string | null) {
        const rawJson = profileJson || company.profileJson;
        const profile = this.parseProfile(rawJson);

        return {
            id: company.id,
            name: company.name,
            companyName: profile.companyName || company.name || '',
            domain: company.domain || '',
            plan: company.plan,
            active: company.active,
            logo: profile.logo || '',
            signature: profile.signature || profile.sign || '',
            gstNumber: profile.gstNumber || '',
            panNumber: profile.panNumber || '',
            phone: profile.phone || '',
            email: profile.email || '',
            website: profile.website || '',
            address: profile.address || '',
            country: profile.country || 'India',
            city: profile.city || '',
            state: profile.state || '',
            pincode: profile.pincode || '',
            currency: profile.currency || 'INR (₹)',
            timezone: profile.timezone || 'Asia/Kolkata (IST)',
            paymentTerms: profile.paymentTerms || '',
            bankName: profile.bankName || '',
            accountName: profile.accountName || '',
            accountNumber: profile.accountNumber || '',
            ifscCode: profile.ifscCode || '',
            upiId: profile.upiId || '',
            profileJson: rawJson,
            company: {
                id: company.id,
                name: profile.companyName || company.name,
                domain: company.domain || '',
                plan: company.plan,
                active: company.active,
                createdAt: company.createdAt,
                updatedAt: company.updatedAt
            },
            createdAt: company.createdAt,
            updatedAt: company.updatedAt
        };
    }

    /**
     * Get current user's company profile
     */
    static async getMyCompany(companyId: string) {
        const [company, rawProfileJson] = await Promise.all([
            prisma.company.findUnique({
                where: { id: companyId },
                select: {
                    id: true,
                    name: true,
                    domain: true,
                    plan: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true
                }
            }),
            this.getRawProfileJson(companyId)
        ]);

        if (!company) {
            throw new Error('Company not found');
        }

        return this.formatCompany(company, rawProfileJson);
    }

    /**
     * Upload media to Cloudinary (backend only)
     */
    static async uploadMedia(fileData: string, folder: string = 'company_branding') {
        return uploadToCloudinary(fileData, folder);
    }

    /**
     * Update current user's company profile
     */
    static async updateMyCompany(companyId: string, updates: any) {
        const [company, currentProfileJson] = await Promise.all([
            prisma.company.findUnique({
                where: { id: companyId },
                select: { id: true, name: true }
            }),
            this.getRawProfileJson(companyId)
        ]);

        if (!company) {
            throw new Error('Company not found');
        }

        // Auto-upload base64 logo to Cloudinary if provided as data URI
        if (updates.logo && typeof updates.logo === 'string' && updates.logo.startsWith('data:image/')) {
            try {
                const uploaded = await uploadToCloudinary(updates.logo, 'logos');
                updates.logo = uploaded.url;
            } catch (err) {
                console.error('Failed to upload logo to Cloudinary:', err);
            }
        }

        // Auto-upload base64 signature to Cloudinary if provided as data URI
        if (updates.signature && typeof updates.signature === 'string' && updates.signature.startsWith('data:image/')) {
            try {
                const uploaded = await uploadToCloudinary(updates.signature, 'signatures');
                updates.signature = uploaded.url;
            } catch (err) {
                console.error('Failed to upload signature to Cloudinary:', err);
            }
        }

        const existingProfile = this.parseProfile(currentProfileJson);
        const merged = { ...existingProfile, ...updates };
        const profileJsonString = JSON.stringify(merged);
        const resolvedName = updates.companyName || updates.name || undefined;

        await this.saveRawProfileJson(companyId, profileJsonString, resolvedName);

        return this.getMyCompany(companyId);
    }

    /**
     * List companies (admin view with pagination)
     */
    static async listCompanies(page = 1, limit = 10, search = '') {
        const skip = (page - 1) * limit;
        const whereClause = search
            ? {
                  OR: [
                      { name: { contains: search, mode: 'insensitive' as const } },
                      { domain: { contains: search, mode: 'insensitive' as const } }
                  ]
              }
            : {};

        const [companies, total] = await Promise.all([
            prisma.company.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    domain: true,
                    plan: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.company.count({ where: whereClause })
        ]);

        return {
            data: companies.map(c => this.formatCompany(c, null)),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Create a new company
     */
    static async createCompany(data: { name: string; domain?: string; plan?: string }) {
        const company = await prisma.company.create({
            data: {
                name: data.name,
                domain: data.domain || null,
                plan: data.plan || 'trial',
                active: true
            },
            select: {
                id: true,
                name: true,
                domain: true,
                plan: true,
                active: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return this.formatCompany(company, null);
    }

    /**
     * Update company by ID (Admin)
     */
    static async updateCompanyById(id: string, data: any) {
        const company = await prisma.company.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                domain: true,
                plan: true,
                active: true,
                createdAt: true,
                updatedAt: true
            }
        });

        const rawProfileJson = await this.getRawProfileJson(id);
        return this.formatCompany(company, rawProfileJson);
    }

    /**
     * Delete company by ID (Admin)
     */
    static async deleteCompany(id: string) {
        return prisma.company.delete({
            where: { id }
        });
    }
}
