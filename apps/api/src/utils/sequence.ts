import { prisma } from '../lib/db';

export async function getNextSequenceNumber(
  type: 'salesOrder' | 'purchaseOrder' | 'quotation' | 'invoice',
  companyId: string,
  prefix: 'SO' | 'PO' | 'QT' | 'INV'
): Promise<string> {
  let records: any[] = [];

  if (type === 'salesOrder') {
    records = await prisma.salesOrder.findMany({
      where: { companyId },
      select: { notes: true }
    });
  } else if (type === 'purchaseOrder') {
    records = await prisma.purchaseOrder.findMany({
      where: { companyId },
      select: { notes: true }
    });
  } else if (type === 'quotation') {
    records = await prisma.quotation.findMany({
      where: { companyId },
      select: { itemsJson: true }
    });
  } else if (type === 'invoice') {
    records = await prisma.invoice.findMany({
      where: { companyId },
      select: { id: true }
    });
  }

  let maxSeq = records.length;
  const regex = new RegExp(`^${prefix}-(\\d+)`, 'i');

  for (const r of records) {
    let numStr = '';
    if (r.notes) {
      try {
        const parsed = JSON.parse(r.notes);
        numStr = parsed.orderNumber || parsed.poNumber || parsed.invoiceNumber || '';
      } catch {}
    } else if (r.itemsJson) {
      try {
        const parsed = JSON.parse(r.itemsJson);
        numStr = parsed.quoteNumber || '';
      } catch {}
    }
    const match = numStr.match(regex);
    if (match) {
      const val = parseInt(match[1], 10);
      // Only consider sequential numbers (< 10000) so random 6-digit legacy numbers don't disrupt the clean counter
      if (!isNaN(val) && val < 10000 && val > maxSeq) {
        maxSeq = val;
      }
    }
  }

  return `${prefix}-${String(maxSeq + 1).padStart(4, '0')}`;
}
