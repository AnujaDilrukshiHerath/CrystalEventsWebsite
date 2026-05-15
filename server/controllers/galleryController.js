const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcrystaleventskey123';
const UPLOAD_DIR = path.join(__dirname, '../public/uploads/gallery');
const WATERMARK_DIR = path.join(__dirname, '../public/uploads/watermarks');
const WATERMARK_SOURCE = path.join(__dirname, '../../client/public/crystalLogo.jpeg');
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

const verifyAdmin = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden' });
      return null;
    }
    return decoded;
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
};

const readRequestBuffer = async (req) => {
  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_UPLOAD_BYTES) {
      const error = new Error('Upload is too large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

const parseMultipart = (buffer, boundary) => {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const headerSeparator = Buffer.from('\r\n\r\n');
  const parts = [];
  let position = buffer.indexOf(boundaryBuffer);

  while (position !== -1) {
    position += boundaryBuffer.length;
    if (buffer[position] === 45 && buffer[position + 1] === 45) break;
    if (buffer[position] === 13 && buffer[position + 1] === 10) position += 2;

    const headerEnd = buffer.indexOf(headerSeparator, position);
    if (headerEnd === -1) break;

    const headers = buffer.slice(position, headerEnd).toString('utf8');
    const dataStart = headerEnd + headerSeparator.length;
    const nextBoundary = buffer.indexOf(Buffer.from(`\r\n--${boundary}`), dataStart);
    if (nextBoundary === -1) break;

    const disposition = headers.match(/content-disposition:\s*form-data;\s*([^\r\n]+)/i);
    const name = disposition?.[1].match(/name="([^"]+)"/)?.[1];
    const filename = disposition?.[1].match(/filename="([^"]*)"/)?.[1];
    const contentType = headers.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim();

    if (name) {
      parts.push({
        name,
        filename,
        contentType,
        data: buffer.slice(dataStart, nextBoundary)
      });
    }

    position = nextBoundary + 2;
    position = buffer.indexOf(boundaryBuffer, position);
  }

  return parts;
};

const parseMultipartForm = async (req) => {
  const contentType = req.headers['content-type'] || '';
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[1] || contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[2];
  if (!boundary) {
    const error = new Error('Missing multipart boundary');
    error.statusCode = 400;
    throw error;
  }

  const buffer = await readRequestBuffer(req);
  const parts = parseMultipart(buffer, boundary);
  const fields = {};
  const files = [];

  parts.forEach((part) => {
    if (part.filename) {
      files.push(part);
    } else {
      fields[part.name] = part.data.toString('utf8');
    }
  });

  return { fields, files };
};

const normalizeBoolean = (value, fallback = true) => {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === 'on' || value === '1';
};

const titleFromFilename = (filename) => {
  const base = path.basename(filename || 'Gallery Image', path.extname(filename || ''));
  return base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Gallery Image';
};

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const getImageDimensions = (buffer, contentType) => {
  if (contentType === 'image/png' && buffer.toString('ascii', 1, 4) === 'PNG') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (contentType === 'image/gif') {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }

  if (contentType === 'image/webp' && buffer.toString('ascii', 0, 4) === 'RIFF') {
    const format = buffer.toString('ascii', 12, 16);
    if (format === 'VP8X') {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3)
      };
    }
    if (format === 'VP8 ') {
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (format === 'VP8L') {
      const bits = buffer.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }

  if (contentType === 'image/jpeg') {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return {
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5)
        };
      }
      offset += 2 + length;
    }
  }

  return { width: 1200, height: 800 };
};

const ensureWatermarkLogo = async () => {
  await fs.mkdir(WATERMARK_DIR, { recursive: true });
  const destination = path.join(WATERMARK_DIR, 'crystalLogo.jpeg');
  const logoBuffer = await fs.readFile(WATERMARK_SOURCE);
  await fs.writeFile(destination, logoBuffer);
  return logoBuffer;
};

const createDataUri = (buffer, contentType) => `data:${contentType};base64,${buffer.toString('base64')}`;

const createWatermarkedSvg = ({ width, height, imageDataUri, watermarkDataUri, title }) => {
  const watermarkWidth = Math.max(Math.min(Math.round(width * 0.24), 340), 150);
  const padding = Math.max(Math.round(width * 0.035), 24);
  const watermarkHeight = Math.round(watermarkWidth * 0.55);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">
  <image href="${imageDataUri}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>
  <rect x="${width - watermarkWidth - padding - 12}" y="${height - watermarkHeight - padding - 12}" width="${watermarkWidth + 24}" height="${watermarkHeight + 24}" rx="10" fill="#000000" fill-opacity="0.34"/>
  <image href="${watermarkDataUri}" x="${width - watermarkWidth - padding}" y="${height - watermarkHeight - padding}" width="${watermarkWidth}" height="${watermarkHeight}" preserveAspectRatio="xMidYMid meet" opacity="0.82"/>
</svg>`;
};

// Public: Get all active gallery images (for the website)
exports.getGallery = async (req, res) => {
  try {
    let images = await prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' }
    });
    if (req.query.category) {
      images = images.filter((image) => image.category === req.query.category);
    }
    if (req.query.type === 'decorations') {
      images = images.filter((image) => image.category.toLowerCase().includes('decoration'));
    }
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
    if (!verifyAdmin(req, res)) return;

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
    if (!verifyAdmin(req, res)) return;

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
        active: normalizeBoolean(active)
      }
    });

    res.status(201).json(image);
  } catch (error) {
    console.error('Error creating gallery image:', error);
    res.status(500).json({ message: 'Error creating gallery image' });
  }
};

// Admin: Upload one or more gallery images from the admin panel
exports.uploadGalleryImages = async (req, res) => {
  try {
    if (!verifyAdmin(req, res)) return;

    const { fields, files } = await parseMultipartForm(req);
    const category = fields.customCategory || fields.category;
    const sortOrder = parseInt(fields.sortOrder || '0');
    const active = normalizeBoolean(fields.active);

    if (!category || files.length === 0) {
      return res.status(400).json({ message: 'Category and at least one image file are required' });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const watermarkLogo = await ensureWatermarkLogo();
    const watermarkDataUri = createDataUri(watermarkLogo, 'image/jpeg');

    const createdImages = [];
    for (const [index, file] of files.entries()) {
      if (!IMAGE_TYPES[file.contentType]) {
        return res.status(400).json({ message: 'Only JPG, PNG, WebP, and GIF images are supported' });
      }

      const extension = IMAGE_TYPES[file.contentType];
      const safeName = titleFromFilename(file.filename).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const uploadId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeName}`;
      const originalFilename = `${uploadId}.${extension}`;
      const watermarkedFilename = `${uploadId}-watermarked.svg`;
      const watermarkedUrl = `/uploads/gallery/${watermarkedFilename}`;
      const imageTitle = files.length === 1 && fields.title ? fields.title : titleFromFilename(file.filename);
      const dimensions = getImageDimensions(file.data, file.contentType);

      await fs.writeFile(path.join(UPLOAD_DIR, originalFilename), file.data);
      await fs.writeFile(
        path.join(UPLOAD_DIR, watermarkedFilename),
        createWatermarkedSvg({
          ...dimensions,
          imageDataUri: createDataUri(file.data, file.contentType),
          watermarkDataUri,
          title: imageTitle
        })
      );

      const image = await prisma.galleryImage.create({
        data: {
          url: watermarkedUrl,
          title: imageTitle,
          category,
          sortOrder: sortOrder + index,
          active
        }
      });

      createdImages.push(image);
    }

    res.status(201).json(createdImages.length === 1 ? createdImages[0] : createdImages);
  } catch (error) {
    console.error('Error uploading gallery images:', error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error uploading gallery images' });
  }
};

// Admin: Update an existing gallery image
exports.updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!verifyAdmin(req, res)) return;

    const { url, title, category, sortOrder, active } = req.body;

    const updateData = {};
    if (url !== undefined) updateData.url = url;
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (active !== undefined) updateData.active = normalizeBoolean(active);

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
    if (!verifyAdmin(req, res)) return;

    await prisma.galleryImage.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Gallery image deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({ message: 'Error deleting gallery image' });
  }
};
