const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany();
  console.log('Current events:', events.map(e => e.name));

  const targetEvent = events.find(e => e.name.toLowerCase().includes('concert') || e.name.toLowerCase().includes('music'));
  
  if (targetEvent) {
    console.log(`Updating event: ${targetEvent.name} (${targetEvent.id})`);
    // Convert youtu.be to embed URL
    const videoId = '27LjOpjF6N4';
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    
    await prisma.event.update({
      where: { id: targetEvent.id },
      data: { videoUrl: embedUrl }
    });
    console.log('Update successful!');
  } else {
    console.log('No matching event found.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
