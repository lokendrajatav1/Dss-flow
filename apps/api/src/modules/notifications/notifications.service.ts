import { prisma } from '../../lib/db';

export interface NotificationItem {
  id: string;
  type: 'lead' | 'task' | 'deal' | 'call';
  title: string;
  message: string;
  link: string;
  createdAt: Date;
  read?: boolean;
  metadata?: Record<string, any>;
}

export class NotificationsService {
  async getNotifications(companyId: string, userId?: string): Promise<NotificationItem[]> {
    if (!companyId) return [];

    const notifications: NotificationItem[] = [];

    try {
      // 1. Fetch recent leads (last 20 leads)
      const recentLeads = await prisma.lead.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          city: true,
          source: true,
          createdAt: true
        }
      });

      for (const lead of recentLeads) {
        const sourceName = lead.source || 'Website';
        notifications.push({
          id: `lead-${lead.id}`,
          type: 'lead',
          title: `New Lead: ${lead.name}`,
          message: `${sourceName} • ${lead.phone || lead.email || 'Contact pending'}${lead.city ? ` (${lead.city})` : ''}`,
          link: `/lead-manager`,
          createdAt: lead.createdAt,
          metadata: {
            leadId: lead.id,
            source: lead.source,
            phone: lead.phone
          }
        });
      }

      // 2. Fetch pending/upcoming tasks
      const pendingTasks = await prisma.task.findMany({
        where: {
          companyId,
          status: { notIn: ['Completed', 'Cancelled'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          priority: true,
          dueDate: true,
          createdAt: true
        }
      });

      for (const task of pendingTasks) {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
        notifications.push({
          id: `task-${task.id}`,
          type: 'task',
          title: isOverdue ? `Overdue Task: ${task.title}` : `Task Reminder: ${task.title}`,
          message: `Priority: ${task.priority || 'Normal'}${task.dueDate ? ` • Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}`,
          link: `/tasks`,
          createdAt: task.createdAt,
          metadata: {
            taskId: task.id,
            isOverdue
          }
        });
      }

      // 3. Fetch recent Deals
      const recentDeals = await prisma.deal.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          value: true,
          priority: true,
          createdAt: true
        }
      });

      for (const deal of recentDeals) {
        notifications.push({
          id: `deal-${deal.id}`,
          type: 'deal',
          title: `Deal: ${deal.title}`,
          message: `Priority: ${deal.priority || 'Medium'} • Value: ₹${deal.value ? Number(deal.value).toLocaleString('en-IN') : '0'}`,
          link: `/deals`,
          createdAt: deal.createdAt,
          metadata: {
            dealId: deal.id,
            value: deal.value
          }
        });
      }

      // Sort all notifications chronologically descending
      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    } catch (err) {
      console.error('[NotificationsService] Error fetching notifications:', err);
    }

    return notifications.slice(0, 30);
  }
}
