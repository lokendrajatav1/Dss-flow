import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting mock data seeding...');

    // Clear existing data (in reverse order due to foreign key constraints)
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.deal.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.company.deleteMany();

    // Seed companies with sample data
    const companyIds: string[] = [];
    for (let i = 0; i < 5; i++) {
        const company = await prisma.company.create({
            data: {
                name: `Company ${i + 1}`,
                domain: `company${i + 1}.com`,
                plan: 'enterprise',
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        companyIds.push(company.id);
        console.log(`Created company: ${company.name} (ID: ${company.id})`);
    }

    // Seed leads for each company
    const leadIds: string[] = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const lead = await prisma.lead.create({
                data: {
                    companyId: companyIds[i],
                    name: `Lead ${j + 1} - Company ${i + 1}`,
                    customerType: 'Business',
                    displayName: `John Doe - ${i + 1}`,
                    clientName: `Client ${j + 1}`,
                    companyName: `Company ${i + 1}`,
                    phone: `+91-98765-43210`,
                    alternatePhone: `+91-98766-54321`,
                    whatsappNumber: `+91587654321`,
                    email: `john.doe@${i + 1}.com`,
                    jobTitle: 'Sales Manager',
                    country: 'India',
                    city: 'Mumbai',
                    address: '123 Business Street, Mumbai',
                    industry: 'Technology',
                    websiteUrl: `https://www.johndoe.com`,
                    leadType: 'New',
                    source: 'Referral',
                    notes: 'High potential lead for enterprise solution',
                    groupId: undefined,
                    funnelId: undefined,
                    assignedToId: undefined,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            leadIds.push(lead.id);
            console.log(`Created lead: ${lead.name} (ID: ${lead.id})`);
        }
    }

    // Seed customers
    const customerIds: string[] = [];
    for (let i = 0; i < 10; i++) {
        const customer = await prisma.customer.create({
            data: {
                name: `Customer ${i + 1}`,
                companyId: companyIds[i % 5],
                customerType: 'Business',
                phone: `+91-12345-6789`,
                email: `customer${i + 1}@company.com`,
                companyName: `Company ${i + 1}`,
                jobTitle: 'CEO',
                industry: 'Finance',
                website: `https://www.customer${i + 1}.com`,
                address: '456 Corporate Ave, Mumbai',
                status: 'Active',
                customData: JSON.stringify({ tier: 'Gold', annualSpend: 500000 }),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        customerIds.push(customer.id);
        console.log(`Created customer: ${customer.name} (ID: ${customer.id})`);
    }

    // Create pipelines and stages for each company
    const stageIds: string[] = [];
    for (let i = 0; i < 5; i++) {
        const pipeline = await prisma.pipeline.create({
            data: {
                companyId: companyIds[i],
                name: `Standard Pipeline`,
                type: 'DEAL',
                stages: {
                    create: [
                        { name: 'Lead In', order: 1 },
                        { name: 'Contact Made', order: 2 },
                        { name: 'Requirements Gathered', order: 3 },
                        { name: 'Proposal Sent', order: 4 },
                        { name: 'Negotiation', order: 5 },
                        { name: 'Won', order: 6 },
                        { name: 'Lost', order: 7 }
                    ]
                }
            },
            include: { stages: true }
        });
        pipeline.stages.forEach(s => stageIds.push(s.id));
        console.log(`Created pipeline with ${pipeline.stages.length} stages for company ${i + 1}`);
    }

    // Seed deals
    for (let i = 0; i < 15; i++) {
        const deal = await prisma.deal.create({
            data: {
                companyId: companyIds[i % 5],
                title: `Deal ${i + 1}: Enterprise Solution for ${i + 1}`,
                leadId: leadIds[i % leadIds.length],
                customerId: customerIds[i % customerIds.length],
                stageId: stageIds[i % stageIds.length],
                value: 50000 + (i * 1000),
                expectedCloseDate: new Date(Date.now() + Math.random() * 30 * 86400000),
                priority: 'Medium',
                assignedToId: undefined,
                notes: `Proposed deal for ${i + 1} company`,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        console.log(`Created deal: ${deal.title} (ID: ${deal.id})`);
    }

    // Seed invoices
    for (let i = 0; i < 8; i++) {
        const invoice = await prisma.invoice.create({
            data: {
                companyId: companyIds[i % 5],
                customerId: customerIds[i % customerIds.length],
                amount: 15000 + (i * 5000),
                status: 'unpaid',
                dueDate: new Date(Date.now() + Math.random() * 60 * 86400000),
                paymentMethod: 'Bank Transfer',
                createdAt: new Date(),
            },
        });
        console.log(`Created invoice: ${invoice.amount} INR (ID: ${invoice.id})`);
    }

    // Seed payments
    for (let i = 0; i < 6; i++) {
        const payment = await prisma.payment.create({
            data: {
                companyId: companyIds[i % 5],
                customerId: customerIds[i % customerIds.length],
                amount: 8000 + (i * 2000),
                method: 'Bank Transfer',
                type: 'in',
                status: 'completed',
                notes: `Payment for invoice #${Math.floor(i / 2) + 1}`,
                date: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        console.log(`Created payment: ${payment.amount} INR (ID: ${payment.id})`);
    }

    console.log('Mock data seeding completed!');
}

main()
    .catch(e => {
        console.error(e);
        (globalThis as any).process?.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
