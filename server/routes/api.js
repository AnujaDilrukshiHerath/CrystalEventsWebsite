const express = require('express');
const router = express.Router();

const { getBranches } = require('../controllers/branchController');
const { getHalls, getHallById } = require('../controllers/hallController');
const { getEvents } = require('../controllers/eventController');
const { getCatering } = require('../controllers/cateringController');
const { submitEnquiry } = require('../controllers/enquiryController');
const { getGallery, getGalleryImageAsset } = require('../controllers/galleryController');

// Branches
router.get('/branches', getBranches);

// Halls
router.get('/halls', getHalls);
router.get('/halls/:id', getHallById);

// Events
router.get('/events', getEvents);

// Catering
router.get('/catering', getCatering);

// Gallery (public - active images only)
router.get('/gallery', getGallery);
router.get('/gallery-images/:id/image', getGalleryImageAsset);

// Enquiries
router.post('/enquiries', submitEnquiry);

module.exports = router;
