import { prisma } from '../../lib/db';

export class CategoriesService {
  /**
   * Fetch all real dynamic categories from the dedicated ProductCategory table.
   * Also computes the live count of products linked to each category directly from the database.
   */
  static async getCategories(companyId: string, search?: string) {
    // 1. Migrate any legacy CustomField records into dedicated ProductCategory table seamlessly
    try {
      const legacy = await prisma.customField.findMany({
        where: { companyId, entityType: 'product_category' },
      });
      for (const leg of legacy) {
        const opts = (leg.options as any) || {};
        await (prisma as any).productCategory.upsert({
          where: { companyId_name: { companyId, name: leg.name } },
          update: {},
          create: {
            companyId,
            name: leg.name,
            description: opts.description || null,
          },
        });
        await prisma.customField.delete({ where: { id: leg.id } }).catch(() => {});
      }
    } catch (_) {}

    // 2. Fetch categories from dedicated ProductCategory model
    const where: any = { companyId };
    if (search && search.trim()) {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    const categoryRecords = await (prisma as any).productCategory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // 3. Compute live product counts per category in this company
    const products = await prisma.product.findMany({
      where: { companyId },
      select: { category: true },
    });

    const productCounts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.category) {
        const key = p.category.trim().toLowerCase();
        productCounts[key] = (productCounts[key] || 0) + 1;
      }
    });

    // 4. Return formatted categories
    return categoryRecords.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      productCount: productCounts[cat.name.trim().toLowerCase()] || 0,
      createdAt: cat.createdAt,
    }));
  }

  /**
   * Get single category by ID from dedicated ProductCategory table
   */
  static async getCategoryById(companyId: string, id: string) {
    const category = await (prisma as any).productCategory.findFirst({
      where: { id, companyId },
    });
    if (!category) {
      throw new Error('Category not found');
    }
    const productCount = await prisma.product.count({
      where: { companyId, category: category.name },
    });

    return {
      id: category.id,
      name: category.name,
      description: category.description || '',
      productCount,
      createdAt: category.createdAt,
    };
  }

  /**
   * Create a new category in dedicated ProductCategory table
   */
  static async createCategory(
    companyId: string,
    data: { name: string; description?: string }
  ) {
    const trimmedName = data.name ? data.name.trim() : '';
    if (!trimmedName) {
      throw new Error('Category name is required and cannot be blank.');
    }

    // Check for duplicate name in this company (case-insensitive)
    const existing = await (prisma as any).productCategory.findFirst({
      where: {
        companyId,
        name: { equals: trimmedName, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new Error(`Category "${trimmedName}" already exists.`);
    }

    return (prisma as any).productCategory.create({
      data: {
        companyId,
        name: trimmedName,
        description: data.description ? data.description.trim() : null,
      },
    });
  }

  /**
   * Update category name & description. If name changes, cascades update to all products.
   */
  static async updateCategory(
    companyId: string,
    id: string,
    data: { name: string; description?: string }
  ) {
    const trimmedName = data.name ? data.name.trim() : '';
    if (!trimmedName) {
      throw new Error('Category name cannot be blank.');
    }

    const existing = await (prisma as any).productCategory.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new Error('Category not found.');
    }

    // Prevent duplicate name conflict with another category
    const duplicate = await (prisma as any).productCategory.findFirst({
      where: {
        companyId,
        id: { not: id },
        name: { equals: trimmedName, mode: 'insensitive' },
      },
    });

    if (duplicate) {
      throw new Error(`Another category named "${trimmedName}" already exists.`);
    }

    const updated = await (prisma as any).productCategory.update({
      where: { id },
      data: {
        name: trimmedName,
        description: data.description !== undefined ? data.description.trim() : existing.description,
      },
    });

    // Cascade rename to products assigned to the old category name
    if (existing.name !== trimmedName) {
      await prisma.product.updateMany({
        where: { companyId, category: existing.name },
        data: { category: trimmedName },
      });
    }

    return updated;
  }

  /**
   * Delete category with safety check: rejects if products are currently assigned to it
   */
  static async deleteCategory(companyId: string, id: string) {
    const existing = await (prisma as any).productCategory.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new Error('Category not found.');
    }

    // Check if any product is assigned to this category
    const attachedCount = await prisma.product.count({
      where: { companyId, category: existing.name },
    });

    if (attachedCount > 0) {
      throw new Error(
        `Cannot delete "${existing.name}" because it is currently assigned to ${attachedCount} product(s). Please reassign or remove the products first.`
      );
    }

    await (prisma as any).productCategory.delete({ where: { id } });
    return { success: true };
  }
}
