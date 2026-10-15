import { prisma } from '../../lib/db';

export class ProductsService {
  static async getProducts(companyId: string, filters: any = {}) {
    const where: any = { companyId };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.status) where.status = filters.status;

    return prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getProductById(companyId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId, companyId },
    });
    if (!product) throw new Error('Product not found');
    return product;
  }

  static async createProduct(companyId: string, data: any) {
    try {
      return await (prisma.product as any).create({
        data: {
          companyId,
          name: data.name,
          sku: data.sku || null,
          category: data.category || 'General',
          productType: data.productType || 'Goods',
          description: data.description || null,
          price: parseFloat(data.price) || 0,
          costPrice: data.costPrice !== undefined ? parseFloat(data.costPrice) : 0,
          taxRate: data.taxRate !== undefined ? parseFloat(data.taxRate) : 0,
          hsnCode: data.hsnCode || null,
          currency: data.currency || 'INR',
          stock: data.stock !== undefined ? String(data.stock) : 'Unlimited',
          unit: data.unit || 'Unit',
          minStock: data.minStock !== undefined ? parseInt(data.minStock) : 0,
          status: data.status || 'Active',
        },
      });
    } catch (err) {
      return await prisma.product.create({
        data: {
          companyId,
          name: data.name,
          description: data.description || null,
          price: parseFloat(data.price) || 0,
          currency: data.currency || 'INR',
          stock: data.stock !== undefined ? String(data.stock) : 'Unlimited',
          status: data.status || 'Active',
        },
      });
    }
  }

  static async updateProduct(companyId: string, productId: string, data: any) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.companyId !== companyId) throw new Error('Product not found or unauthorized');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.productType !== undefined) updateData.productType = data.productType;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.costPrice !== undefined) updateData.costPrice = parseFloat(data.costPrice);
    if (data.taxRate !== undefined) updateData.taxRate = parseFloat(data.taxRate);
    if (data.hsnCode !== undefined) updateData.hsnCode = data.hsnCode;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.stock !== undefined) updateData.stock = String(data.stock);
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.minStock !== undefined) updateData.minStock = parseInt(data.minStock);
    if (data.status !== undefined) updateData.status = data.status;

    try {
      return await (prisma.product as any).update({
        where: { id: productId },
        data: updateData,
      });
    } catch (err) {
      const basicData: any = {};
      if (data.name !== undefined) basicData.name = data.name;
      if (data.description !== undefined) basicData.description = data.description;
      if (data.price !== undefined) basicData.price = parseFloat(data.price);
      if (data.currency !== undefined) basicData.currency = data.currency;
      if (data.stock !== undefined) basicData.stock = String(data.stock);
      if (data.status !== undefined) basicData.status = data.status;

      return await prisma.product.update({
        where: { id: productId },
        data: basicData,
      });
    }
  }

  static async deleteProduct(companyId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.companyId !== companyId) throw new Error('Product not found or unauthorized');
    return prisma.product.delete({ where: { id: productId } });
  }
}