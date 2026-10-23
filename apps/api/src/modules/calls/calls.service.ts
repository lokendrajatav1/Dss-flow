import { prisma } from '../../lib/db';

export interface CallFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  direction?: string;
  status?: string;
  outcome?: string;
  agentId?: string;
}

export class CallsService {
  /**
   * Retrieves paginated calls for the tenant company with Lead and Agent joins.
   */
  static async getCalls(companyId: string, options: CallFilterOptions = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 25));
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
      type: 'CALL'
    };

    if (options.agentId && options.agentId !== 'all') {
      where.performedById = options.agentId;
    }

    // 1. Fetch Call Activities from DB
    const [activities, totalActivities] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              companyName: true,
              phone: true,
              whatsappNumber: true,
              email: true,
              callStatus: true,
              feedback: true,
              priority: true
            }
          },
          performedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.activity.count({ where })
    ]);

    // 2. Map activities to unified Call schema
    let formattedCalls = activities.map((act) => {
      const metadata = (act.metadata as any) || {};
      const lead: any = act.lead || {};

      let status = metadata.status || lead.callStatus || act.title || 'Untouched';
      if (act.title?.includes('Busy')) status = 'Busy';
      else if (act.title?.includes('No Answer')) status = 'No Answer';
      else if (act.title?.includes('Left Voicemail')) status = 'Left Voicemail';
      else if (act.title?.includes('Interested')) status = 'Interested';
      else if (act.title?.includes('Follow Up')) status = 'Follow Up Needed';

      const outcome =
        metadata.outcome ||
        (status === 'Interested'
          ? 'Interested'
          : status === 'No Answer' || status === 'Busy'
            ? 'No response/Busy'
            : '-None-');

      return {
        id: act.id,
        activityId: act.id,
        leadId: lead.id || act.leadId || undefined,
        name: lead.name || metadata.name || 'Contact',
        companyName: lead.companyName || metadata.companyName || 'Lead Organization',
        phone: lead.phone || lead.whatsappNumber || metadata.phone || '',
        email: lead.email || '',
        direction: metadata.direction || 'Outbound',
        callStatus: status,
        outcome,
        duration: metadata.duration || '00:45',
        assignedTo: act.performedBy?.name || metadata.agentNumber || 'Unassigned',
        notes: act.description || act.title || 'Logged call activity.',
        priority: lead.priority === 'High' ? 'High' : 'Normal',
        createdAt: act.createdAt.toISOString(),
        dateTime: metadata.activityDate || act.createdAt.toISOString(),
        recordingUrl: metadata.recordingUrl || undefined,
        dialedVia: metadata.dialedVia || undefined,
        nextFollowUp: metadata.nextFollowUp
          ? new Date(metadata.nextFollowUp).toISOString()
          : undefined
      };
    });

    // 3. Fallback: Also include leads that have callStatus but no activity yet (historical safety)
    const existingPhones = new Set(formattedCalls.map((c) => c.phone).filter(Boolean));
    const leadsWithCallStatus = await prisma.lead.findMany({
      where: {
        companyId,
        callStatus: { not: 'Untouched' }
      },
      select: {
        id: true,
        name: true,
        companyName: true,
        phone: true,
        whatsappNumber: true,
        email: true,
        callStatus: true,
        feedback: true,
        priority: true,
        notes: true,
        updatedAt: true,
        assignedTo: {
          select: { name: true }
        }
      },
      take: 50
    });

    for (const l of leadsWithCallStatus) {
      const phone = l.phone || l.whatsappNumber || '';
      if (phone && !existingPhones.has(phone)) {
        formattedCalls.push({
          id: `lead-call-${l.id}`,
          activityId: undefined as any,
          leadId: l.id,
          name: l.name || 'Lead Contact',
          companyName: l.companyName || 'Lead Organization',
          phone,
          email: l.email || '',
          direction: 'Outbound',
          callStatus: l.callStatus || 'Untouched',
          outcome: l.feedback || '-None-',
          duration: '00:00',
          assignedTo: l.assignedTo?.name || 'Unassigned',
          notes: l.notes || l.feedback || 'Logged via CRM pipeline.',
          priority: l.priority === 'High' ? 'High' : 'Normal',
          createdAt: l.updatedAt.toISOString(),
          dateTime: l.updatedAt.toISOString(),
          recordingUrl: undefined,
          dialedVia: undefined,
          nextFollowUp: undefined
        });
      }
    }

    // 4. In-memory filter on mapped fields (direction, status, outcome, search)
    if (options.search) {
      const q = options.search.toLowerCase().trim();
      formattedCalls = formattedCalls.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.companyName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.notes.toLowerCase().includes(q) ||
          c.assignedTo.toLowerCase().includes(q)
      );
    }

    if (options.direction && options.direction !== 'all') {
      formattedCalls = formattedCalls.filter((c) => c.direction === options.direction);
    }

    if (options.status && options.status !== 'all') {
      formattedCalls = formattedCalls.filter((c) => c.callStatus === options.status);
    }

    if (options.outcome && options.outcome !== 'all') {
      formattedCalls = formattedCalls.filter((c) => c.outcome === options.outcome);
    }

    const total = formattedCalls.length;
    const paginated = formattedCalls.slice(skip, skip + limit);

    return {
      calls: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    };
  }

  /**
   * Logs a new call activity and links or updates the corresponding lead.
   */
  static async createCall(companyId: string, userId: string, data: any) {
    let leadId = data.leadId;

    // If no leadId but phone provided, try to find existing lead or create one
    if (!leadId && data.phone) {
      const cleanPhone = String(data.phone).trim();
      const existing = await prisma.lead.findFirst({
        where: {
          companyId,
          OR: [{ phone: cleanPhone }, { whatsappNumber: cleanPhone }]
        }
      });

      if (existing) {
        leadId = existing.id;
      } else if (data.name) {
        const newLead = await prisma.lead.create({
          data: {
            companyId,
            name: data.name,
            companyName: data.companyName || 'Lead Organization',
            phone: cleanPhone,
            email: data.email || null,
            callStatus: data.callStatus || 'Untouched',
            feedback: data.outcome || null
          }
        });
        leadId = newLead.id;
      }
    }

    // Create the Activity record
    const activity = await prisma.activity.create({
      data: {
        companyId,
        leadId: leadId || null,
        performedById: userId,
        type: 'CALL',
        title: data.callStatus || data.outcome || 'Call Logged',
        description: data.notes || `Call logged with ${data.name || 'contact'}.`,
        metadata: {
          name: data.name,
          companyName: data.companyName,
          phone: data.phone,
          direction: data.direction || 'Outbound',
          status: data.callStatus || data.outcome || '',
          outcome: data.outcome || data.callStatus || '',
          duration: data.duration || '01:00',
          recordingUrl: data.recordingUrl || null,
          dialedVia: data.dialedVia || 'CRM Softphone',
          nextFollowUp: data.nextFollowUp || null,
          activityDate: data.dateTime || new Date().toISOString()
        }
      },
      include: {
        lead: true,
        performedBy: { select: { id: true, name: true, email: true } }
      }
    });

    // Update lead's call status if linked
    if (leadId && (data.callStatus || data.outcome)) {
      await prisma.lead
        .update({
          where: { id: leadId },
          data: {
            callStatus: data.callStatus || undefined,
            feedback: data.outcome || undefined
          }
        })
        .catch(() => { });
    }

    return activity;
  }

  /**
   * Updates an existing call log.
   */
  static async updateCall(companyId: string, callId: string, data: any) {
    if (callId.startsWith('lead-call-')) {
      const realLeadId = callId.replace('lead-call-', '');
      return prisma.lead.update({
        where: { id: realLeadId },
        data: {
          callStatus: data.callStatus || undefined,
          feedback: data.outcome || undefined,
          notes: data.notes || undefined
        }
      });
    }

    const activity = await prisma.activity.findFirst({
      where: { id: callId, companyId }
    });

    if (!activity) {
      throw new Error('Call record not found');
    }

    const existingMeta = (activity.metadata as any) || {};
    const updatedMeta = {
      ...existingMeta,
      ...(data.callStatus ? { status: data.callStatus } : {}),
      ...(data.outcome ? { outcome: data.outcome } : {}),
      ...(data.duration ? { duration: data.duration } : {}),
      ...(data.direction ? { direction: data.direction } : {}),
      ...(data.recordingUrl !== undefined ? { recordingUrl: data.recordingUrl } : {}),
      ...(data.notes ? { notes: data.notes } : {})
    };

    const updated = await prisma.activity.update({
      where: { id: callId },
      data: {
        description: data.notes || activity.description,
        metadata: updatedMeta
      }
    });

    // Sync with lead if linked
    if (activity.leadId && (data.callStatus || data.outcome)) {
      await prisma.lead
        .update({
          where: { id: activity.leadId },
          data: {
            callStatus: data.callStatus || undefined,
            feedback: data.outcome || undefined
          }
        })
        .catch(() => { });
    }

    return updated;
  }

  /**
   * Deletes a call record.
   */
  static async deleteCall(companyId: string, callId: string) {
    if (callId.startsWith('lead-call-')) {
      const realLeadId = callId.replace('lead-call-', '');
      return prisma.lead.update({
        where: { id: realLeadId },
        data: { callStatus: 'Untouched' }
      });
    }

    return prisma.activity.deleteMany({
      where: { id: callId, companyId }
    });
  }

  /**
   * Bulk deletes call records.
   */
  static async bulkDeleteCalls(companyId: string, callIds: string[]) {
    const activityIds = callIds.filter((id) => !id.startsWith('lead-call-'));
    const leadCallIds = callIds
      .filter((id) => id.startsWith('lead-call-'))
      .map((id) => id.replace('lead-call-', ''));

    const promises: Promise<any>[] = [];

    if (activityIds.length > 0) {
      promises.push(
        prisma.activity.deleteMany({
          where: { id: { in: activityIds }, companyId }
        })
      );
    }

    if (leadCallIds.length > 0) {
      promises.push(
        prisma.lead.updateMany({
          where: { id: { in: leadCallIds }, companyId },
          data: { callStatus: 'Untouched' }
        })
      );
    }

    await Promise.all(promises);
    return { success: true, count: callIds.length };
  }
}
