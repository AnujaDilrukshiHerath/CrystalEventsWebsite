const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Existing gallery data from data/gallery.js
const existingGallery = [
  {
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=60&w=800",
    title: "Catering Excellence",
    category: "Catering",
    sortOrder: 1
  },
  {
    url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=60&w=800",
    title: "Live Performance",
    category: "Event",
    sortOrder: 2
  },
  {
    url: "/images/gallery/gallery.jpeg",
    title: "Crystal Events Celebration",
    category: "Event",
    sortOrder: 3
  },
  {
    url: "/images/gallery/gallery2.jpeg",
    title: "Elegant Venue Setting",
    category: "Venue",
    sortOrder: 4
  },
  {
    url: "/images/gallery/slough-table copy.jpeg",
    title: "Slough Hall Table Arrangement",
    category: "Venue",
    sortOrder: 5
  }
];

async function seedGallery() {
  console.log('Seeding gallery images...');
  
  // Check if gallery already has data
  const existingCount = await prisma.galleryImage.count();
  if (existingCount > 0) {
    console.log(`Gallery already has ${existingCount} images. Skipping seed.`);
    return;
  }

  for (const img of existingGallery) {
    await prisma.galleryImage.create({
      data: {
        url: img.url,
        title: img.title,
        category: img.category,
        sortOrder: img.sortOrder,
        active: true
      }
    });
    console.log(`  ✓ Added: ${img.title}`);
  }

  console.log(`Seeded ${existingGallery.length} gallery images successfully.`);
}

seedGallery()
  .catch(e => {
    console.error('Error seeding gallery:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
