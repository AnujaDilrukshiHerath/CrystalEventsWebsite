const express = require('express');
const { login, checkAuth, getEnquiries, updateEnquiryStatus, updatePayment, sendPaymentReminder, seedSales, deleteEnquiry, getBranchEnquiries, updateBranchEnquiryStatus } = require('../controllers/authController');
const { getBookings, createBooking, updateBooking, deleteBooking, addPayment, deletePayment } = require('../controllers/bookingController');
const { getAdminGallery, createGalleryImage, updateGalleryImage, deleteGalleryImage } = require('../controllers/galleryController');

const router = express.Router();

router.post('/login', login);
router.get('/me', checkAuth);
router.get('/enquiries', getEnquiries);
router.patch('/enquiries/:id/status', updateEnquiryStatus);
router.delete('/enquiries/:id', deleteEnquiry);
router.patch('/enquiries/:id/payment', updatePayment);
router.post('/enquiries/:id/remind', sendPaymentReminder);

// Branch portal routes (slough / wembley)
router.get('/branch/enquiries', getBranchEnquiries);
router.patch('/branch/enquiries/:id/status', updateBranchEnquiryStatus);

// Bookings
router.get('/bookings', getBookings);
router.post('/bookings', createBooking);
router.patch('/bookings/:id', updateBooking);
router.post('/bookings/:id/payments', addPayment);
router.delete('/payments/:id', deletePayment);
router.delete('/bookings/:id', deleteBooking);

// Gallery Image Management
router.get('/gallery', getAdminGallery);
router.post('/gallery', createGalleryImage);
router.patch('/gallery/:id', updateGalleryImage);
router.delete('/gallery/:id', deleteGalleryImage);

// Emergency Seeding
router.get('/seed-sales', seedSales);


module.exports = router;
