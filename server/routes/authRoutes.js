const express = require('express');
const { login, checkAuth, getEnquiries, updateEnquiryStatus, updatePayment, sendPaymentReminder } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.get('/me', checkAuth);
router.get('/enquiries', getEnquiries);
router.patch('/enquiries/:id/status', updateEnquiryStatus);
router.patch('/enquiries/:id/payment', updatePayment);
router.post('/enquiries/:id/remind', sendPaymentReminder);

module.exports = router;
