const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, active: true }
  });
  console.log('CURRENT USERS:', JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
