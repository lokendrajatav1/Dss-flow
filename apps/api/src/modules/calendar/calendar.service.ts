import { prisma } from '../../lib/db';

export class CalendarService {
  // ─── Calendar Syncs ──────────────────────────────────────

  static async getCalendarSyncs(companyId: string) {
    return prisma.calendarSync.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getCalendarSync(companyId: string, syncId: string) {
    return prisma.calendarSync.findFirst({
      where: { id: syncId, companyId },
    });
  }

  static async createCalendarSync(companyId: string, data: any) {
    return prisma.calendarSync.create({
      data: {
        companyId,
        provider: data.provider,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        calendarId: data.calendarId,
        status: 'connected',
        syncEnabled: data.syncEnabled ?? false,
        syncEvents: data.syncEvents ?? true,
        syncTasks: data.syncTasks ?? true,
      },
    });
  }

  static async updateCalendarSync(companyId: string, syncId: string, data: any) {
    return prisma.calendarSync.update({
      where: { id: syncId },
      data: {
        ...(data.accessToken !== undefined && { accessToken: data.accessToken }),
        ...(data.refreshToken !== undefined && { refreshToken: data.refreshToken }),
        ...(data.calendarId !== undefined && { calendarId: data.calendarId }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.syncEnabled !== undefined && { syncEnabled: data.syncEnabled }),
        ...(data.syncEvents !== undefined && { syncEvents: data.syncEvents }),
        ...(data.syncTasks !== undefined && { syncTasks: data.syncTasks }),
        updatedAt: new Date(),
      },
    });
  }

  static async deleteCalendarSync(companyId: string, syncId: string) {
    await prisma.calendarEvent.deleteMany({
      where: { calendarSyncId: syncId, companyId },
    });
    return prisma.calendarSync.delete({
      where: { id: syncId },
    });
  }

  // ─── Calendar Events ─────────────────────────────────────

  static async getEvents(companyId: string, filters: any = {}) {
    const { syncId, startDate, endDate, page = 1, pageSize = 20 } = filters;

    const where: any = { companyId };
    if (syncId) where.calendarSyncId = syncId;
    if (startDate || endDate) {
      where.startAt = {};
      if (startDate) where.startAt.gte = new Date(startDate);
      if (endDate) where.startAt.lte = new Date(endDate);
    }

    const total = await prisma.calendarEvent.count({ where });
    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        calendarSync: { select: { provider: true, calendarId: true } },
        task: { select: { title: true, status: true } },
        deal: { select: { title: true } },
      },
      orderBy: { startAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { events, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async getEvent(companyId: string, eventId: string) {
    return prisma.calendarEvent.findFirst({
      where: { id: eventId, companyId },
      include: {
        calendarSync: { select: { provider: true } },
        task: true,
        deal: { select: { title: true } },
      },
    });
  }

  static async createEvent(companyId: string, data: any) {
    return prisma.calendarEvent.create({
      data: {
        companyId,
        calendarSyncId: data.calendarSyncId,
        eventId: data.eventId,
        title: data.title,
        description: data.description,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        location: data.location,
        attendees: data.attendees ?? null,
        status: data.status || 'confirmed',
        syncEnabled: data.syncEnabled ?? true,
        taskId: data.taskId ?? null,
        dealId: data.dealId ?? null,
      },
    });
  }

  static async updateEvent(companyId: string, eventId: string, data: any) {
    return prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startAt !== undefined && { startAt: new Date(data.startAt) }),
        ...(data.endAt !== undefined && { endAt: new Date(data.endAt) }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.attendees !== undefined && { attendees: data.attendees }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.syncEnabled !== undefined && { syncEnabled: data.syncEnabled }),
        ...(data.taskId !== undefined && { taskId: data.taskId }),
        ...(data.dealId !== undefined && { dealId: data.dealId }),
        updatedAt: new Date(),
      },
    });
  }

  static async deleteEvent(companyId: string, eventId: string) {
    return prisma.calendarEvent.delete({
      where: { id: eventId },
    });
  }

  // ─── Sync Helpers ────────────────────────────────────────

  static async getUpcomingEvents(companyId: string, limit = 50) {
    return prisma.calendarEvent.findMany({
      where: {
        companyId,
        startAt: { gte: new Date() },
        syncEnabled: true,
      },
      include: {
        calendarSync: { select: { provider: true } },
        task: { select: { title: true, status: true, assignedToId: true } },
        deal: { select: { title: true, value: true } },
      },
      orderBy: { startAt: 'asc' },
      take: limit,
    });
  }
}
