const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Operator@123', salt);
  const op = await prisma.user.upsert({
    where: { email: 'operator@login' },
    update: { role: 'DATA_ENTRY', active: true, passwordHash },
    create: {
      email: 'operator@login',
      passwordHash,
      name: 'MSK Data Entry Operator',
      role: 'DATA_ENTRY',
      active: true,
    },
  });
  console.log('✅ Operator user provisioned:', op.email, op.role);

  const users = await prisma.user.findMany({
    select: { email: true, role: true, active: true },
  });
  console.log('Current system users:', users);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
