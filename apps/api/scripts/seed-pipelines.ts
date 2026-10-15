import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default pipelines for existing companies...');
  
  const companies = await prisma.company.findMany({
    include: { pipelines: true }
  });

  for (const company of companies) {
    if (company.pipelines.length === 0) {
      console.log(`Creating pipeline for company: ${company.name}`);
      await prisma.pipeline.create({
        data: {
          companyId: company.id,
          name: 'Standard Pipeline',
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
        }
      });
      console.log(`✅ Pipeline created for ${company.name}`);
    }
  }
  
  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
