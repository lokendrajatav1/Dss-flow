import { prisma } from '../../lib/db';
import { AppError } from '../../middlewares/errorHandler';

export class PipelineService {
  async getPipelines(companyId: string, type?: string) {
    const whereClause: any = { companyId };
    if (type) whereClause.type = type;
    
    return prisma.pipeline.findMany({
      where: whereClause,
      include: {
        stages: {
          orderBy: { order: 'asc' }
        },
        group: {
          select: { name: true }
        },
        assignedUsers: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPipeline(companyId: string, id: string) {
    const pipeline = await prisma.pipeline.findFirst({
      where: { id, companyId },
      include: { 
        group: true,
        assignedUsers: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    if (!pipeline) throw new AppError('Pipeline not found', 404);
    return pipeline;
  }

  async getPipelineWithDeals(companyId: string, pipelineId: string) {
    const pipeline = await prisma.pipeline.findFirst({
      where: { id: pipelineId, companyId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            deals: {
              include: {
                lead: true,
                customer: true
              }
            }
          }
        }
      }
    });

    if (!pipeline) {
      throw new AppError('Pipeline not found', 404);
    }

    return pipeline;
  }

  // Settings & Configuration Methods
  async createPipeline(companyId: string, data: any) {
    return prisma.pipeline.create({
      data: { 
        companyId, 
        name: data.name,
        type: data.type || 'DEAL',
        details: data.details || null,
        groupId: data.groupId || null,
        attribute: data.attribute || null
      }
    });
  }

  async updatePipeline(companyId: string, id: string, data: any) {
    const pipeline = await prisma.pipeline.findFirst({ where: { id, companyId } });
    if (!pipeline) throw new AppError('Pipeline not found', 404);

    return prisma.pipeline.update({
      where: { id },
      data: { 
        name: data.name,
        type: data.type,
        details: data.details || null,
        groupId: data.groupId || null,
        attribute: data.attribute || null
      }
    });
  }

  async deletePipeline(companyId: string, id: string) {
    return prisma.pipeline.deleteMany({
      where: { id, companyId }
    });
  }

  async assignTeam(companyId: string, id: string, userIds: string[]) {
    const pipeline = await prisma.pipeline.findFirst({ where: { id, companyId } });
    if (!pipeline) throw new AppError('Pipeline not found', 404);

    return prisma.pipeline.update({
      where: { id },
      data: {
        assignedUsers: {
          set: userIds.map((userId: string) => ({ id: userId }))
        }
      },
      include: {
        assignedUsers: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async createStage(companyId: string, pipelineId: string, data: any) {
    // Verify pipeline belongs to company
    const pipeline = await prisma.pipeline.findFirst({ where: { id: pipelineId, companyId } });
    if (!pipeline) throw new AppError('Pipeline not found', 404);

    return prisma.pipelineStage.create({
      data: {
        pipelineId,
        name: data.name,
        order: data.order || 0,
        rottingDays: data.rottingDays || null,
        probability: data.probability || 0,
        color: data.color || '#4F46E5'
      }
    });
  }

  async updateStage(companyId: string, pipelineId: string, stageId: string, data: any) {
    const pipeline = await prisma.pipeline.findFirst({ where: { id: pipelineId, companyId } });
    if (!pipeline) throw new AppError('Pipeline not found', 404);

    return prisma.pipelineStage.update({
      where: { id: stageId, pipelineId },
      data: {
        name: data.name,
        order: data.order,
        rottingDays: data.rottingDays,
        probability: data.probability,
        color: data.color
      }
    });
  }

  async deleteStage(companyId: string, pipelineId: string, stageId: string) {
    const pipeline = await prisma.pipeline.findFirst({ where: { id: pipelineId, companyId } });
    if (!pipeline) throw new AppError('Pipeline not found', 404);

    return prisma.pipelineStage.delete({
      where: { id: stageId, pipelineId }
    });
  }
}
