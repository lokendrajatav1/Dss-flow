import { prisma } from '../../lib/db';

export class FunnelsService {
  static async getFunnels(companyId: string) {
    return prisma.funnel.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createFunnel(companyId: string, data: { name: string }) {
    return prisma.funnel.create({
      data: {
        companyId,
        name: data.name
      }
    });
  }

  static async updateFunnel(companyId: string, id: string, data: { name?: string }) {
    const existing = await prisma.funnel.findFirst({ where: { id, companyId } });
    if (!existing) throw new Error("Funnel not found");
    return prisma.funnel.update({
      where: { id },
      data
    });
  }

  static async deleteFunnel(companyId: string, id: string) {
    return prisma.funnel.deleteMany({
      where: { id, companyId }
    });
  }
}
