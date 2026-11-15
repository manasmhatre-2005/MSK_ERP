const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function provisionAccounts() {
  console.log('--- PROVISIONING ADMIN & ACCOUNT MANAGER ACCOUNTS ---');

  // 1. Admin Account: admin@login / admin@123
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@login' }
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin@123', salt);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@login',
        passwordHash,
        name: 'MSK System Administrator',
        role: 'ADMIN',
        active: true,
      }
    });
    console.log('✅ Created Admin user:', admin.email, 'Role:', admin.role);
  } else {
    // Ensure active and role is ADMIN
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin@123', salt);
    await prisma.user.update({
      where: { email: 'admin@login' },
      data: { role: 'ADMIN', active: true, passwordHash }
    });
    console.log('ℹ️ Updated existing Admin user: admin@login with active status and password');
  }

  // 2. Account Manager Account: account@login / Account@123
  const existingAccount = await prisma.user.findUnique({
    where: { email: 'account@login' }
  });

  if (!existingAccount) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Account@123', salt);
    const accountUser = await prisma.user.create({
      data: {
        email: 'account@login',
        passwordHash,
        name: 'MSK Account Manager',
        role: 'ACCOUNT_MANAGER',
        active: true,
      }
    });
    console.log('✅ Created Account Manager user:', accountUser.email, 'Role:', accountUser.role);
  } else {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Account@123', salt);
    await prisma.user.update({
      where: { email: 'account@login' },
      data: { role: 'ACCOUNT_MANAGER', active: true, passwordHash }
    });
    console.log('ℹ️ Updated existing Account Manager user: account@login with active status and password');
  }

  // Verify list of users
  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, active: true }
  });
  console.log('Total users in database:', allUsers.length);
  console.log(JSON.stringify(allUsers, null, 2));

  await prisma.$disconnect();
}

provisionAccounts().catch(err => {
  console.error('Provisioning error:', err);
  process.exit(1);
});
