import { prisma } from '../../lib/db';

export class ReportsService {
    static async getRevenueData(companyId: string, range: string): Promise<any> {
        // Fetch actual invoice/payment data from DB
        const payments = await prisma.payment.findMany({
            where: { companyId },
            orderBy: { date: 'asc' }
        });

        const invoices = await prisma.invoice.findMany({
            where: { companyId }
        });

        const totalRevenue = payments
            .filter(p => p.status === 'Completed' || p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);

        const pendingRevenue = invoices
            .filter(i => i.status === 'unpaid' || i.status === 'pending')
            .reduce((sum, i) => sum + i.amount, 0);

        // Group payments by date for trend chart
        const revenueByDate: Record<string, number> = {};
        payments.forEach(p => {
            const dateStr = p.date.toISOString().split('T')[0];
            revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + p.amount;
        });

        const chartData = Object.keys(revenueByDate).map(date => ({
            date,
            revenue: revenueByDate[date]
        }));

        return {
            totalRevenue,
            pendingRevenue,
            totalInvoices: invoices.length,
            chartData: chartData.length > 0 ? chartData : [
                { date: new Date().toISOString().split('T')[0], revenue: totalRevenue || 0 }
            ]
        };
    }

    static async getDealsData(companyId: string, range: string): Promise<any> {
        const deals = await prisma.deal.findMany({
            where: { companyId },
            include: { stage: true }
        });

        const totalDeals = deals.length;
        const totalDealValue = deals.reduce((sum, d) => sum + d.value, 0);

        // Group by stage
        const stageCounts: Record<string, { count: number, value: number }> = {};
        deals.forEach(d => {
            const stageName = d.stage?.name || 'Unknown';
            if (!stageCounts[stageName]) {
                stageCounts[stageName] = { count: 0, value: 0 };
            }
            stageCounts[stageName].count += 1;
            stageCounts[stageName].value += d.value;
        });

        const stageBreakdown = Object.keys(stageCounts).map(stage => ({
            stage,
            count: stageCounts[stage].count,
            value: stageCounts[stage].value
        }));

        return {
            totalDeals,
            totalDealValue,
            stageBreakdown
        };
    }

    static async getLeadsData(companyId: string, range: string): Promise<any> {
        const leads = await prisma.lead.findMany({
            where: { companyId }
        });

        const totalLeads = leads.length;

        // Group by status
        const statusCounts: Record<string, number> = {};
        const sourceCounts: Record<string, number> = {};

        leads.forEach(l => {
            const status = l.status || 'New';
            statusCounts[status] = (statusCounts[status] || 0) + 1;

            const source = l.source || 'Direct';
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });

        return {
            totalLeads,
            statusBreakdown: Object.keys(statusCounts).map(status => ({ status, count: statusCounts[status] })),
            sourceBreakdown: Object.keys(sourceCounts).map(source => ({ source, count: sourceCounts[source] }))
        };
    }

    static async getOverview(companyId: string): Promise<any> {
        // Get real-time dashboard overview data
        const [leads, deals, customers, invoices, payments] = await Promise.all([
            prisma.lead.count({ where: { companyId } }),
            prisma.deal.count({ where: { companyId } }),
            prisma.customer.count({ where: { companyId } }),
            prisma.invoice.count({ where: { companyId } }),
            prisma.payment.count({ where: { companyId, status: 'completed' } })
        ]);

        const totalRevenue = await prisma.payment.aggregate({
            where: { companyId, status: 'completed' },
            _sum: { amount: true }
        });

        const totalDealValue = await prisma.deal.aggregate({
            where: { companyId },
            _sum: { value: true }
        });

        const recentLeads = await prisma.lead.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                name: true,
                companyName: true,
                status: true,
                createdAt: true
            }
        });

        const recentDeals = await prisma.deal.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                value: true,
                createdAt: true
            }
        });

        return {
            stats: {
                totalLeads: leads,
                totalDeals: deals,
                totalCustomers: customers,
                totalInvoices: invoices,
                totalPayments: payments,
                totalRevenue: totalRevenue._sum.amount || 0,
                totalDealValue: totalDealValue._sum.value || 0
            },
            recentLeads,
            recentDeals
        };
    }
}
