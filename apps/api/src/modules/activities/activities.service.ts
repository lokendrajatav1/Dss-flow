import { prisma } from '../../lib/db';

export class ActivitiesService {
  static async getActivities(companyId: string, leadId?: string) {
    const where: any = { companyId };
    if (leadId) where.leadId = leadId;
    return prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        lead: { select: { id: true, name: true, phone: true, companyName: true, email: true } },
        performedBy: { select: { id: true, name: true } }
      }
    });
  }

  static async createActivity(companyId: string, leadId: string | undefined, userId: string, data: any) {
    const finalLeadId = leadId || data.leadId || null;
    const activity = await prisma.activity.create({
      data: {
        companyId,
        leadId: finalLeadId,
        performedById: userId,
        type: data.type,
        title: data.title,
        description: data.description,
        metadata: data.metadata || {}
      },
      include: {
        lead: { select: { id: true, name: true, phone: true, companyName: true, email: true } },
        performedBy: { select: { id: true, name: true } }
      }
    });

    // Auto-create Task if next follow-up date was scheduled in metadata (excluding calls)
    if (data.type !== 'CALL' && data.metadata?.nextFollowUp && finalLeadId) {
      try {
        await prisma.task.create({
          data: {
            companyId,
            leadId: finalLeadId,
            assignedToId: data.assignedToId || userId,
            createdById: userId,
            title: data.metadata?.outcome || data.title || 'Follow-up',
            description: data.description || `Follow-up call scheduled for ${activity.lead?.name || 'Contact'}`,
            dueDate: new Date(data.metadata.nextFollowUp),
            status: 'PENDING',
            priority: 'HIGH'
          }
        });
      } catch (err) {
        console.error('Failed to auto-create follow-up task:', err);
      }
    }

    // Update lead's call status if specified
    if (finalLeadId && (data.metadata?.outcome || data.metadata?.status)) {
      try {
        await prisma.lead.update({
          where: { id: finalLeadId },
          data: { callStatus: data.metadata.outcome || data.metadata.status }
        });
      } catch (err) {
        console.error('Failed to update lead status from call activity:', err);
      }
    }

    return activity;
  }

  static async deleteActivity(companyId: string, leadId: string, activityId: string) {
    return prisma.activity.deleteMany({
      where: {
        id: activityId,
        companyId,
        leadId
      }
    });
  }
}
