import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  if (companies.length === 0) {
    console.log("No companies found to attach leads to!");
    return;
  }
  const companyId = companies[0].id;
  
  console.log(`Using company: ${companyId}`);
  
  const leadsData = [
    {
      companyId,
      name: "Rahul Sharma",
      phone: "+91 9876543210",
      email: "rahul.s@example.in",
      companyName: "Sharma Enterprises",
      jobTitle: "Owner",
      source: "Facebook Ads",
      status: "New",
      priority: "High",
      estimatedValue: 150000,
      nextFollowUp: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      notes: "Interested in bulk order of CRM software."
    },
    {
      companyId,
      name: "Priya Patel",
      phone: "+91 8765432109",
      email: "priya.p@techsolutions.in",
      companyName: "Tech Solutions Pvt Ltd",
      jobTitle: "CTO",
      source: "LinkedIn",
      status: "Contacted",
      priority: "Medium",
      estimatedValue: 75000,
      nextFollowUp: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), // In 5 days
      notes: "Asked for a custom quotation. Follow up next week."
    },
    {
      companyId,
      name: "Amit Kumar",
      phone: "+91 7654321098",
      email: "amit.k@retailindia.com",
      companyName: "Retail India",
      jobTitle: "Marketing Head",
      source: "Google Ads",
      status: "Qualified",
      priority: "High",
      estimatedValue: 250000,
      nextFollowUp: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      notes: "Budget approved. Ready for demo."
    },
    {
      companyId,
      name: "Neha Gupta",
      phone: "+91 6543210987",
      email: "neha.g@startup.in",
      companyName: "NextGen Startup",
      jobTitle: "Founder",
      source: "Organic Search",
      status: "New",
      priority: "Low",
      estimatedValue: 25000,
      nextFollowUp: null,
      notes: "Just inquiring about pricing."
    },
    {
      companyId,
      name: "Vikram Singh",
      phone: "+91 9988776655",
      email: "vikram.s@logistics.co.in",
      companyName: "Express Logistics",
      jobTitle: "Operations Manager",
      source: "Referral",
      status: "Proposal Sent",
      priority: "Medium",
      estimatedValue: 120000,
      nextFollowUp: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      notes: "Sent proposal yesterday. Call on Wednesday."
    }
  ];

  for (const lead of leadsData) {
    await prisma.lead.create({
      data: lead
    });
  }
  
  console.log("Successfully seeded 5 dummy leads!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
