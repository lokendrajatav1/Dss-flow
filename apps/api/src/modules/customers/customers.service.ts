import { prisma } from '../../lib/db';

export class CustomersService {
  static async getCustomers(companyId: string, search?: string) {
    const where: any = { companyId };
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
      ];
    }
    return prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getCustomerById(companyId: string, id: string) {
    return prisma.customer.findFirst({
      where: { id, companyId }
    });
  }

  static async createCustomer(companyId: string, data: any) {
    const { name, email, phone, companyName, jobTitle, industry, website, address, status, customData, customerType } = data;
    return prisma.customer.create({
      data: {
        companyId,
        name,
        email: email || null,
        phone: phone || null,
        companyName: companyName || null,
        jobTitle: jobTitle || null,
        industry: industry || null,
        website: website || null,
        address: address || null,
        status: status || 'Active',
        customerType: customerType || 'Business',
        customData: customData || null
      }
    });
  }

  static async updateCustomer(companyId: string, id: string, data: any) {
    const customer = await prisma.customer.findFirst({
      where: { id, companyId }
    });
    if (!customer) {
      throw new Error('Contact not found or unauthorized');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.companyName !== undefined) updateData.companyName = data.companyName || null;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle || null;
    if (data.industry !== undefined) updateData.industry = data.industry || null;
    if (data.website !== undefined) updateData.website = data.website || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.customerType !== undefined) updateData.customerType = data.customerType;
    if (data.customData !== undefined) updateData.customData = data.customData;

    return prisma.customer.update({
      where: { id },
      data: updateData
    });
  }

  static async deleteCustomer(companyId: string, id: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, companyId }
    });
    if (!customer) {
      throw new Error('Contact not found or unauthorized');
    }

    return prisma.customer.delete({
      where: { id }
    });
  }
}
