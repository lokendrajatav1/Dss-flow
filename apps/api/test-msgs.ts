import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const msgs = await prisma.message.findMany({
    orderBy: { timestamp: 'desc' },
    take: 3,
    include: { conversation: true }
  });
  console.log(JSON.stringify(msgs, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
