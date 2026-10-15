import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  console.log("Found company:", company);
  if (!company) {
    console.log("No company found! Creating a default one...");
    const newCompany = await prisma.company.create({
      data: { name: 'Default Company' }
    });
    console.log("Created company:", newCompany);
  }
  const convs = await prisma.conversation.findMany();
  console.log(`Found ${convs.length} conversations`);
  const msgs = await prisma.message.findMany();
  console.log(`Found ${msgs.length} messages`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
