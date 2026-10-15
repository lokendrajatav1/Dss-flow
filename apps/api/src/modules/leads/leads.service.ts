import { prisma } from '../../lib/db';

export class LeadsService {
  /**
   * Fetch all leads for a given company
   */
  static async getLeads(companyId: string, filters: any = {}) {
    const where: any = { companyId };

    if (filters.groupId) where.groupId = filters.groupId;
    if (filters.assignedToId && filters.assignedToId !== 'all') where.assignedToId = filters.assignedToId;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    return prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        deals: true,
        assignedTo: { select: { name: true } }
      }
    });
  }

  /**
   * Create a new lead
   */
  static async getLeadById(companyId: string, leadId: string) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId, companyId },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        group: true,
        funnel: true,
      }
    });
    if (!lead) throw new Error('Lead not found');
    return lead;
  }

  static async createLead(companyId: string, data: any) {
    // Exclude fields that shouldn't be overridden
    const { id, companyId: _cid, createdAt, updatedAt, date, ...safeData } = data;

    // Parse date if present
    if (safeData.nextFollowUp) {
      safeData.nextFollowUp = new Date(safeData.nextFollowUp);
    } else if (safeData.nextFollowUp === '') {
      safeData.nextFollowUp = null;
    }

    if (date) {
      safeData.createdAt = new Date(date);
    }

    // Default values if empty
    safeData.source = safeData.source || 'Manual';
    safeData.status = safeData.status || 'New';
    safeData.priority = safeData.priority || 'Medium';
    if (safeData.assignedToId) {
      safeData.assignedTo = { connect: { id: safeData.assignedToId } };
    }
    delete safeData.assignedToId;

    if (safeData.groupId) {
      safeData.group = { connect: { id: safeData.groupId } };
    }
    delete safeData.groupId;

    if (safeData.funnelId) {
      safeData.funnel = { connect: { id: safeData.funnelId } };
    }
    delete safeData.funnelId;

    return prisma.lead.create({
      data: {
        companyId,
        ...safeData
      },
      include: {
        assignedTo: { select: { name: true } }
      }
    });
  }

  /**
   * Update lead status
   */
  static async updateLeadStatus(companyId: string, leadId: string, status: string) {
    // Ensure the lead belongs to the company
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.companyId !== companyId) {
      throw new Error('Lead not found or unauthorized');
    }

    return prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });
  }

  /**
   * Update lead details (full edit)
   */
  static async updateLead(companyId: string, leadId: string, data: any) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.companyId !== companyId) {
      throw new Error('Lead not found or unauthorized');
    }

    // Clean up fields we shouldn't overwrite directly
    const { id, companyId: _cid, createdAt, updatedAt, date, ...safeData } = data;

    if (safeData.nextFollowUp) {
      safeData.nextFollowUp = new Date(safeData.nextFollowUp);
    } else if (safeData.nextFollowUp === '') {
      safeData.nextFollowUp = null;
    }

    if (date) {
      safeData.createdAt = new Date(date);
    }
    if (safeData.assignedToId) {
      safeData.assignedTo = { connect: { id: safeData.assignedToId } };
    } else if (safeData.assignedToId === '' || safeData.assignedToId === null) {
      safeData.assignedTo = { disconnect: true };
    }
    delete safeData.assignedToId;

    if (safeData.groupId) {
      safeData.group = { connect: { id: safeData.groupId } };
    } else if (safeData.groupId === '' || safeData.groupId === null) {
      safeData.group = { disconnect: true };
    }
    delete safeData.groupId;

    if (safeData.funnelId) {
      safeData.funnel = { connect: { id: safeData.funnelId } };
    } else if (safeData.funnelId === '' || safeData.funnelId === null) {
      safeData.funnel = { disconnect: true };
    }
    delete safeData.funnelId;

    return prisma.lead.update({
      where: { id: leadId },
      data: safeData,
      include: {
        assignedTo: { select: { name: true } }
      }
    });
  }

  /**
   * Delete a lead
   */
  static async deleteLead(companyId: string, leadId: string) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.companyId !== companyId) {
      throw new Error('Lead not found or unauthorized');
    }

    return prisma.lead.delete({
      where: { id: leadId },
    });
  }

  /**
   * Convert a lead to a customer
   */
  static async convertLead(companyId: string, leadId: string, options: { createCustomer: boolean }) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.companyId !== companyId) throw new Error('Lead not found');

    let customerId = null;

    await prisma.$transaction(async (tx) => {
      await tx.lead.update({
        where: { id: leadId },
        data: { status: 'Won' }
      });

      if (options.createCustomer) {
        const customer = await tx.customer.create({
          data: {
            companyId,
            name: lead.name,
            email: lead.email,
            phone: lead.phone
          }
        });
        customerId = customer.id;
      }
    });

    return { success: true, customerId };
  }

  /**
   * Score a lead using AI
   */
  static async scoreLead(companyId: string, leadId: string, scoringData: any) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.companyId !== companyId) {
      throw new Error('Lead not found or unauthorized');
    }

    // Calculate lead score based on various factors
    let score = 0;
    let factors: any = {};

    // Basic lead information factors
    if (lead.email) score += 20; // Has email
    if (lead.phone) score += 20; // Has phone
    if (lead.companyName) score += 10; // Has company name
    if (lead.jobTitle) score += 10; // Has job title
    if (lead.source) score += 5; // Has source

    // Lead status factors
    const statusWeights: any = {
      'New': 30,
      'Contacted': 25,
      'Qualified': 20,
      'Proposal': 15,
      'Negotiation': 10,
      'Won': 50,
      'Lost': 0
    };
    score += statusWeights[lead.status] || 0;

    // Priority factors
    const priorityWeights: any = {
      'High': 20,
      'Medium': 15,
      'Low': 10
    };
    score += priorityWeights[lead.priority] || 0;

    // Estimated value factor
    if (lead.estimatedValue) {
      score += Math.min(lead.estimatedValue / 1000, 30); // Cap at 30 points
    }

    // Recency factor (newer leads get higher scores)
    const daysSinceCreated = (new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 1) score += 15;
    else if (daysSinceCreated < 7) score += 10;
    else if (daysSinceCreated < 30) score += 5;

    // Custom scoring factors from AI model
    if (scoringData.aiFactors) {
      factors.aiFactors = scoringData.aiFactors;
      score += scoringData.aiFactors || 0;
    }

    // Update lead with score
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        leadScore: score,
        qualificationData: factors
      },
      include: {
        assignedTo: { select: { name: true } }
      }
    });

    return {
      lead: updatedLead,
      score,
      factors
    };
  }

  /**
   * Qualify a lead using AI
   */
  static async qualifyLead(companyId: string, leadId: string, qualificationData: any) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.companyId !== companyId) {
      throw new Error('Lead not found or unauthorized');
    }

    // AI qualification logic
    let isQualified = false;
    let qualificationReason = '';
    let nextSteps: string[] = [];

    // Basic qualification criteria
    if (lead.email && lead.phone) {
      isQualified = true;
      qualificationReason = 'Has contact information';
      nextSteps.push('Schedule discovery call');
    }

    // Industry-specific qualification
    if (lead.industry === 'Technology' && lead.estimatedValue && lead.estimatedValue > 10000) {
      isQualified = true;
      qualificationReason += ', High-value tech lead';
      nextSteps.push('Connect with technical team');
    }

    // Source-based qualification
    if (lead.source === 'WhatsApp' || lead.source === 'Website') {
      isQualified = true;
      qualificationReason += ', High intent source';
      nextSteps.push('Send welcome sequence');
    }

    // Update lead qualification status
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        isQualified,
        qualificationReason,
        qualificationData,
        qualifiedAt: isQualified ? new Date() : null,
        nextSteps: nextSteps.length > 0 ? JSON.stringify(nextSteps) : null
      },
      include: {
        assignedTo: { select: { name: true } }
      }
    });

    return {
      lead: updatedLead,
      isQualified,
      qualificationReason,
      nextSteps
    };
  }


  static async importCsvLeads(companyId: string, data: { csvData: string, source: string, status: string, groupId?: string }) {
    const { csvData, source, status, groupId } = data;
    const lines = csvData.split(/\r?\n/);
    if (lines.length < 2) throw new Error("CSV appears to be empty or has only one row");

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const leads = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      // Basic CSV split
      const values = lines[i].split(',').map(v => v.trim());
      const leadObj: any = { companyId, source, callStatus: status };
      if (groupId) leadObj.groupId = groupId;

      headers.forEach((h, idx) => {
        const val = values[idx];
        if (!val) return;

        if (h === 'name') leadObj.name = val;
        else if (h === 'display_name') leadObj.displayName = val;
        else if (h === 'phone') leadObj.phone = val;
        else if (h === 'whatsapp') leadObj.whatsappNumber = val;
        else if (h === 'email') leadObj.email = val;
        else if (h === 'status') leadObj.callStatus = val;
        else if (h === 'company_name') leadObj.companyName = val;
        else if (h === 'job_title') leadObj.jobTitle = val;
        else if (h === 'industry') leadObj.industry = val;
        else if (h === 'facebook_url') leadObj.facebookUrl = val;
        else if (h === 'twitter_url') leadObj.twitterUrl = val;
        else if (h === 'linkedin_url') leadObj.linkedinUrl = val;
        else if (h === 'website_url') leadObj.websiteUrl = val;
        else if (h === 'address') leadObj.address = val;
      });

      if (leadObj.name) {
        leads.push(leadObj);
      }
    }

    if (leads.length === 0) {
      throw new Error("No valid leads found in the file. Please ensure you are uploading a valid CSV (not an Excel .xlsx) with the correct headers (like 'name').");
    }

    let createdCount = 0;
    let updatedCount = 0;
    for (const leadData of leads) {
      if (leadData.phone) {
        const existing = await prisma.lead.findFirst({
          where: { companyId, phone: leadData.phone }
        });
        if (existing) {
          await prisma.lead.update({
            where: { id: existing.id },
            data: leadData
          });
          updatedCount++;
          continue;
        }
      }
      await prisma.lead.create({ data: leadData });
      createdCount++;
    }

    return { count: createdCount + updatedCount, createdCount, updatedCount };
  }

}
