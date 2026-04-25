const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const salesUser = await prisma.adminUser.upsert({
    where: { email: 'sales@crystalevents.co.uk' },
    update: {
      password: hashedPassword,
      role: 'sales'
    },
    create: {
      email: 'sales@crystalevents.co.uk',
      password: hashedPassword,
      role: 'sales'
    }
  });

  console.log('Sales user created/updated:', salesUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
