import { prisma } from '../../lib/db';
import { CompaniesService } from '../companies/companies.service';

export class SettingsService {
    /**
     * Get workspace settings for a company (with optimized counts & overview)
     */
    static async getWorkspaceSettings(companyId: string) {
        // Fetch base company profile from dedicated CompaniesService
        const profile = await CompaniesService.getMyCompany(companyId);

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Fetch counts and aggregates in parallel via database indexes instead of loading all rows into RAM
        const [
            totalUsers,
            activeUsers,
            totalLeads,
            totalDeals,
            totalCustomers,
            totalInvoices,
            totalPayments,
            pendingInvoices,
            revenueResult,
            newLeads7d,
            newDeals7d,
            recentLeads,
            recentDeals,
            recentInvoices,
            recentPayments
        ] = await Promise.all([
            prisma.user.count({ where: { companyId } }),
            prisma.user.count({ where: { companyId, active: true } }),
            prisma.lead.count({ where: { companyId } }),
            prisma.deal.count({ where: { companyId } }),
            prisma.customer.count({ where: { companyId } }),
            prisma.invoice.count({ where: { companyId } }),
            prisma.payment.count({ where: { companyId } }),
            prisma.invoice.count({ where: { companyId, status: { in: ['unpaid', 'pending'] } } }),
            prisma.payment.aggregate({
                where: { companyId, status: { in: ['completed', 'Completed', 'success', 'Success'] } },
                _sum: { amount: true }
            }),
            prisma.lead.count({ where: { companyId, createdAt: { gte: sevenDaysAgo } } }),
            prisma.deal.count({ where: { companyId, createdAt: { gte: sevenDaysAgo } } }),
            prisma.lead.findMany({
                where: { companyId },
                select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.deal.findMany({
                where: { companyId },
                select: { id: true, title: true, value: true, stage: { select: { name: true } }, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.invoice.findMany({
                where: { companyId },
                select: { id: true, amount: true, status: true, dueDate: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.payment.findMany({
                where: { companyId },
                select: { id: true, amount: true, method: true, status: true, date: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        ]);

        const stats = {
            totalUsers,
            totalLeads,
            totalDeals,
            totalCustomers,
            totalInvoices,
            totalPayments,
            totalRevenue: revenueResult._sum.amount || 0,
            pendingInvoices,
            activeUsers,
            recentActivity: {
                newLeads: newLeads7d,
                newDeals: newDeals7d,
                completedPayments: 0
            }
        };

        return {
            ...profile,
            stats,
            recentData: {
                recentLeads,
                recentDeals: recentDeals.map(deal => ({
                    id: deal.id,
                    title: deal.title,
                    value: deal.value,
                    stage: deal.stage?.name || 'Unknown',
                    createdAt: deal.createdAt
                })),
                recentInvoices,
                recentPayments
            }
        };
    }

    /**
     * Update workspace settings
     */
    static async updateWorkspaceSettings(companyId: string, updates: any) {
        await CompaniesService.updateMyCompany(companyId, updates);
        return this.getWorkspaceSettings(companyId);
    }

    /**
     * Get team members for a company
     */
    static async getTeamMembers(companyId: string) {
        const users = await prisma.user.findMany({
            where: { companyId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                active: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return users;
    }

    /**
     * Get recent activity for a company
     */
    static async getRecentActivity(companyId: string, limit: number = 20) {
        const [
            recentLeads,
            recentDeals,
            recentInvoices,
            recentPayments,
            recentActivities
        ] = await Promise.all([
            prisma.lead.findMany({
                where: { companyId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    status: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            }),
            prisma.deal.findMany({
                where: { companyId },
                select: {
                    id: true,
                    title: true,
                    value: true,
                    stage: { select: { name: true } },
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            }),
            prisma.invoice.findMany({
                where: { companyId },
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    dueDate: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            }),
            prisma.payment.findMany({
                where: { companyId },
                select: {
                    id: true,
                    amount: true,
                    method: true,
                    status: true,
                    date: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            }),
            prisma.activity.findMany({
                where: { companyId },
                select: {
                    id: true,
                    type: true,
                    description: true,
                    performedBy: { select: { name: true, email: true } },
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            })
        ]);

        return {
            leads: recentLeads,
            deals: recentDeals,
            invoices: recentInvoices,
            payments: recentPayments,
            activities: recentActivities.map(act => ({
                id: act.id,
                type: act.type,
                description: act.description,
                user: act.performedBy ? { name: act.performedBy.name } : null,
                createdAt: act.createdAt
            }))
        };
    }
}