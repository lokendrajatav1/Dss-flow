import { prisma } from '../../lib/db';

export class PriceBooksService {
  private static columnEnsured = false;

  private static async ensureItemsJsonColumn() {
    if (this.columnEnsured) return;
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PriceBook" ADD COLUMN IF NOT EXISTS "itemsJson" TEXT;');
      this.columnEnsured = true;
    } catch (e) {
      // Ignore if table/column already exists or error
    }
  }

  static async getPriceBooks(companyId: string, filters: any = {}) {
    await this.ensureItemsJsonColumn();
    const where: any = { companyId };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.status) where.status = filters.status;
    if (filters.itemType) where.itemType = filters.itemType;

    const list: any[] = await prisma.priceBook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    try {
      const rawRows: any[] = await prisma.$queryRawUnsafe(
        'SELECT id, "itemsJson" FROM "PriceBook" WHERE "companyId" = $1',
        companyId
      );
      const map = new Map(rawRows.map(r => [r.id, r.itemsJson]));
      list.forEach(pb => {
        const raw = map.get(pb.id);
        if (raw) {
          try {
            pb.items = JSON.parse(raw);
          } catch {
            pb.items = [];
          }
        } else {
          pb.items = [];
        }
      });
    } catch {
      list.forEach(pb => {
        pb.items = [];
      });
    }

    return list;
  }

  static async getPriceBookById(companyId: string, priceBookId: string) {
    await this.ensureItemsJsonColumn();
    const priceBook: any = await prisma.priceBook.findUnique({
      where: { id: priceBookId, companyId },
    });
    if (!priceBook) throw new Error('PriceBook not found');

    try {
      const rawRows: any[] = await prisma.$queryRawUnsafe(
        'SELECT "itemsJson" FROM "PriceBook" WHERE id = $1 LIMIT 1',
        priceBookId
      );
      if (rawRows.length > 0 && rawRows[0].itemsJson) {
        priceBook.items = JSON.parse(rawRows[0].itemsJson);
      } else {
        priceBook.items = [];
      }
    } catch {
      priceBook.items = [];
    }

    return priceBook;
  }

  static async createPriceBook(companyId: string, data: any) {
    await this.ensureItemsJsonColumn();
    const { name, description, price, currency, itemType, itemId, status, effectiveDate, expiryDate, items } = data;

    const itemsList = Array.isArray(items)
      ? items
      : (typeof items === 'string' ? JSON.parse(items || '[]') : []);

    const calculatedPrice = itemsList.length > 0
      ? itemsList.reduce((acc: number, it: any) => acc + (Number(it.listPrice) || 0), 0) / itemsList.length
      : (parseFloat(price) || 0);

    const created: any = await prisma.priceBook.create({
      data: {
        companyId,
        name,
        description: description || null,
        price: calculatedPrice,
        currency: currency || 'INR',
        itemType: itemType || 'product',
        itemId: itemId || null,
        status: status || 'Active',
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      },
    });

    if (itemsList.length > 0) {
      try {
        await prisma.$executeRawUnsafe(
          'UPDATE "PriceBook" SET "itemsJson" = $1 WHERE id = $2',
          JSON.stringify(itemsList),
          created.id
        );
      } catch (e) {
        console.error('Failed to save itemsJson for pricebook:', e);
      }
    }

    created.items = itemsList;
    return created;
  }

  static async updatePriceBook(companyId: string, priceBookId: string, data: any) {
    await this.ensureItemsJsonColumn();
    const priceBook = await prisma.priceBook.findUnique({ where: { id: priceBookId } });
    if (!priceBook || priceBook.companyId !== companyId) throw new Error('PriceBook not found or unauthorized');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.itemType !== undefined) updateData.itemType = data.itemType;
    if (data.itemId !== undefined) updateData.itemId = data.itemId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.effectiveDate !== undefined) updateData.effectiveDate = data.effectiveDate ? new Date(data.effectiveDate) : undefined;
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : undefined;

    let itemsList: any = undefined;
    if (data.items !== undefined) {
      itemsList = Array.isArray(data.items)
        ? data.items
        : (typeof data.items === 'string' ? JSON.parse(data.items || '[]') : []);
      if (itemsList.length > 0) {
        updateData.price = itemsList.reduce((acc: number, it: any) => acc + (Number(it.listPrice) || 0), 0) / itemsList.length;
      }
    } else if (data.price !== undefined) {
      updateData.price = parseFloat(data.price);
    }

    const updated: any = await prisma.priceBook.update({
      where: { id: priceBookId },
      data: updateData,
    });

    if (itemsList !== undefined) {
      try {
        await prisma.$executeRawUnsafe(
          'UPDATE "PriceBook" SET "itemsJson" = $1 WHERE id = $2',
          JSON.stringify(itemsList),
          priceBookId
        );
      } catch (e) {
        console.error('Failed to update itemsJson for pricebook:', e);
      }
    }

    updated.items = itemsList !== undefined ? itemsList : [];
    return updated;
  }

  static async deletePriceBook(companyId: string, priceBookId: string) {
    const priceBook = await prisma.priceBook.findUnique({ where: { id: priceBookId } });
    if (!priceBook || priceBook.companyId !== companyId) throw new Error('PriceBook not found or unauthorized');
    return prisma.priceBook.delete({ where: { id: priceBookId } });
  }
}