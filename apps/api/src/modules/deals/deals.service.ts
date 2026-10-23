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
    let pipelines = await prisma.pipeline.findMany({
      where: { companyId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    const standardStages = [
      'Deal Raised',
      'Negotiation',
      'Awaiting Approval',
      'Proposal Sent',
      'Deal Won',
      'Deal Lost'
    ];

    if (!pipelines || pipelines.length === 0) {
      const defaultPipeline = await prisma.pipeline.create({
        data: {
          companyId,
          name: 'Standard Pipeline',
          stages: {
            create: standardStages.map((name, idx) => ({ name, order: idx + 1 }))
          }
        },
        include: {
          stages: {
            orderBy: { order: 'asc' }
          }
        }
      });
      pipelines = [defaultPipeline];
    } else {
      const existingNames = new Set(pipelines[0].stages.map(s => s.name.toLowerCase()));
      const missingStages = standardStages.filter(name => !existingNames.has(name.toLowerCase()));
      if (missingStages.length > 0) {
        const nextOrder = (pipelines[0].stages.length || 0) + 1;
        const createdStages = await Promise.all(
          missingStages.map((name, idx) =>
            prisma.pipelineStage.create({
              data: {
                pipelineId: pipelines[0].id,
                name,
                order: nextOrder + idx
              }
            })
          )
        );
        pipelines[0].stages = [...pipelines[0].stages, ...createdStages].sort((a, b) => a.order - b.order);
      }
    }

    return pipelines;
  }

  /**
   * Fetch a single deal by ID with stage, lead, customer, and activities
   */
  static async getDealById(companyId: string, dealId: string) {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        stage: {
          include: {
            pipeline: {
              include: {
                stages: { orderBy: { order: 'asc' } }
              }
            }
          }
        },
        lead: true,
        customer: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 20 },
        tasks: { orderBy: { createdAt: 'desc' } },
      }
    });

    if (!deal || deal.companyId !== companyId) {
      throw new Error('Deal not found or unauthorized');
    }

    return deal;
  }

  /**
   * Fetch all stages for a pipeline, along with the deals in each stage.
   */
  static async getPipelineWithDeals(
    companyId: string, 
    pipelineId: string,
    filters?: { assignedToId?: string; startDate?: string; endDate?: string; search?: string }
  ) {
    const dealWhere: any = {};
    if (filters?.assignedToId && filters.assignedToId !== 'all') {
      dealWhere.assignedToId = filters.assignedToId;
    }
    if (filters?.startDate || filters?.endDate) {
      dealWhere.createdAt = {};
      if (filters.startDate) {
        dealWhere.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        dealWhere.createdAt.lte = end;
      }
    }
    if (filters?.search) {
      dealWhere.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { lead: { name: { contains: filters.search, mode: 'insensitive' } } },
        { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return prisma.pipelineStage.findMany({
      where: { pipelineId, pipeline: { companyId } },
      orderBy: { order: 'asc' },
      include: {
        deals: {
          where: dealWhere,
          orderBy: { createdAt: 'desc' },
          include: {
            lead: true,
            customer: true,
            assignedTo: { select: { id: true, name: true } }
          }
        },
      },
    });
  }

  /**
   * Update deal details
   */
  static async updateDeal(companyId: string, dealId: string, data: any) {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId }
    });

    if (!deal || deal.companyId !== companyId) {
      throw new Error('Deal not found or unauthorized');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.value !== undefined) updateData.value = Number(data.value) || 0;
    if (data.stageId !== undefined) {
      let resolvedStageId = data.stageId;
      const pipelines = await DealsService.getPipelines(companyId);
      const allStages = pipelines.flatMap(p => p.stages || []);
      const matched = allStages.find(s => s.id === data.stageId || s.name.toLowerCase() === String(data.stageId).toLowerCase());
      if (matched) resolvedStageId = matched.id;
      updateData.stageId = resolvedStageId;
    }
    if (data.leadId !== undefined) updateData.leadId = data.leadId || null;
    if (data.customerId !== undefined) updateData.customerId = data.customerId || null;
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.expectedCloseDate !== undefined) {
      updateData.expectedCloseDate = data.expectedCloseDate ? new Date(data.expectedCloseDate) : null;
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId || null;
    if (data.callStatus !== undefined) updateData.callStatus = data.callStatus || null;
    if (data.funnelId !== undefined) updateData.funnelId = data.funnelId || null;
    if (data.groupId !== undefined) updateData.groupId = data.groupId || null;
    if (data.attachmentUrl !== undefined) updateData.attachmentUrl = data.attachmentUrl || null;

    return prisma.deal.update({
      where: { id: dealId },
      data: updateData,
      include: {
        lead: true,
        customer: true,
        assignedTo: { select: { id: true, name: true } },
        stage: true
      }
    });
  }

  /**
   * Update the stage (and optionally value) of a deal
   */
  static async updateDealStage(companyId: string, dealId: string, newStageId: string, value?: number, title?: string, leadId?: string, expectedCloseDate?: string, priority?: string, notes?: string, assignedToId?: string, extraData?: any) {
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
    if (extraData?.startDate !== undefined) {
      updateData.startDate = extraData.startDate ? new Date(extraData.startDate) : null;
    }
    if (extraData?.callStatus !== undefined) {
      updateData.callStatus = extraData.callStatus;
    }
    if (extraData?.funnelId !== undefined) {
      updateData.funnelId = extraData.funnelId;
    }
    if (extraData?.groupId !== undefined) {
      updateData.groupId = extraData.groupId;
    }
    if (extraData?.attachmentUrl !== undefined) {
      updateData.attachmentUrl = extraData.attachmentUrl;
    }

    return (prisma.deal as any).update({
      where: { id: dealId },
      data: updateData,
      include: { lead: true, customer: true, assignedTo: true }
    });
  }

  /**
   * Create a new deal
   */
  static async createDeal(companyId: string, data: { 
    title: string, 
    stageId: string, 
    leadId?: string, 
    customerId?: string, 
    value?: number, 
    startDate?: string,
    expectedCloseDate?: string, 
    priority?: string, 
    notes?: string, 
    assignedToId?: string,
    callStatus?: string,
    funnelId?: string,
    groupId?: string,
    attachmentUrl?: string
  }) {
    return (prisma.deal as any).create({
      data: {
        companyId,
        title: data.title,
        stageId: data.stageId,
        leadId: data.leadId || null,
        customerId: data.customerId || null,
        value: data.value || 0,
        startDate: data.startDate ? new Date(data.startDate) : null,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        priority: data.priority || 'Medium',
        notes: data.notes || null,
        assignedToId: data.assignedToId || null,
        callStatus: data.callStatus || null,
        funnelId: data.funnelId || null,
        groupId: data.groupId || null,
        attachmentUrl: data.attachmentUrl || null
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
