const galleryData = require('../data/gallery');

exports.getGallery = (req, res) => {
  res.status(200).json(galleryData);
};
