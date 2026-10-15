import { prisma } from '../../lib/db';

export class FormLayoutsService {
  /**
   * Get the form layout for a specific entity type
   */
  static async getLayout(companyId: string, entityType: string) {
    return prisma.formLayout.findUnique({
      where: {
        companyId_entityType: {
          companyId,
          entityType,
        }
      }
    });
  }

  /**
   * Upsert (Update or Create) a form layout
   */
  static async saveLayout(companyId: string, entityType: string, layoutJson: any) {
    return prisma.formLayout.upsert({
      where: {
        companyId_entityType: {
          companyId,
          entityType,
        }
      },
      update: {
        layoutJson,
      },
      create: {
        companyId,
        entityType,
        layoutJson,
      },
    });
  }
}
