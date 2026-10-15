import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

export class CasesService {
  static async getCases(companyId: string, filters: any = {}): Promise<any[]> {
    const where: any = {};

    if (companyId && companyId !== 'default') {
      where.companyId = companyId;
    }

    if (filters.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    if (filters.priority && filters.priority !== 'all') {
      where.priority = filters.priority;
    }

    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    if (filters.search) {
      const q = String(filters.search).trim();
      where.OR = [
        { caseNumber: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerCompany: { contains: q, mode: 'insensitive' } },
        { assignedTo: { contains: q, mode: 'insensitive' } }
      ];
    }

    const items = await prisma.case.findMany({
      where,
      include: {
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return items;
  }

  static async getCaseById(companyId: string, id: string): Promise<any> {
    const item = await prisma.case.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!item) throw new Error('Case not found');
    return item;
  }

  static async createCase(companyId: string, payload: any): Promise<any> {
    const count = await prisma.case.count();
    const caseNumber = payload.caseNumber || `CS-${count + 2001}`;

    let validCompanyId: string | null = null;
    if (companyId && companyId !== 'default') {
      const companyExists = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true }
      });
      if (companyExists) validCompanyId = companyId;
    }
    if (!validCompanyId) {
      const firstCompany = await prisma.company.findFirst({ select: { id: true } });
      if (firstCompany) validCompanyId = firstCompany.id;
    }

    const newCase = await prisma.case.create({
      data: {
        companyId: validCompanyId,
        caseNumber,
        subject: payload.subject,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail || '',
        customerCompany: payload.customerCompany || '',
        category: payload.category || 'Technical Support',
        priority: payload.priority || 'Medium',
        status: payload.status || 'Open',
        assignedTo: payload.assignedTo || 'Unassigned',
        description: payload.description || '',
        resolution: payload.resolution || '',
        comments: {
          create: [
            {
              author: payload.customerName,
              role: 'Customer',
              content: payload.description || 'Support case initiated.'
            }
          ]
        }
      },
      include: {
        comments: true
      }
    });

    return newCase;
  }

  static async updateCase(companyId: string, id: string, payload: any): Promise<any> {
    const updated = await prisma.case.update({
      where: { id },
      data: {
        ...(payload.subject && { subject: payload.subject }),
        ...(payload.customerName && { customerName: payload.customerName }),
        ...(payload.customerEmail !== undefined && { customerEmail: payload.customerEmail }),
        ...(payload.customerCompany !== undefined && { customerCompany: payload.customerCompany }),
        ...(payload.category && { category: payload.category }),
        ...(payload.priority && { priority: payload.priority }),
        ...(payload.status && { status: payload.status }),
        ...(payload.assignedTo && { assignedTo: payload.assignedTo }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.resolution !== undefined && { resolution: payload.resolution })
      },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return updated;
  }

  static async deleteCase(companyId: string, id: string): Promise<boolean> {
    await prisma.case.delete({
      where: { id }
    });
    return true;
  }

  static async bulkDeleteCases(companyId: string, ids: string[]): Promise<boolean> {
    await prisma.case.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    return true;
  }

  static async addCaseComment(companyId: string, id: string, commentPayload: any): Promise<any> {
    await prisma.caseComment.create({
      data: {
        caseId: id,
        author: commentPayload.author || 'Support Agent',
        role: commentPayload.role || 'Agent',
        content: commentPayload.content,
        isInternal: !!commentPayload.isInternal
      }
    });

    return prisma.case.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }
}
