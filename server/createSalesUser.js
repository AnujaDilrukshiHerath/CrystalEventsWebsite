const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const hashedPassword = await bcrypt.hash('Crystalsales@2310', 10);
  
  const salesUser = await prisma.adminUser.upsert({
    where: { email: 'crystalpayments@icloud.com' },
    update: {
      password: hashedPassword,
      role: 'sales'
    },
    create: {
      email: 'crystalpayments@icloud.com',
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
