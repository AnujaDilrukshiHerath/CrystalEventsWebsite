const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcrystaleventskey123';
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MEDIA_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

const INTERNAL_CATEGORY_PREFIX = 'Internal: ';
const LEGACY_INTERNAL_CATEGORIES = [
  'Team Showcase',
  'Sales Showcase',
  'Slough Team Showcase',
  'Wembley Team Showcase',
  'Hayes Team Showcase'
];

const isInternalCategory = (category = '') => (
  category.startsWith(INTERNAL_CATEGORY_PREFIX) || LEGACY_INTERNAL_CATEGORIES.includes(category)
);

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

const verifyPortalUser = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const allowed = decoded.role === 'admin' || decoded.role === 'sales' || decoded.role?.startsWith('branch-');
    if (!allowed) {
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

const toDataUrl = (file) => `data:${file.contentType};base64,${file.data.toString('base64')}`;

const mediaMetaFromUrl = (url = '') => {
  const dataMatch = url.match(/^data:([^;]+);base64,/);
  const mimeType = dataMatch?.[1] || '';
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  const isVideo = mimeType.startsWith('video/')
    || cleanUrl.endsWith('.mp4')
    || cleanUrl.endsWith('.webm')
    || cleanUrl.endsWith('.mov')
    || cleanUrl.endsWith('.m4v');

  return {
    mediaType: isVideo ? 'video' : 'image',
    mimeType: mimeType || (isVideo ? 'video/mp4' : 'image/jpeg')
  };
};

const withDisplayUrl = (image) => ({
  ...image,
  url: image.url?.startsWith('data:') ? `/api/gallery-images/${image.id}/image` : image.url,
  ...mediaMetaFromUrl(image.url)
});

const mapDisplayUrls = (images) => images.map(withDisplayUrl);

exports.getGalleryImageAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (!image.url?.startsWith('data:')) {
      return res.redirect(image.url);
    }

    const match = image.url.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ message: 'Invalid stored image' });
    }

    res.setHeader('Content-Type', match[1]);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    const mediaBuffer = Buffer.from(match[2], 'base64');
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : mediaBuffer.length - 1;
      const safeEnd = Math.min(end, mediaBuffer.length - 1);

      if (Number.isNaN(start) || start >= mediaBuffer.length) {
        res.setHeader('Content-Range', `bytes */${mediaBuffer.length}`);
        return res.status(416).end();
      }

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${safeEnd}/${mediaBuffer.length}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', safeEnd - start + 1);
      return res.send(mediaBuffer.subarray(start, safeEnd + 1));
    }

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', mediaBuffer.length);
    res.send(mediaBuffer);
  } catch (error) {
    console.error('Error serving gallery image:', error);
    res.status(500).json({ message: 'Error serving gallery image' });
  }
};

// Public: Get all active gallery images (for the website)
exports.getGallery = async (req, res) => {
  try {
    let images = await prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' }
    });
    images = images.filter((image) => !isInternalCategory(image.category));
    if (req.query.category) {
      images = images.filter((image) => image.category === req.query.category);
    }
    if (req.query.type === 'decorations') {
      images = images.filter((image) => image.category.toLowerCase().includes('decoration'));
    }
    // Map to match existing frontend format: { id, url, title, category }
    res.status(200).json(mapDisplayUrls(images));
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Error fetching gallery', error: error.message });
  }
};

// Protected: Get internal-only images for sales and branch portals
exports.getTeamGallery = async (req, res) => {
  try {
    const user = verifyPortalUser(req, res);
    if (!user) return;

    const images = await prisma.galleryImage.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    res.status(200).json(mapDisplayUrls(images.filter((image) => isInternalCategory(image.category))));
  } catch (error) {
    console.error('Error fetching team gallery:', error);
    res.status(500).json({ message: 'Error fetching team gallery' });
  }
};

// Admin: Get ALL gallery images (including inactive)
exports.getAdminGallery = async (req, res) => {
  try {
    if (!verifyAdmin(req, res)) return;

    const images = await prisma.galleryImage.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.status(200).json(mapDisplayUrls(images));
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
        active: isInternalCategory(category) ? false : normalizeBoolean(active)
      }
    });

    res.status(201).json(withDisplayUrl(image));
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
    const active = isInternalCategory(category) ? false : normalizeBoolean(fields.active);

    if (!category || files.length === 0) {
      return res.status(400).json({ message: 'Category and at least one image file are required' });
    }

    const createdImages = [];
    for (const [index, file] of files.entries()) {
      if (!MEDIA_TYPES.includes(file.contentType)) {
        return res.status(400).json({ message: 'Only JPG, PNG, WebP, GIF, MP4, WebM, and MOV files are supported' });
      }

      const imageTitle = files.length === 1 && fields.title ? fields.title : titleFromFilename(file.filename);

      const image = await prisma.galleryImage.create({
        data: {
          url: toDataUrl(file),
          title: imageTitle,
          category,
          sortOrder: sortOrder + index,
          active
        }
      });

      createdImages.push(image);
    }

    const responseImages = mapDisplayUrls(createdImages);
    res.status(201).json(responseImages.length === 1 ? responseImages[0] : responseImages);
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
    if (category !== undefined && isInternalCategory(category)) updateData.active = false;

    const image = await prisma.galleryImage.update({
      where: { id },
      data: updateData
    });

    res.status(200).json(withDisplayUrl(image));
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
