const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getCatering = async (req, res) => {
  try {
    const cuisinesList = await prisma.cuisine.findMany();
    
    // Convert back to the object structure expected by the frontend
    const cateringData = {};
    cuisinesList.forEach(c => {
      cateringData[c.id] = {
        id: c.id,
        name: c.name,
        description: c.description,
        menu: JSON.parse(c.menu)
      };
    });
    
    res.status(200).json(cateringData);
  } catch (error) {
    console.error('Error fetching catering data:', error);
    res.status(500).json({ message: "Error fetching catering data", error: error.message });
  }
};
