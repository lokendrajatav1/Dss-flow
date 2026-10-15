import { prisma } from '../../lib/db';
import { getNextSequenceNumber } from '../../utils/sequence';

export class QuotationsService {
  private static formatQuotation(quote: any) {
    if (!quote) return quote;
    let parsedJson: any = {};
    try {
      if (typeof quote.itemsJson === 'string' && (quote.itemsJson.startsWith('{') || quote.itemsJson.startsWith('['))) {
        parsedJson = JSON.parse(quote.itemsJson);
      } else if (typeof quote.itemsJson === 'object' && quote.itemsJson) {
        parsedJson = quote.itemsJson;
      }
    } catch {}

    const quoteNumber = parsedJson.quoteNumber || `QT-${quote.id.slice(0, 8).toUpperCase()}`;
    const subject = parsedJson.subject || null;
    const referenceNumber = parsedJson.referenceNumber || null;

    return {
      ...quote,
      quoteNumber,
      subject,
      referenceNumber,
    };
  }

  static async getNextNumber(companyId: string) {
    return getNextSequenceNumber('quotation', companyId, 'QT');
  }

  static async getQuotations(companyId: string, filters: any = {}) {
    const where: any = { companyId };

    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search, mode: 'insensitive' } },
        { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
        { itemsJson: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const quotations = await prisma.quotation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return quotations.map(this.formatQuotation);
  }

  static async getQuotationById(companyId: string, quotationId: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId, companyId },
      include: { customer: true },
    });
    if (!quotation) throw new Error('Quotation not found');
    return this.formatQuotation(quotation);
  }

  static async createQuotation(companyId: string, data: any) {
    let { customerId, customerName, totalValue, status, itemsJson, validUntil } = data;
    if (!customerId && customerName) {
      let cust = await prisma.customer.findFirst({
        where: { companyId, name: { equals: customerName, mode: 'insensitive' } },
      });
      if (!cust) {
        cust = await prisma.customer.create({
          data: { companyId, name: customerName, email: data.customerEmail || null, phone: data.customerPhone || null },
        });
      }
      customerId = cust.id;
    }
    if (!customerId) {
      let cust = await prisma.customer.findFirst({ where: { companyId } });
      if (!cust) {
        cust = await prisma.customer.create({
          data: { companyId, name: 'Direct Customer' },
        });
      }
      customerId = cust.id;
    }

    let finalJson: any = itemsJson;
    try {
      if (typeof finalJson === 'string' && finalJson.startsWith('{')) {
        const parsed = JSON.parse(finalJson);
        if (!parsed.quoteNumber) {
          parsed.quoteNumber = await this.getNextNumber(companyId);
          finalJson = JSON.stringify(parsed);
        }
      } else if (!finalJson) {
        const quoteNumber = await this.getNextNumber(companyId);
        finalJson = JSON.stringify({ quoteNumber });
      }
    } catch {}

    const created = await prisma.quotation.create({
      data: {
        companyId,
        customerId,
        totalValue: parseFloat(totalValue) || 0,
        status: status || 'draft',
        itemsJson: typeof finalJson === 'string' ? finalJson : JSON.stringify(finalJson || []),
        validUntil: validUntil ? new Date(validUntil) : undefined,
      },
      include: { customer: { select: { id: true, name: true, email: true } } },
    });

    return this.formatQuotation(created);
  }

  static async updateQuotation(companyId: string, quotationId: string, data: any) {
    const quotation = await prisma.quotation.findUnique({ where: { id: quotationId } });
    if (!quotation || quotation.companyId !== companyId) throw new Error('Quotation not found or unauthorized');

    const { customerId, totalValue, status, itemsJson, validUntil } = data;
    const updateData: any = {};
    if (customerId !== undefined) updateData.customerId = customerId;
    if (totalValue !== undefined) updateData.totalValue = parseFloat(totalValue);
    if (status !== undefined) updateData.status = status;
    if (itemsJson !== undefined) updateData.itemsJson = typeof itemsJson === 'string' ? itemsJson : JSON.stringify(itemsJson);
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : undefined;

    const updated = await prisma.quotation.update({
      where: { id: quotationId },
      data: updateData,
      include: { customer: { select: { id: true, name: true, email: true } } },
    });

    return this.formatQuotation(updated);
  }

  static async deleteQuotation(companyId: string, quotationId: string) {
    const quotation = await prisma.quotation.findUnique({ where: { id: quotationId } });
    if (!quotation || quotation.companyId !== companyId) throw new Error('Quotation not found or unauthorized');
    return prisma.quotation.delete({ where: { id: quotationId } });
  }
}