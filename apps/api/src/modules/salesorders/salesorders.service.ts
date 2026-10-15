import { prisma } from '../../lib/db';
import { getNextSequenceNumber } from '../../utils/sequence';

export class SalesOrdersService {
    private static formatSalesOrder(so: any) {
        if (!so) return so;
        let parsedNotes: any = {};
        try {
            if (typeof so.notes === 'string' && so.notes.startsWith('{')) {
                parsedNotes = JSON.parse(so.notes);
            }
        } catch {}

        return {
            ...so,
            orderNumber: parsedNotes.orderNumber || `SO-${so.id.slice(0, 8).toUpperCase()}`,
            referenceNumber: parsedNotes.referenceNumber || null,
            lineItems: parsedNotes.items || [],
        };
    }

    static async getNextNumber(companyId: string) {
        return getNextSequenceNumber('salesOrder', companyId, 'SO');
    }

    static async getSalesOrders(companyId: string, filters: any = {}) {
        const where: any = { companyId };

        if (filters.customerId) where.customerId = filters.customerId;
        if (filters.status) where.status = filters.status;
        if (filters.search) {
            where.OR = [
                { id: { contains: filters.search, mode: 'insensitive' } },
                { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
                { notes: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const orders = await prisma.salesOrder.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: { select: { id: true, name: true, email: true, phone: true } },
                priceBook: { select: { id: true, name: true, price: true } },
            },
        });

        return orders.map(this.formatSalesOrder);
    }

    static async getSalesOrderById(companyId: string, salesOrderId: string) {
        const salesOrder = await prisma.salesOrder.findUnique({
            where: { id: salesOrderId, companyId },
            include: {
                customer: true,
                priceBook: true,
            },
        });
        if (!salesOrder) throw new Error('SalesOrder not found');
        return this.formatSalesOrder(salesOrder);
    }

    static async createSalesOrder(companyId: string, data: any) {
        let { customerId, customerName, priceBookId, validUntil, status, shippingAddress, billingAddress, notes, subtotal, taxAmount, discountAmount, totalAmount } = data;
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

        // If notes is JSON and missing orderNumber, inject auto-generated sequential number
        let finalNotes = notes || null;
        try {
            if (finalNotes && typeof finalNotes === 'string' && finalNotes.startsWith('{')) {
                const parsed = JSON.parse(finalNotes);
                if (!parsed.orderNumber) {
                    parsed.orderNumber = await this.getNextNumber(companyId);
                    finalNotes = JSON.stringify(parsed);
                }
            } else if (!finalNotes) {
                const orderNumber = await this.getNextNumber(companyId);
                finalNotes = JSON.stringify({ orderNumber });
            }
        } catch {}

        const created = await prisma.salesOrder.create({
            data: {
                companyId,
                customerId,
                priceBookId: priceBookId || null,
                validUntil: validUntil ? new Date(validUntil) : undefined,
                status: status || 'pending',
                shippingAddress: shippingAddress || null,
                billingAddress: billingAddress || null,
                notes: finalNotes,
                subtotal: parseFloat(subtotal) || 0,
                taxAmount: parseFloat(taxAmount) || 0,
                discountAmount: parseFloat(discountAmount) || 0,
                totalAmount: parseFloat(totalAmount) || 0,
            },
            include: {
                customer: { select: { id: true, name: true, email: true } },
                priceBook: { select: { id: true, name: true, price: true } },
            },
        });

        return this.formatSalesOrder(created);
    }

    static async updateSalesOrder(companyId: string, salesOrderId: string, data: any) {
        const salesOrder = await prisma.salesOrder.findUnique({ where: { id: salesOrderId } });
        if (!salesOrder || salesOrder.companyId !== companyId) throw new Error('SalesOrder not found or unauthorized');

        let { customerId, customerName, priceBookId, validUntil, status, shippingAddress, billingAddress, notes, subtotal, taxAmount, discountAmount, totalAmount } = data;
        const updateData: any = {};
        if (!customerId && customerName) {
            let cust = await prisma.customer.findFirst({
                where: { companyId, name: { equals: customerName, mode: 'insensitive' } },
            });
            if (!cust) {
                cust = await prisma.customer.create({
                    data: { companyId, name: customerName },
                });
            }
            customerId = cust.id;
        }
        if (customerId !== undefined) updateData.customerId = customerId;
        if (priceBookId !== undefined) updateData.priceBookId = priceBookId;
        if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : undefined;
        if (status !== undefined) updateData.status = status;
        if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
        if (billingAddress !== undefined) updateData.billingAddress = billingAddress;
        if (notes !== undefined) updateData.notes = notes;
        if (subtotal !== undefined) updateData.subtotal = parseFloat(subtotal);
        if (taxAmount !== undefined) updateData.taxAmount = parseFloat(taxAmount);
        if (discountAmount !== undefined) updateData.discountAmount = parseFloat(discountAmount);
        if (totalAmount !== undefined) updateData.totalAmount = parseFloat(totalAmount);

        const updated = await prisma.salesOrder.update({
            where: { id: salesOrderId },
            data: updateData,
            include: {
                customer: { select: { id: true, name: true, email: true } },
                priceBook: { select: { id: true, name: true, price: true } },
            },
        });

        return this.formatSalesOrder(updated);
    }

    static async deleteSalesOrder(companyId: string, salesOrderId: string) {
        const salesOrder = await prisma.salesOrder.findUnique({ where: { id: salesOrderId } });
        if (!salesOrder || salesOrder.companyId !== companyId) throw new Error('SalesOrder not found or unauthorized');
        return prisma.salesOrder.delete({ where: { id: salesOrderId } });
    }
}