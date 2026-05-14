const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcrystaleventskey123';

// Public: Get all active gallery images (for the website)
exports.getGallery = async (req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' }
    });
    // Map to match existing frontend format: { id, url, title, category }
    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Error fetching gallery', error: error.message });
  }
};

// Admin: Get ALL gallery images (including inactive)
exports.getAdminGallery = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const images = await prisma.galleryImage.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching admin gallery:', error);
    res.status(500).json({ message: 'Error fetching gallery' });
  }
};

// Admin: Create a new gallery image
exports.createGalleryImage = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { url, title, category, sortOrder, active } = req.body;

    if (!url || !title || !category) {
      return res.status(400).json({ message: 'URL, title, and category are required' });
    }

    const image = await prisma.galleryImage.create({
      data: {
        url,
        title,
        category,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        active: active !== undefined ? active : true
      }
    });

    res.status(201).json(image);
  } catch (error) {
    console.error('Error creating gallery image:', error);
    res.status(500).json({ message: 'Error creating gallery image' });
  }
};

// Admin: Update an existing gallery image
exports.updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { url, title, category, sortOrder, active } = req.body;

    const updateData = {};
    if (url !== undefined) updateData.url = url;
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (active !== undefined) updateData.active = active;

    const image = await prisma.galleryImage.update({
      where: { id },
      data: updateData
    });

    res.status(200).json(image);
  } catch (error) {
    console.error('Error updating gallery image:', error);
    res.status(500).json({ message: 'Error updating gallery image' });
  }
};

// Admin: Delete a gallery image
exports.deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    await prisma.galleryImage.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Gallery image deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({ message: 'Error deleting gallery image' });
  }
};
