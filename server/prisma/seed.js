const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const branchesData = require('../data/branches');
const hallsData = require('../data/halls');
const eventsData = require('../data/events');
const cateringData = require('../data/catering');

async function main() {
  console.log('Seeding data...');

  // Create branches
  for (const branch of branchesData) {
    await prisma.branch.upsert({
      where: { id: branch.id },
      update: {
        name: branch.name,
        location: branch.location,
        description: branch.description,
        phone: branch.phone,
        image: branch.image,
        mapLink: branch.mapLink,
      },
      create: branch,
    });
  }

  // Create halls
  for (const hall of hallsData) {
    await prisma.hall.upsert({
      where: { id: hall.id },
      update: {
        name: hall.name,
        branchId: hall.branchId,
        floor: hall.floor,
        minCapacity: hall.minCapacity,
        maxCapacity: hall.maxCapacity,
        description: hall.description,
        images: JSON.stringify(hall.images),
      },
      create: {
        id: hall.id,
        name: hall.name,
        branchId: hall.branchId,
        floor: hall.floor,
        minCapacity: hall.minCapacity,
        maxCapacity: hall.maxCapacity,
        description: hall.description,
        images: JSON.stringify(hall.images),
      },
    });
  }

  // Create events
  for (const event of eventsData) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {
        name: event.name,
        description: event.description,
        image: event.image,
        videoUrl: event.videoUrl,
      },
      create: event,
    });
  }

  // Create catering cuisines
  for (const key of Object.keys(cateringData)) {
    const cuisine = cateringData[key];
    await prisma.cuisine.upsert({
      where: { id: key },
      update: {
        name: cuisine.name,
        description: cuisine.description,
        menu: JSON.stringify(cuisine.menu),
      },
      create: {
        id: key,
        name: cuisine.name,
        description: cuisine.description,
        menu: JSON.stringify(cuisine.menu),
      },
    });
  }

  // Create default admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@crystalevents.co.uk';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
