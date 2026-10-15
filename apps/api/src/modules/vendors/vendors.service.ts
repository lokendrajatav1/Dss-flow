import { prisma } from '../../lib/db';

export class VendorsService {
  static async getVendors(companyId: string, filters: any = {}) {
    const where: any = { companyId };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { contactPerson: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.status && filters.status !== 'all') where.status = filters.status;

    return prisma.vendor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getVendorById(companyId: string, id: string) {
    const vendor = await prisma.vendor.findUnique({
      where: { id, companyId },
    });
    if (!vendor) throw new Error('Vendor not found');
    return vendor;
  }

  static async createVendor(companyId: string, data: any) {
    return prisma.vendor.create({
      data: {
        companyId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        contactPerson: data.contactPerson || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null,
        taxId: data.taxId || null,
        status: data.status || 'Active',
        notes: data.notes || null,
      },
    });
  }

  static async updateVendor(companyId: string, id: string, data: any) {
    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (!vendor || vendor.companyId !== companyId) throw new Error('Vendor not found or unauthorized');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.taxId !== undefined) updateData.taxId = data.taxId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return prisma.vendor.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteVendor(companyId: string, id: string) {
    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (!vendor || vendor.companyId !== companyId) throw new Error('Vendor not found or unauthorized');
    return prisma.vendor.delete({ where: { id } });
  }
}
