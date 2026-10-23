import { prisma } from '../../lib/db';

export interface MeetingFilterOptions {
  search?: string;
  status?: string;
  platform?: string;
  hostId?: string;
  leadId?: string;
}

export class MeetingsService {
  /**
   * Retrieves all meetings for a company with Lead and Host details.
   */
  static async getMeetings(companyId: string, options: MeetingFilterOptions = {}) {
    const where: any = {
      companyId,
      type: 'MEETING'
    };

    if (options.hostId && options.hostId !== 'all') {
      where.performedById = options.hostId;
    }

    if (options.leadId) {
      where.leadId = options.leadId;
    }

    const activities = await prisma.activity.findMany({
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
            email: true
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
    });

    return activities.map((act) => {
      const metadata = (act.metadata as any) || {};
      const lead: any = act.lead || {};
      const dtString = metadata.dateTime || (act.createdAt ? new Date(act.createdAt).toISOString() : new Date().toISOString());
      const datePart = metadata.date || (dtString ? dtString.split('T')[0] : '');
      const timePart = metadata.time || (dtString && dtString.includes('T') ? dtString.split('T')[1].slice(0, 5) : '11:00');

      return {
        id: act.id,
        title: act.title || `Meeting: ${lead.name || metadata.clientName || 'Client'}`,
        clientName: metadata.clientName || lead.name || 'Direct Client',
        clientCompany: metadata.clientCompany || lead.companyName || 'Organization',
        clientEmail: metadata.clientEmail || lead.email || '',
        clientPhone: metadata.clientPhone || lead.phone || lead.whatsappNumber || '',
        date: datePart,
        time: timePart,
        dateTime: dtString,
        duration: metadata.duration || '30 mins',
        type: metadata.platform || metadata.type || 'Google Meet',
        meetingLink: metadata.meetingLink || '',
        host: act.performedBy?.name || metadata.host || 'Unassigned',
        hostId: act.performedBy?.id || null,
        status: metadata.status || 'Scheduled',
        priority: metadata.priority || 'Normal',
        agenda: act.description || metadata.agenda || '',
        leadId: act.leadId,
        createdAt: act.createdAt
      };
    });
  }

  /**
   * Creates a new meeting activity record.
   */
  static async createMeeting(companyId: string, userId: string, data: any) {
    const hostId = data.hostId || userId;
    const finalLeadId = data.leadId || null;

    const dt = data.dateTime || new Date().toISOString();
    const datePart = data.date || (dt ? dt.split('T')[0] : '');
    const timePart = data.time || (dt && dt.includes('T') ? dt.split('T')[1].slice(0, 5) : '11:00');

    const metadata = {
      clientName: data.clientName || '',
      clientCompany: data.clientCompany || '',
      clientEmail: data.clientEmail || '',
      clientPhone: data.clientPhone || '',
      dateTime: dt,
      date: datePart,
      time: timePart,
      duration: data.duration || '30 mins',
      platform: data.type || 'Google Meet',
      meetingLink: data.meetingLink || (data.type === 'Google Meet' ? 'https://meet.google.com/new' : ''),
      status: data.status || 'Scheduled',
      priority: data.priority || 'Normal',
      host: data.host || '',
      agenda: data.agenda || ''
    };

    const activity = await prisma.activity.create({
      data: {
        companyId,
        leadId: finalLeadId,
        performedById: hostId,
        type: 'MEETING',
        title: data.title || 'Client Meeting',
        description: data.agenda || data.description || '',
        metadata
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            companyName: true,
            phone: true,
            whatsappNumber: true,
            email: true
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
    });

    return {
      id: activity.id,
      title: activity.title,
      clientName: metadata.clientName,
      clientCompany: metadata.clientCompany,
      clientEmail: metadata.clientEmail,
      clientPhone: metadata.clientPhone,
      date: datePart,
      time: timePart,
      dateTime: dt,
      duration: metadata.duration,
      type: metadata.platform,
      meetingLink: metadata.meetingLink,
      host: activity.performedBy?.name || metadata.host,
      status: metadata.status,
      priority: metadata.priority,
      agenda: activity.description,
      leadId: activity.leadId,
      createdAt: activity.createdAt
    };
  }

  /**
   * Updates an existing meeting record.
   */
  static async updateMeeting(companyId: string, id: string, data: any) {
    const existing = await prisma.activity.findFirst({
      where: { id, companyId, type: 'MEETING' }
    });

    if (!existing) {
      throw new Error('Meeting not found');
    }

    const prevMetadata = (existing.metadata as any) || {};
    const updatedMetadata = {
      ...prevMetadata,
      ...(data.clientName !== undefined && { clientName: data.clientName }),
      ...(data.clientCompany !== undefined && { clientCompany: data.clientCompany }),
      ...(data.clientEmail !== undefined && { clientEmail: data.clientEmail }),
      ...(data.clientPhone !== undefined && { clientPhone: data.clientPhone }),
      ...(data.dateTime !== undefined && { dateTime: data.dateTime }),
      ...(data.date !== undefined && { date: data.date }),
      ...(data.time !== undefined && { time: data.time }),
      ...(data.duration !== undefined && { duration: data.duration }),
      ...(data.type !== undefined && { platform: data.type }),
      ...(data.meetingLink !== undefined && { meetingLink: data.meetingLink }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.agenda !== undefined && { agenda: data.agenda }),
      ...(data.host !== undefined && { host: data.host })
    };

    const updatePayload: any = {
      metadata: updatedMetadata
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.agenda !== undefined || data.description !== undefined) {
      updatePayload.description = data.agenda || data.description;
    }
    if (data.hostId !== undefined) {
      updatePayload.performedById = data.hostId;
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: updatePayload,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            companyName: true,
            phone: true,
            whatsappNumber: true,
            email: true
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
    });

    return {
      id: updated.id,
      title: updated.title,
      clientName: updatedMetadata.clientName,
      clientCompany: updatedMetadata.clientCompany,
      clientEmail: updatedMetadata.clientEmail,
      clientPhone: updatedMetadata.clientPhone,
      date: updatedMetadata.date,
      time: updatedMetadata.time,
      dateTime: updatedMetadata.dateTime,
      duration: updatedMetadata.duration,
      type: updatedMetadata.platform,
      meetingLink: updatedMetadata.meetingLink,
      host: updated.performedBy?.name || updatedMetadata.host,
      status: updatedMetadata.status,
      priority: updatedMetadata.priority,
      agenda: updated.description,
      leadId: updated.leadId,
      createdAt: updated.createdAt
    };
  }

  /**
   * Deletes a single meeting record.
   */
  static async deleteMeeting(companyId: string, id: string) {
    return prisma.activity.deleteMany({
      where: { id, companyId, type: 'MEETING' }
    });
  }

  /**
   * Bulk deletes multiple meeting records.
   */
  static async bulkDeleteMeetings(companyId: string, ids: string[]) {
    return prisma.activity.deleteMany({
      where: {
        id: { in: ids },
        companyId,
        type: 'MEETING'
      }
    });
  }
}
