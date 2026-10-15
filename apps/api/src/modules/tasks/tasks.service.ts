import { prisma } from '../../lib/db';

export class TasksService {
  static async getTasks(companyId: string, leadId?: string) {
    const where: any = { companyId };
    if (leadId) where.leadId = leadId;
    return prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        lead: { select: { id: true, name: true, phone: true, companyName: true } },
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });
  }

  static async createTask(companyId: string, leadId: string | undefined, userId: string, data: any) {
    const finalLeadId = leadId || data.leadId || null;
    return prisma.task.create({
      data: {
        companyId,
        leadId: finalLeadId,
        createdById: userId,
        assignedToId: data.assignedToId || userId,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        status: data.status || 'PENDING',
        priority: data.priority || 'MEDIUM'
      },
      include: {
        lead: { select: { id: true, name: true, phone: true, companyName: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });
  }

  static async updateTaskStatus(companyId: string, taskId: string, status: string) {
    return prisma.task.update({
      where: { id: taskId, companyId },
      data: { status }
    });
  }
}
