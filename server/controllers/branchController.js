const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany();
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ message: 'Server error fetching branches' });
  }
};
