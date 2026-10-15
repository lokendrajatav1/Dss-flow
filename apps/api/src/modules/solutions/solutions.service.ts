import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

export class SolutionsService {
  static async getSolutions(companyId: string, filters: any = {}): Promise<any[]> {
    const where: any = {};

    if (companyId && companyId !== 'default') {
      where.companyId = companyId;
    }

    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    if (filters.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    if (filters.search) {
      const q = String(filters.search).trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { problem: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } }
      ];
    }

    const items = await prisma.solution.findMany({
      where,
      orderBy: {
        helpfulCount: 'desc'
      }
    });

    return items;
  }

  static async getSolutionById(companyId: string, id: string): Promise<any> {
    const item = await prisma.solution.update({
      where: { id },
      data: {
        views: { increment: 1 }
      }
    });
    if (!item) throw new Error('Solution not found');
    return item;
  }

  static async createSolution(companyId: string, payload: any): Promise<any> {
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

    const slug = payload.slug || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newArticle = await prisma.solution.create({
      data: {
        companyId: validCompanyId,
        title: payload.title,
        slug,
        category: payload.category || 'General & Getting Started',
        status: payload.status || 'Published',
        summary: payload.summary || '',
        problem: payload.problem || '',
        stepsToResolve: Array.isArray(payload.stepsToResolve) ? payload.stepsToResolve : [payload.stepsToResolve],
        tips: Array.isArray(payload.tips) ? payload.tips : [],
        tags: Array.isArray(payload.tags) ? payload.tags : ['support'],
        author: payload.author || 'Support Team',
        views: 1,
        helpfulCount: 0,
        unhelpfulCount: 0
      }
    });

    return newArticle;
  }

  static async updateSolution(companyId: string, id: string, payload: any): Promise<any> {
    const updated = await prisma.solution.update({
      where: { id },
      data: {
        ...(payload.title && { title: payload.title }),
        ...(payload.category && { category: payload.category }),
        ...(payload.status && { status: payload.status }),
        ...(payload.summary !== undefined && { summary: payload.summary }),
        ...(payload.problem !== undefined && { problem: payload.problem }),
        ...(payload.stepsToResolve && {
          stepsToResolve: Array.isArray(payload.stepsToResolve) ? payload.stepsToResolve : [payload.stepsToResolve]
        }),
        ...(payload.tips !== undefined && {
          tips: Array.isArray(payload.tips) ? payload.tips : []
        }),
        ...(payload.tags && {
          tags: Array.isArray(payload.tags) ? payload.tags : ['support']
        }),
        ...(payload.author && { author: payload.author })
      }
    });

    return updated;
  }

  static async deleteSolution(companyId: string, id: string): Promise<boolean> {
    await prisma.solution.delete({
      where: { id }
    });
    return true;
  }

  static async voteHelpfulSolution(companyId: string, id: string): Promise<any> {
    const item = await prisma.solution.update({
      where: { id },
      data: {
        helpfulCount: { increment: 1 }
      }
    });

    return item;
  }
}
