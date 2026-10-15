import { prisma } from '../../lib/db';

export class FilesService {
  static async getFiles(companyId: string, leadId: string) {
    return prisma.file.findMany({
      where: { companyId, leadId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: { select: { id: true, name: true } }
      }
    });
  }

  static async uploadFile(companyId: string, leadId: string, userId: string, data: any) {
    return prisma.file.create({
      data: {
        companyId,
        leadId,
        uploadedById: userId,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        url: data.url
      }
    });
  }
}
