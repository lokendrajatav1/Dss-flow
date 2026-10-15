import { prisma } from '../../lib/db';

export class CustomFieldsService {
  static async getFields(companyId: string, entityType: string) {
    return prisma.customField.findMany({
      where: { companyId, entityType },
      orderBy: { order: 'asc' },
    });
  }

  static async createField(
    companyId: string,
    data: {
      entityType: string;
      name: string;
      key: string;
      type: string;
      options?: any;
      isRequired?: boolean;
      order?: number;
    }
  ) {
    const existing = await prisma.customField.findFirst({
      where: { companyId, entityType: data.entityType, key: data.key },
    });

    if (existing) {
      throw new Error(`Custom field with key "${data.key}" already exists for ${data.entityType}`);
    }

    return prisma.customField.create({
      data: {
        companyId,
        ...data,
      },
    });
  }

  static async updateField(companyId: string, id: string, data: any) {
    const field = await prisma.customField.findUnique({ where: { id } });
    if (!field || field.companyId !== companyId) {
      throw new Error('Custom field not found or unauthorized');
    }
    const { key, entityType, companyId: _, ...updatableData } = data;
    return prisma.customField.update({ where: { id }, data: updatableData });
  }

  static async deleteField(companyId: string, id: string) {
    const field = await prisma.customField.findUnique({ where: { id } });
    if (!field || field.companyId !== companyId) {
      throw new Error('Custom field not found or unauthorized');
    }
    return prisma.customField.delete({ where: { id } });
  }
}
