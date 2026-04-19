const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};
