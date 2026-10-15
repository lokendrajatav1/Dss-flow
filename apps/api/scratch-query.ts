import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(leads, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
