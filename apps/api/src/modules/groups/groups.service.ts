import { prisma } from '../../lib/db';

export class GroupsService {
  static async getGroups(companyId: string) {
    return prisma.leadGroup.findMany({
      where: { companyId },
      include: {
        createdBy: { select: { name: true, id: true } },
        leads: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createGroup(companyId: string, userId: string, data: { name: string, active?: boolean }) {
    return prisma.leadGroup.create({
      data: {
        companyId,
        createdById: userId,
        name: data.name,
        active: data.active ?? true
      }
    });
  }

  static async updateGroup(companyId: string, id: string, data: { name?: string, active?: boolean }) {
    const existing = await prisma.leadGroup.findFirst({ where: { id, companyId } });
    if (!existing) throw new Error("Group not found");
    return prisma.leadGroup.update({
      where: { id },
      data
    });
  }

  static async deleteGroup(companyId: string, id: string) {
    return prisma.leadGroup.deleteMany({
      where: { id, companyId }
    });
  }
}
