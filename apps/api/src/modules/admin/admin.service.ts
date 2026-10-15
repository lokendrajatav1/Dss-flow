import { prisma } from '../../lib/db';
import bcrypt from 'bcryptjs';

export class AdminService {
    /**
     * Get all tenants (companies) for super admin
     */
    static async getTenants() {
        const companies = await prisma.company.findMany({
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                leads: {
                    select: { id: true }
                },
                Deal: {
                    select: { id: true, value: true }
                },
                Invoice: {
                    select: { id: true, amount: true, status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return companies.map(company => ({
            id: company.id,
            name: company.name,
            domain: company.domain || '',
            plan: company.plan,
            status: company.active ? 'Active' : 'Inactive',
            since: company.createdAt.toISOString().split('T')[0],
            users: company.users,
            leadsCount: company.leads.length,
            dealsCount: company.Deal.length,
            totalDealValue: company.Deal.reduce((sum, d) => sum + d.value, 0),
            invoicesCount: company.Invoice.length,
            totalRevenue: company.Invoice
                .filter(i => i.status === 'paid')
                .reduce((sum, i) => sum + i.amount, 0)
        }));
    }

    /**
     * Get platform admins (users with admin roles)
     */
    static async getPlatformAdmins() {
        const admins = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        role: {
                            name: {
                                in: ['admin', 'super_admin', 'superadmin', 'owner', 'Platform Admin', 'Super Admin']
                            }
                        }
                    },
                    {
                        company: {
                            domain: 'platform.local'
                        }
                    },
                    {
                        email: {
                            contains: 'admin@platform.com'
                        }
                    }
                ]
            },
            include: {
                company: {
                    select: {
                        name: true,
                        plan: true
                    }
                },
                role: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return admins.map(admin => ({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone || '',
            role: admin.role?.name || 'Super Admin',
            status: admin.active ? 'Active' : 'Inactive',
            company: admin.company?.name || 'Platform',
            companyPlan: admin.company?.plan || 'Platform',
            lastActive: admin.createdAt.toISOString()
        }));
    }

    /**
     * Create a new platform / super admin user
     */
    static async createPlatformAdmin(data: { name: string; email: string; password?: string; role?: string; phone?: string }) {
        let platformCompany = await prisma.company.findFirst({
            where: { domain: 'platform.local' }
        });

        if (!platformCompany) {
            platformCompany = await prisma.company.create({
                data: {
                    name: 'Platform Administration',
                    domain: 'platform.local',
                    plan: 'enterprise',
                    active: true,
                }
            });
        }

        const roleName = data.role?.toLowerCase() || 'superadmin';
        let superAdminRole = await prisma.role.findFirst({
            where: {
                companyId: platformCompany.id,
                name: roleName
            }
        });

        if (!superAdminRole) {
            superAdminRole = await prisma.role.create({
                data: {
                    companyId: platformCompany.id,
                    name: roleName,
                    permissions: ['*']
                }
            });
        }

        const rawPassword = data.password || 'admin123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(rawPassword, salt);

        const newAdmin = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email.toLowerCase().trim(),
                phone: data.phone || null,
                passwordHash,
                roleId: superAdminRole.id,
                companyId: platformCompany.id,
                active: true,
            },
            include: {
                role: true,
                company: true
            }
        });

        return {
            id: newAdmin.id,
            name: newAdmin.name,
            email: newAdmin.email,
            phone: newAdmin.phone || '',
            role: newAdmin.role?.name || 'superadmin',
            status: newAdmin.active ? 'Active' : 'Inactive',
            company: newAdmin.company?.name || 'Platform',
            companyPlan: newAdmin.company?.plan || 'Platform',
            lastActive: newAdmin.createdAt.toISOString()
        };
    }

    /**
     * Get usage metrics for all tenants
     */
    static async getUsageMetrics() {
        const companies = await prisma.company.findMany({
            include: {
                leads: { select: { id: true } },
                Deal: { select: { id: true } },
                customers: { select: { id: true } },
                Invoice: { select: { id: true, amount: true, status: true } },
                Payment: { select: { id: true, amount: true } },
                emailMessages: { select: { id: true } },
                Activity: { select: { id: true } }
            }
        });

        // Define plan limits
        const planLimits: Record<string, any> = {
            enterprise: { storageGb: 1000, dbRows: 1000000, apiCalls: 100000, aiTokens: 500000 },
            pro: { storageGb: 100, dbRows: 100000, apiCalls: 50000, aiTokens: 100000 },
            basic: { storageGb: 10, dbRows: 10000, apiCalls: 10000, aiTokens: 20000 },
            trial: { storageGb: 1, dbRows: 1000, apiCalls: 1000, aiTokens: 2000 }
        };

        return companies.map(company => {
            const plan = company.plan || 'trial';
            const limits = planLimits[plan] || planLimits.trial;

            // Calculate metrics (estimates based on data counts)
            const storageUsed = Math.round((company.leads.length + company.Deal.length + company.customers.length) * 0.01 * 10) / 10;
            const dbRows = company.leads.length + company.Deal.length + company.customers.length +
                company.Invoice.length + company.Payment.length + company.emailMessages.length +
                company.Activity.length;
            const apiCalls = Math.round(dbRows * 10);
            const aiTokens = Math.round(company.leads.length * 1000);

            return {
                tenantId: company.id,
                tenantName: company.name,
                domain: company.domain || '',
                plan: company.plan,
                autoBillOverages: company.active,
                metrics: {
                    storageGb: { used: storageUsed, limit: limits.storageGb },
                    dbRows: { used: dbRows, limit: limits.dbRows },
                    apiCalls: { used: apiCalls, limit: limits.apiCalls },
                    aiTokens: { used: aiTokens, limit: limits.aiTokens }
                }
            };
        });
    }

    /**
     * Get system overview stats
     */
    static async getSystemOverview() {
        const [
            totalTenants,
            activeTenants,
            totalUsers,
            totalLeads,
            totalDeals,
            totalRevenue
        ] = await Promise.all([
            prisma.company.count(),
            prisma.company.count({ where: { active: true } }),
            prisma.user.count(),
            prisma.lead.count(),
            prisma.deal.count(),
            prisma.payment.aggregate({
                where: { status: 'completed' },
                _sum: { amount: true }
            })
        ]);

        const planDistribution = await prisma.company.groupBy({
            by: ['plan'],
            _count: true
        });

        return {
            totalTenants,
            activeTenants,
            totalUsers,
            totalLeads,
            totalDeals,
            totalRevenue: totalRevenue._sum.amount || 0,
            planDistribution: planDistribution.map(p => ({
                plan: p.plan,
                count: p._count
            }))
        };
    }

    /**
     * Get recent tenants
     */
    static async getRecentTenants(limit: number = 10) {
        const tenants = await prisma.company.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        return tenants.map(tenant => ({
            id: tenant.id,
            name: tenant.name,
            domain: tenant.domain || '',
            plan: tenant.plan,
            status: tenant.active ? 'Active' : 'Inactive',
            since: tenant.createdAt.toISOString().split('T')[0]
        }));
    }
}