import { prisma } from '../../lib/db';

export class TasksService {
  static async getTasks(companyId: string, leadId?: string) {
    const where: any = { companyId };
    if (leadId) where.leadId = leadId;
    return prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        lead: { select: { id: true, name: true, phone: true, companyName: true, whatsappNumber: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
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
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        status: data.status ? data.status.toUpperCase() : 'PENDING',
        priority: data.priority ? data.priority.toUpperCase() : 'MEDIUM'
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
      data: { status: status.toUpperCase() }
    });
  }

  static async updateTask(companyId: string, taskId: string, data: any) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.status !== undefined) updateData.status = data.status.toUpperCase();
    if (data.priority !== undefined) updateData.priority = data.priority.toUpperCase();
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId || null;
    if (data.leadId !== undefined) updateData.leadId = data.leadId || null;

    return prisma.task.update({
      where: { id: taskId, companyId },
      data: updateData,
      include: {
        lead: { select: { id: true, name: true, phone: true, companyName: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });
  }

  static async deleteTask(companyId: string, taskId: string) {
    return prisma.task.delete({
      where: { id: taskId, companyId }
    });
  }

  static async bulkDeleteTasks(companyId: string, ids: string[]) {
    return prisma.task.deleteMany({
      where: {
        id: { in: ids },
        companyId
      }
    });
  }
}
