import { prisma } from '../../lib/db';
import { getNextSequenceNumber } from '../../utils/sequence';

export class PurchaseOrdersService {
    private static formatPurchaseOrder(po: any) {
        if (!po) return po;
        let parsedNotes: any = {};
        try {
            if (typeof po.notes === 'string' && po.notes.startsWith('{')) {
                parsedNotes = JSON.parse(po.notes);
            }
        } catch {}

        return {
            ...po,
            poNumber: parsedNotes.poNumber || `PO-${po.id.slice(0, 8).toUpperCase()}`,
            referenceNumber: parsedNotes.referenceNumber || null,
            lineItems: parsedNotes.items || [],
        };
    }

    static async getNextNumber(companyId: string) {
        return getNextSequenceNumber('purchaseOrder', companyId, 'PO');
    }

    static async getPurchaseOrders(companyId: string, filters: any = {}) {
        const where: any = { companyId };

        if (filters.vendorId) where.vendorId = filters.vendorId;
        if (filters.status) where.status = filters.status;
        if (filters.search) {
            where.OR = [
                { id: { contains: filters.search, mode: 'insensitive' } },
                { vendor: { name: { contains: filters.search, mode: 'insensitive' } } },
                { notes: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const orders = await prisma.purchaseOrder.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                vendor: { select: { id: true, name: true, email: true, phone: true } },
            },
        });

        return orders.map(this.formatPurchaseOrder);
    }

    static async getPurchaseOrderById(companyId: string, purchaseOrderId: string) {
        const purchaseOrder = await prisma.purchaseOrder.findUnique({
            where: { id: purchaseOrderId, companyId },
            include: {
                vendor: true,
            },
        });
        if (!purchaseOrder) throw new Error('PurchaseOrder not found');
        return this.formatPurchaseOrder(purchaseOrder);
    }

    static async createPurchaseOrder(companyId: string, data: any) {
        let { vendorId, vendorName, validUntil, status, shippingAddress, billingAddress, notes, subtotal, taxAmount, discountAmount, totalAmount } = data;
        if (!vendorId && vendorName) {
            let vend = await prisma.vendor.findFirst({
                where: { companyId, name: { equals: vendorName, mode: 'insensitive' } },
            });
            if (!vend) {
                vend = await prisma.vendor.create({
                    data: { companyId, name: vendorName, email: data.vendorEmail || null, phone: data.vendorPhone || null },
                });
            }
            vendorId = vend.id;
        }
        if (!vendorId) {
            let vend = await prisma.vendor.findFirst({ where: { companyId } });
            if (!vend) {
                vend = await prisma.vendor.create({
                    data: { companyId, name: 'Default Vendor' },
                });
            }
            vendorId = vend.id;
        }

        // If notes is JSON and missing poNumber, inject auto-generated sequential number
        let finalNotes = notes || null;
        try {
            if (finalNotes && typeof finalNotes === 'string' && finalNotes.startsWith('{')) {
                const parsed = JSON.parse(finalNotes);
                if (!parsed.poNumber) {
                    parsed.poNumber = await this.getNextNumber(companyId);
                    finalNotes = JSON.stringify(parsed);
                }
            } else if (!finalNotes) {
                const poNumber = await this.getNextNumber(companyId);
                finalNotes = JSON.stringify({ poNumber });
            }
        } catch {}

        const created = await prisma.purchaseOrder.create({
            data: {
                companyId,
                vendorId,
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
                vendor: { select: { id: true, name: true, email: true } },
            },
        });

        return this.formatPurchaseOrder(created);
    }

    static async updatePurchaseOrder(companyId: string, purchaseOrderId: string, data: any) {
        const purchaseOrder = await prisma.purchaseOrder.findUnique({ where: { id: purchaseOrderId } });
        if (!purchaseOrder || purchaseOrder.companyId !== companyId) throw new Error('PurchaseOrder not found or unauthorized');

        let { vendorId, vendorName, validUntil, status, shippingAddress, billingAddress, notes, subtotal, taxAmount, discountAmount, totalAmount } = data;
        const updateData: any = {};
        if (!vendorId && vendorName) {
            let vend = await prisma.vendor.findFirst({
                where: { companyId, name: { equals: vendorName, mode: 'insensitive' } },
            });
            if (!vend) {
                vend = await prisma.vendor.create({
                    data: { companyId, name: vendorName },
                });
            }
            vendorId = vend.id;
        }
        if (vendorId !== undefined) updateData.vendorId = vendorId;
        if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : undefined;
        if (status !== undefined) updateData.status = status;
        if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
        if (billingAddress !== undefined) updateData.billingAddress = billingAddress;
        if (notes !== undefined) updateData.notes = notes;
        if (subtotal !== undefined) updateData.subtotal = parseFloat(subtotal);
        if (taxAmount !== undefined) updateData.taxAmount = parseFloat(taxAmount);
        if (discountAmount !== undefined) updateData.discountAmount = parseFloat(discountAmount);
        if (totalAmount !== undefined) updateData.totalAmount = parseFloat(totalAmount);

        const updated = await prisma.purchaseOrder.update({
            where: { id: purchaseOrderId },
            data: updateData,
            include: {
                vendor: { select: { id: true, name: true, email: true } },
            },
        });

        return this.formatPurchaseOrder(updated);
    }

    static async deletePurchaseOrder(companyId: string, purchaseOrderId: string) {
        const purchaseOrder = await prisma.purchaseOrder.findUnique({ where: { id: purchaseOrderId } });
        if (!purchaseOrder || purchaseOrder.companyId !== companyId) throw new Error('PurchaseOrder not found or unauthorized');
        return prisma.purchaseOrder.delete({ where: { id: purchaseOrderId } });
    }
}