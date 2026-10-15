import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed data generation...');

  // 1. Get the first company
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log('No company found. Please register a user/company first.');
    return;
  }

  // 2. Get the default pipeline for the company
  let pipeline = await prisma.pipeline.findFirst({
    where: { companyId: company.id },
    include: { stages: true }
  });

  if (!pipeline || pipeline.stages.length === 0) {
    console.log('No pipeline found. Running pipeline seed...');
    pipeline = await prisma.pipeline.create({
      data: {
        companyId: company.id,
        name: 'Standard Sales Pipeline',
        stages: {
          create: [
            { name: 'Lead In', order: 1 },
            { name: 'Contact Made', order: 2 },
            { name: 'Needs Defined', order: 3 },
            { name: 'Proposal Made', order: 4 },
            { name: 'Negotiations', order: 5 },
          ]
        }
      },
      include: { stages: true }
    });
  }

  const stages = pipeline.stages.sort((a, b) => a.order - b.order);

  // 3. Create Dummy Leads
  console.log('Creating dummy leads...');
  const dummyLeads = [
    { name: 'Rahul Sharma', email: 'rahul@techcorp.in', phone: '9876543210', companyName: 'TechCorp', source: 'Website', status: 'New', priority: 'High', estimatedValue: 500000, notes: 'Interested in enterprise license.' },
    { name: 'Priya Patel', email: 'priya@startup.co', phone: '9988776655', companyName: 'Startup Co', source: 'Referral', status: 'Contacted', priority: 'Medium', estimatedValue: 150000, notes: 'Follow up next week.' },
    { name: 'Amit Singh', email: 'amit@logistics.com', phone: '8877665544', companyName: 'Singh Logistics', source: 'LinkedIn', status: 'Qualified', priority: 'High', estimatedValue: 800000, notes: 'Needs custom integration.' },
    { name: 'Neha Gupta', email: 'neha@retail.in', phone: '7766554433', companyName: 'Retail Chains', source: 'Cold Call', status: 'New', priority: 'Low', estimatedValue: 50000, notes: 'Small branch requirement.' },
    { name: 'Vikram Verma', email: 'vikram@fintech.net', phone: '6655443322', companyName: 'Fintech Solutions', source: 'Conference', status: 'Qualified', priority: 'Urgent', estimatedValue: 1200000, notes: 'Ready to close by month end.' },
  ];

  const createdLeads = [];
  for (const l of dummyLeads) {
    const lead = await prisma.lead.create({
      data: { ...l, companyId: company.id }
    });
    createdLeads.push(lead);
  }

  // 4. Create Dummy Deals attached to some leads
  console.log('Creating dummy deals...');
  const dummyDeals = [
    { leadId: createdLeads[0].id, stageId: stages[1].id, value: 450000 }, // Rahul in Contact Made
    { leadId: createdLeads[2].id, stageId: stages[3].id, value: 750000 }, // Amit in Proposal Made
    { leadId: createdLeads[4].id, stageId: stages[4].id, value: 1200000 }, // Vikram in Negotiations
  ];

  for (const d of dummyDeals) {
    await prisma.deal.create({
      data: {
        companyId: company.id,
        leadId: d.leadId,
        stageId: d.stageId,
        value: d.value
      }
    });
  }

  console.log('✅ Seed data successfully created!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
