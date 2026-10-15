import { prisma } from '../../lib/db';

export class PaymentsService {
  static async getPayments(companyId: string, filters: any = {}) {
    const where: any = { companyId };

    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.method) where.method = filters.method;
    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search, mode: 'insensitive' } },
        { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return prisma.payment.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async getPaymentById(companyId: string, paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId, companyId },
      include: { customer: true },
    });
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  static async createPayment(companyId: string, data: any) {
    return prisma.payment.create({
      data: {
        companyId,
        customerId: data.customerId,
        amount: parseFloat(data.amount) || 0,
        method: data.method || 'Bank Transfer',
        type: data.type || 'in',
        status: data.status || 'Pending',
        notes: data.notes || null,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: { customer: { select: { id: true, name: true, email: true } } },
    });
  }

  static async updatePayment(companyId: string, paymentId: string, data: any) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.companyId !== companyId) throw new Error('Payment not found or unauthorized');

    const updateData: any = {};
    if (data.customerId !== undefined) updateData.customerId = data.customerId;
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
    if (data.method !== undefined) updateData.method = data.method;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.date !== undefined) updateData.date = new Date(data.date);

    return prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
      include: { customer: { select: { id: true, name: true, email: true } } },
    });
  }

  static async deletePayment(companyId: string, paymentId: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.companyId !== companyId) throw new Error('Payment not found or unauthorized');
    return prisma.payment.delete({ where: { id: paymentId } });
  }
}