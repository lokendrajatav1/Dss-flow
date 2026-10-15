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
    return prisma.activity.create({
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
