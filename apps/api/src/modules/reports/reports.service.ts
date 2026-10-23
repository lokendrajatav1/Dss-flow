import { prisma } from '../../lib/db';

export class ReportsService {
    static getDateFilter(range?: string): Date | null {
        if (!range || range === 'all') return null;
        const now = new Date();
        if (range === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (range === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (range === '90d') return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        if (range === '1y') return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return null;
    }

    static async getRevenueData(companyId: string, range: string): Promise<any> {
        const dateFrom = this.getDateFilter(range);

        const payments = await prisma.payment.findMany({
            where: {
                companyId,
                ...(dateFrom ? { date: { gte: dateFrom } } : {})
            },
            orderBy: { date: 'asc' }
        });

        const invoices = await prisma.invoice.findMany({
            where: {
                companyId,
                ...(dateFrom ? { createdAt: { gte: dateFrom } } : {})
            }
        });

        const deals = await prisma.deal.findMany({
            where: {
                companyId,
                ...(dateFrom ? { createdAt: { gte: dateFrom } } : {})
            },
            include: { stage: true }
        });

        const completedPaymentsRevenue = payments
            .filter(p => p.status?.toLowerCase() === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const paidInvoicesRevenue = invoices
            .filter(i => i.status?.toLowerCase() === 'paid')
            .reduce((sum, i) => sum + (i.amount || 0), 0);

        const wonDealsValue = deals
            .filter(d => d.stage?.name?.toLowerCase().includes('won') || d.stage?.name?.toLowerCase().includes('close'))
            .reduce((sum, d) => sum + (d.value || 0), 0);

        const totalRevenue = completedPaymentsRevenue || paidInvoicesRevenue || wonDealsValue || 0;

        const pendingRevenue = invoices
            .filter(i => i.status?.toLowerCase() === 'unpaid' || i.status?.toLowerCase() === 'pending')
            .reduce((sum, i) => sum + (i.amount || 0), 0);

        // Group payments/invoices by date for trend chart
        const revenueByDate: Record<string, number> = {};
        payments.forEach(p => {
            const dateStr = p.date ? p.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + (p.amount || 0);
        });

        if (Object.keys(revenueByDate).length === 0 && invoices.length > 0) {
            invoices.forEach(inv => {
                const dateStr = inv.createdAt.toISOString().split('T')[0];
                revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + (inv.amount || 0);
            });
        }

        const chartData = Object.keys(revenueByDate).map(date => ({
            date,
            revenue: revenueByDate[date]
        }));

        return {
            totalRevenue,
            pendingRevenue,
            totalInvoices: invoices.length,
            chartData
        };
    }

    static async getDealsData(companyId: string, range: string): Promise<any> {
        const dateFrom = this.getDateFilter(range);

        const deals = await prisma.deal.findMany({
            where: {
                companyId,
                ...(dateFrom ? { createdAt: { gte: dateFrom } } : {})
            },
            include: { stage: true }
        });

        const pipelineStages = await prisma.pipelineStage.findMany({
            where: { pipeline: { companyId } },
            orderBy: { order: 'asc' }
        });

        const totalDeals = deals.length;
        const totalDealValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

        // Group by stage
        const stageMap: Record<string, { count: number; value: number; color: string }> = {};

        if (pipelineStages.length > 0) {
            pipelineStages.forEach(st => {
                stageMap[st.name] = { count: 0, value: 0, color: st.color || '#3B82F6' };
            });
        }

        deals.forEach(d => {
            const stageName = d.stage?.name || 'New';
            if (!stageMap[stageName]) {
                stageMap[stageName] = { count: 0, value: 0, color: d.stage?.color || '#3B82F6' };
            }
            stageMap[stageName].count += 1;
            stageMap[stageName].value += (d.value || 0);
        });

        const stageBreakdown = Object.keys(stageMap).map(stage => ({
            stage,
            count: stageMap[stage].count,
            value: stageMap[stage].value,
            color: stageMap[stage].color,
            percentage: totalDeals > 0 ? Math.round((stageMap[stage].count / totalDeals) * 100) : 0
        }));

        return {
            totalDeals,
            totalDealValue,
            stageBreakdown
        };
    }

    static async getLeadsData(companyId: string, range: string): Promise<any> {
        const dateFrom = this.getDateFilter(range);

        const leads = await prisma.lead.findMany({
            where: {
                companyId,
                ...(dateFrom ? { createdAt: { gte: dateFrom } } : {})
            },
            orderBy: { createdAt: 'asc' }
        });

        const totalLeads = leads.length;

        const statusCounts: Record<string, number> = {};
        const sourceCounts: Record<string, number> = {};
        const trendByDate: Record<string, number> = {};
        let qualifiedCount = 0;

        leads.forEach(l => {
            const status = l.status || 'New';
            statusCounts[status] = (statusCounts[status] || 0) + 1;

            const source = l.source || 'Direct';
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;

            if (l.isQualified || status.toLowerCase().includes('qualified') || status.toLowerCase().includes('won')) {
                qualifiedCount += 1;
            }

            const dateStr = l.createdAt.toISOString().split('T')[0];
            trendByDate[dateStr] = (trendByDate[dateStr] || 0) + 1;
        });

        const conversionRate = totalLeads > 0 ? Math.round((qualifiedCount / totalLeads) * 100) : 0;

        return {
            totalLeads,
            qualifiedCount,
            conversionRate,
            statusBreakdown: Object.keys(statusCounts).map(status => ({
                status,
                count: statusCounts[status],
                percentage: totalLeads > 0 ? Math.round((statusCounts[status] / totalLeads) * 100) : 0
            })),
            sourceBreakdown: Object.keys(sourceCounts).map(source => ({
                source,
                count: sourceCounts[source],
                percentage: totalLeads > 0 ? Math.round((sourceCounts[source] / totalLeads) * 100) : 0
            })),
            trendData: Object.keys(trendByDate).map(date => ({
                date,
                leads: trendByDate[date]
            }))
        };
    }

    static async getOverview(companyId: string): Promise<any> {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
            todayLeadsCount,
            sevenDayUntouchedCount,
            totalUntouchedCount,
            todayFollowupsCount,
            totalLeadsCount,
            dealsCount,
            clientsCount,
            followupLeadsCount,
            meetingScheduledCount,
            totalSalesAgg,
            leadGroups,
            reminders,
            activities,
            callStatusGroup,
            recentLeads,
            recentDeals,
            recentTasks,
            invoicesCount,
            paymentsCount,
            totalRevenueAgg
        ] = await Promise.all([
            // 1. Today Leads
            prisma.lead.count({ where: { companyId, createdAt: { gte: startOfToday } } }),
            // 2. 7-Day Untouched
            prisma.lead.count({ where: { companyId, callStatus: 'Untouched', createdAt: { lte: sevenDaysAgo } } }),
            // 3. Total Untouched
            prisma.lead.count({ where: { companyId, callStatus: 'Untouched' } }),
            // 4. Today's Follow-ups
            prisma.lead.count({ where: { companyId, nextFollowUp: { gte: startOfToday } } }),
            // 5. Total Lead
            prisma.lead.count({ where: { companyId } }),
            // 6. Deals
            prisma.deal.count({ where: { companyId } }),
            // 7. Clients (Customers)
            prisma.customer.count({ where: { companyId } }),
            // 8. Follow-up Leads
            prisma.lead.count({
                where: {
                    companyId,
                    callStatus: { in: ['Follow-up Required', 'Call Back Later', 'Callback Scheduled'] }
                }
            }),
            // 9. Meeting Scheduled
            prisma.lead.count({ where: { companyId, callStatus: 'Meeting Scheduled' } }),
            // Total Deal Value
            prisma.deal.aggregate({ where: { companyId }, _sum: { value: true } }),
            // Lead groups
            prisma.leadGroup.findMany({
                where: { companyId },
                include: { _count: { select: { leads: true } } }
            }),
            // Appointments / Reminders
            prisma.lead.findMany({
                where: { companyId, nextFollowUp: { not: null } },
                orderBy: { nextFollowUp: 'asc' },
                take: 10,
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    companyName: true,
                    nextFollowUp: true,
                    callStatus: true
                }
            }),
            // Recent activities
            prisma.activity.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    performedBy: { select: { id: true, name: true } },
                    lead: { select: { id: true, name: true, phone: true } },
                    deal: { select: { id: true, title: true } }
                }
            }),
            // Leads collected callStatus breakdown
            prisma.lead.groupBy({
                by: ['callStatus'],
                where: { companyId },
                _count: { id: true }
            }),
            // Recent leads
            prisma.lead.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                take: 6,
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    companyName: true,
                    status: true,
                    callStatus: true,
                    source: true,
                    createdAt: true
                }
            }),
            // Recent deals
            prisma.deal.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    value: true,
                    createdAt: true,
                    stage: { select: { name: true, color: true } }
                }
            }),
            // Recent tasks
            prisma.task.findMany({
                where: {
                    companyId,
                    status: { notIn: ['completed', 'Completed', 'done', 'Done'] }
                },
                orderBy: { dueDate: 'asc' },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    priority: true,
                    status: true,
                    dueDate: true
                }
            }),
            // Invoices count
            prisma.invoice.count({ where: { companyId } }),
            // Payments count
            prisma.payment.count({ where: { companyId, status: 'completed' } }),
            // Total payments revenue
            prisma.payment.aggregate({
                where: { companyId, status: 'completed' },
                _sum: { amount: true }
            })
        ]);

        const totalSales = totalSalesAgg._sum.value || 0;
        const avgSaleValue = dealsCount > 0 ? Math.round(totalSales / dealsCount) : 0;
        const totalRevenue = totalRevenueAgg._sum.amount || 0;

        // Group status items matching standard CRM disposition metrics (Untouch, Follow-up Required, Not Answered)
        const dispositionCounts: Record<string, number> = {
            'Untouch': 0,
            'Follow-up Required': 0,
            'Not Answered': 0
        };

        callStatusGroup.forEach(item => {
            const rawStatus = (item.callStatus || '').toLowerCase();
            if (!rawStatus || rawStatus.includes('untouch') || rawStatus.includes('new')) {
                dispositionCounts['Untouch'] += item._count.id;
            } else if (rawStatus.includes('follow') || rawStatus.includes('callback') || rawStatus.includes('call back')) {
                dispositionCounts['Follow-up Required'] += item._count.id;
            } else if (rawStatus.includes('not answer') || rawStatus.includes('busy') || rawStatus.includes('ringing') || rawStatus.includes('unreachable')) {
                dispositionCounts['Not Answered'] += item._count.id;
            } else {
                const cleanName = item.callStatus || 'Other';
                dispositionCounts[cleanName] = (dispositionCounts[cleanName] || 0) + item._count.id;
            }
        });

        const totalTrackedLeads = Object.values(dispositionCounts).reduce((a, b) => a + b, 0);

        const leadsCollected = Object.keys(dispositionCounts).map(status => ({
            status,
            count: dispositionCounts[status],
            percentage: totalTrackedLeads > 0 ? Math.round((dispositionCounts[status] / totalTrackedLeads) * 100) : 0
        }));

        // Revenue timeline for current month with real invoice sales & won deal sales
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const [monthInvoices, monthWonDeals] = await Promise.all([
            prisma.invoice.findMany({
                where: {
                    companyId,
                    createdAt: { gte: startOfMonth, lte: endOfMonth }
                },
                select: { amount: true, createdAt: true }
            }),
            prisma.deal.findMany({
                where: {
                    companyId,
                    createdAt: { gte: startOfMonth, lte: endOfMonth },
                    stage: { name: { contains: 'won', mode: 'insensitive' } }
                },
                select: { value: true, createdAt: true }
            })
        ]);

        const invoiceSalesByDay: Record<number, number> = {};
        monthInvoices.forEach(inv => {
            const day = new Date(inv.createdAt).getDate();
            invoiceSalesByDay[day] = (invoiceSalesByDay[day] || 0) + (inv.amount || 0);
        });

        const leadSalesByDay: Record<number, number> = {};
        monthWonDeals.forEach(d => {
            const day = new Date(d.createdAt).getDate();
            leadSalesByDay[day] = (leadSalesByDay[day] || 0) + (d.value || 0);
        });

        const daysInMonth = now.getDate();
        const revenueChart: Array<{ date: string; invoiceSales: number; leadSales: number }> = [];

        for (let i = 1; i <= Math.max(daysInMonth, 17); i++) {
            const d = new Date(now.getFullYear(), now.getMonth(), i);
            const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            revenueChart.push({
                date: dateStr,
                invoiceSales: invoiceSalesByDay[i] || 0,
                leadSales: leadSalesByDay[i] || 0
            });
        }

        return {
            stats: {
                totalLeads: totalLeadsCount,
                totalDeals: dealsCount,
                totalCustomers: clientsCount,
                totalInvoices: invoicesCount,
                totalPayments: paymentsCount,
                totalRevenue: totalRevenue,
                totalDealValue: totalSales,
                todayLeads: todayLeadsCount,
                sevenDayUntouched: sevenDayUntouchedCount,
                totalUntouched: totalUntouchedCount,
                todayFollowups: todayFollowupsCount,
                followupLeads: followupLeadsCount,
                meetingScheduled: meetingScheduledCount
            },
            kpis: {
                todayLeads: todayLeadsCount,
                sevenDayUntouched: sevenDayUntouchedCount,
                totalUntouched: totalUntouchedCount,
                todayFollowups: todayFollowupsCount,
                totalLead: totalLeadsCount,
                deals: dealsCount,
                clients: clientsCount,
                followupLeads: followupLeadsCount,
                meetingScheduled: meetingScheduledCount
            },
            groups: leadGroups.map(g => ({
                id: g.id,
                name: g.name,
                count: g._count.leads
            })),
            accountOverview: {
                totalSales,
                avgSaleValue,
                totalDeals: dealsCount
            },
            revenue: {
                amount: totalSales,
                target: { current: 0, total: 0 },
                chartData: revenueChart
            },
            reminders,
            activities,
            leadsCollected,
            recentLeads,
            recentDeals,
            recentTasks
        };
    }
}
