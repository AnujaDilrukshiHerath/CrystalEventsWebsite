const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getHalls = async (req, res) => {
  try {
    const { branchId } = req.query;
    let whereClause = {};
    
    if (branchId) {
      whereClause.branchId = branchId;
    }
    
    let halls = await prisma.hall.findMany({
      where: whereClause
    });

    // Parse the JSON string arrays back to actual arrays for the frontend
    halls = halls.map(hall => ({
      ...hall,
      images: JSON.parse(hall.images)
    }));
    
    res.status(200).json(halls);
  } catch (error) {
    console.error('Error fetching halls:', error);
    res.status(500).json({ message: "Error fetching halls", error: error.message });
  }
};

exports.getHallById = async (req, res) => {
  try {
    const { id } = req.params;
    const hall = await prisma.hall.findUnique({
      where: { id }
    });
    
    if (!hall) {
      return res.status(404).json({ message: "Hall not found" });
    }

    hall.images = JSON.parse(hall.images);
    
    res.status(200).json(hall);
  } catch (error) {
    console.error('Error fetching hall details:', error);
    res.status(500).json({ message: "Error fetching hall details", error: error.message });
  }
};
