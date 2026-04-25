const express = require('express');
const { login, checkAuth, getEnquiries, updateEnquiryStatus, updatePayment, sendPaymentReminder, seedSales, deleteEnquiry } = require('../controllers/authController');
const { getBookings, createBooking, updateBooking, deleteBooking } = require('../controllers/bookingController');

const router = express.Router();

router.post('/login', login);
router.get('/me', checkAuth);
router.get('/enquiries', getEnquiries);
router.patch('/enquiries/:id/status', updateEnquiryStatus);
router.delete('/enquiries/:id', deleteEnquiry);
router.patch('/enquiries/:id/payment', updatePayment);
router.post('/enquiries/:id/remind', sendPaymentReminder);

// Bookings
router.get('/bookings', getBookings);
router.post('/bookings', createBooking);
router.patch('/bookings/:id', updateBooking);
router.delete('/bookings/:id', deleteBooking);

// Emergency Seeding
router.get('/seed-sales', seedSales);


module.exports = router;
