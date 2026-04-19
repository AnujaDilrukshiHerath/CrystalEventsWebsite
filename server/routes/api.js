const express = require('express');
const router = express.Router();

const { getBranches } = require('../controllers/branchController');
const { getHalls, getHallById } = require('../controllers/hallController');
const { getEvents } = require('../controllers/eventController');
const { getCatering } = require('../controllers/cateringController');
const { submitEnquiry } = require('../controllers/enquiryController');

// Branches
router.get('/branches', getBranches);

// Halls
router.get('/halls', getHalls);
router.get('/halls/:id', getHallById);

// Events
router.get('/events', getEvents);

// Catering
router.get('/catering', getCatering);

// Enquiries
router.post('/enquiries', submitEnquiry);

module.exports = router;
