import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Creating Super Admin User ---');

  // 1. Get or create Platform Company
  let platformCompany = await prisma.company.findFirst({
    where: { domain: 'platform.local' }
  });

  if (!platformCompany) {
    platformCompany = await prisma.company.create({
      data: {
        name: 'Platform Administration',
        domain: 'platform.local',
        plan: 'enterprise',
        active: true,
      }
    });
    console.log(`Created platform company: ${platformCompany.name} (${platformCompany.id})`);
  } else {
    console.log(`Found platform company: ${platformCompany.name} (${platformCompany.id})`);
  }

  // 2. Get or create superadmin role
  let superAdminRole = await prisma.role.findFirst({
    where: {
      companyId: platformCompany.id,
      name: 'superadmin'
    }
  });

  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: {
        companyId: platformCompany.id,
        name: 'superadmin',
        permissions: ['*']
      }
    });
    console.log(`Created superadmin role: ${superAdminRole.id}`);
  } else {
    console.log(`Found superadmin role: ${superAdminRole.id}`);
  }

  // 3. Hash password 'admin123'
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  // 4. Create or update user: admin@platform.com
  const email = 'admin@platform.com';
  const superAdmin = await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Platform Super Admin',
      passwordHash,
      roleId: superAdminRole.id,
      companyId: platformCompany.id,
      active: true,
    },
    create: {
      name: 'Platform Super Admin',
      email,
      passwordHash,
      roleId: superAdminRole.id,
      companyId: platformCompany.id,
      active: true,
    }
  });

  console.log('==============================================');
  console.log('✅ Super Admin created successfully!');
  console.log(`Email:    ${superAdmin.email}`);
  console.log(`Password: admin123`);
  console.log(`Role:     superadmin`);
  console.log('==============================================');
}

main()
  .catch((e) => {
    console.error('Error creating super admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
