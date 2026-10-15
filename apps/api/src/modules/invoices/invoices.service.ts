import { prisma } from '../../lib/db';
import { getNextSequenceNumber } from '../../utils/sequence';

export class InvoicesService {
  static async getNextNumber(companyId: string) {
    return getNextSequenceNumber('invoice', companyId, 'INV');
  }

  static async getInvoices(companyId: string, filters: any = {}) {
    const where: any = { companyId };

    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search, mode: 'insensitive' } },
        { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    // Build consistent sequential numbering for company invoices
    const allInvoices = await prisma.invoice.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    const seqMap = new Map<string, string>();
    allInvoices.forEach((inv, idx) => {
      seqMap.set(inv.id, `INV-${String(idx + 1).padStart(4, '0')}`);
    });

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    const notesList: any[] = await prisma.$queryRawUnsafe(
      'SELECT "id", "notes" FROM "Invoice" WHERE "companyId" = $1',
      companyId
    );
    const notesMap = new Map<string, string>();
    notesList.forEach(r => {
      if (r.notes) notesMap.set(r.id, r.notes);
    });

    return invoices.map(inv => {
      const noteStr = notesMap.get(inv.id) || null;
      let invoiceNumber = '';
      if (noteStr) {
        try {
          const parsed = JSON.parse(noteStr);
          if (parsed.invoiceNumber) invoiceNumber = parsed.invoiceNumber;
        } catch {}
      }
      if (!invoiceNumber) {
        invoiceNumber = seqMap.get(inv.id) || `INV-${inv.id.slice(0, 8).toUpperCase()}`;
      }

      return {
        ...inv,
        notes: noteStr,
        invoiceNumber,
      };
    });
  }

  static async getInvoiceById(companyId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, companyId },
      include: {
        customer: true,
      },
    });
    if (!invoice) throw new Error('Invoice not found');

    const rawNotesRes: any[] = await prisma.$queryRawUnsafe(
      'SELECT "notes" FROM "Invoice" WHERE "id" = $1 LIMIT 1',
      invoiceId
    );
    const notes = rawNotesRes?.[0]?.notes || null;

    let invoiceNumber = '';
    if (notes) {
      try {
        const parsed = JSON.parse(notes);
        if (parsed.invoiceNumber) invoiceNumber = parsed.invoiceNumber;
      } catch {}
    }

    if (!invoiceNumber) {
      const allInvoices = await prisma.invoice.findMany({
        where: { companyId },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      const idx = allInvoices.findIndex(inv => inv.id === invoiceId);
      invoiceNumber = idx >= 0 ? `INV-${String(idx + 1).padStart(4, '0')}` : `INV-${invoice.id.slice(0, 8).toUpperCase()}`;
    }

    return {
      ...invoice,
      notes,
      invoiceNumber,
    };
  }

  static async createInvoice(companyId: string, data: any) {
    let { customerId, customerName, amount, dueDate, paymentMethod, status, notes } = data;
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

    let finalNotes = notes || null;
    let invoiceNumber = '';
    try {
      if (finalNotes && typeof finalNotes === 'string' && finalNotes.startsWith('{')) {
        const parsed = JSON.parse(finalNotes);
        if (!parsed.invoiceNumber) {
          parsed.invoiceNumber = await this.getNextNumber(companyId);
        }
        invoiceNumber = parsed.invoiceNumber;
        finalNotes = JSON.stringify(parsed);
      } else if (!finalNotes) {
        invoiceNumber = await this.getNextNumber(companyId);
        finalNotes = JSON.stringify({ invoiceNumber });
      }
    } catch {}

    const created = await prisma.invoice.create({
      data: {
        companyId,
        customerId,
        amount: parseFloat(amount) || 0,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        paymentMethod: paymentMethod || null,
        status: status || 'unpaid',
      },
      include: { customer: { select: { id: true, name: true, email: true } } },
    });

    if (finalNotes) {
      await prisma.$executeRawUnsafe(
        'UPDATE "Invoice" SET "notes" = $1 WHERE "id" = $2',
        finalNotes,
        created.id
      );
    }

    if (!invoiceNumber) {
      const count = await prisma.invoice.count({ where: { companyId } });
      invoiceNumber = `INV-${String(count).padStart(4, '0')}`;
    }

    return {
      ...created,
      notes: finalNotes,
      invoiceNumber,
    };
  }

  static async updateInvoice(companyId: string, invoiceId: string, data: any) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.companyId !== companyId) throw new Error('Invoice not found or unauthorized');

    const { customerId, amount, dueDate, paymentMethod, status, notes } = data;
    const updateData: any = {};
    if (customerId !== undefined) updateData.customerId = customerId;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : new Date();
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (status !== undefined) updateData.status = status;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
      include: { customer: { select: { id: true, name: true, email: true } } },
    });

    if (notes !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE "Invoice" SET "notes" = $1 WHERE "id" = $2',
        typeof notes === 'string' ? notes : JSON.stringify(notes),
        invoiceId
      );
    }

    return this.getInvoiceById(companyId, invoiceId);
  }

  static async deleteInvoice(companyId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.companyId !== companyId) throw new Error('Invoice not found or unauthorized');
    return prisma.invoice.delete({ where: { id: invoiceId } });
  }
}
