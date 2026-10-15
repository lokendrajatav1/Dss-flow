import { prisma } from '../../lib/db';

export class DealsService {
  static async getAllDeals(companyId: string) {
    return prisma.deal.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        stage: true,
        lead: true,
        customer: true,
        assignedTo: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Fetch pipelines for a given company
   */
  static async getPipelines(companyId: string) {
    return prisma.pipeline.findMany({
      where: { companyId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * Fetch all stages for a pipeline, along with the deals in each stage.
   */
  static async getPipelineWithDeals(companyId: string, pipelineId: string) {
    return prisma.pipelineStage.findMany({
      where: { pipelineId, pipeline: { companyId } },
      orderBy: { order: 'asc' },
      include: {
        deals: {
          orderBy: { createdAt: 'desc' },
          include: {
            lead: true,
            customer: true,
            assignedTo: { select: { name: true } }
          }
        },
      },
    });
  }

  /**
   * Update the stage (and optionally value) of a deal
   */
  static async updateDealStage(companyId: string, dealId: string, newStageId: string, value?: number, title?: string, leadId?: string, expectedCloseDate?: string, priority?: string, notes?: string, assignedToId?: string) {
    // Ensure the deal belongs to the company
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { stage: { include: { pipeline: true } } }
    });

    if (!deal || deal.companyId !== companyId) {
      throw new Error('Deal not found or unauthorized');
    }

    // Ensure the new stage exists and belongs to the same company
    const newStage = await prisma.pipelineStage.findUnique({
      where: { id: newStageId },
      include: { pipeline: true }
    });

    if (!newStage || newStage.pipeline.companyId !== companyId) {
      throw new Error('Invalid target stage');
    }
    
    const updateData: any = { stageId: newStageId };
    if (value !== undefined) {
      updateData.value = value;
    }
    if (title !== undefined) {
      updateData.title = title;
    }
    if (leadId !== undefined) {
      updateData.leadId = leadId;
    }
    if (expectedCloseDate !== undefined) {
      updateData.expectedCloseDate = expectedCloseDate ? new Date(expectedCloseDate) : null;
    }
    if (priority !== undefined) {
      updateData.priority = priority;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId;
    }

    return prisma.deal.update({
      where: { id: dealId },
      data: updateData,
      include: { lead: true, customer: true, assignedTo: true }
    });
  }

  /**
   * Create a new deal
   */
  static async createDeal(companyId: string, data: { title: string, stageId: string, leadId?: string, customerId?: string, value?: number, expectedCloseDate?: string, priority?: string, notes?: string, assignedToId?: string }) {
    return prisma.deal.create({
      data: {
        companyId,
        title: data.title,
        stageId: data.stageId,
        leadId: data.leadId,
        customerId: data.customerId,
        value: data.value || 0,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        priority: data.priority || 'Medium',
        notes: data.notes,
        assignedToId: data.assignedToId,
      },
      include: { lead: true, customer: true, assignedTo: true }
    });
  }

  /**
   * Delete a deal
   */
  static async deleteDeal(companyId: string, dealId: string) {
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    
    if (!deal || deal.companyId !== companyId) {
      throw new Error('Deal not found or unauthorized');
    }

    return prisma.deal.delete({ where: { id: dealId } });
  }
}
