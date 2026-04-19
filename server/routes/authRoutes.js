const express = require('express');
const { login, checkAuth, getEnquiries, updateEnquiryStatus } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.get('/me', checkAuth);
router.get('/enquiries', getEnquiries);
router.patch('/enquiries/:id/status', updateEnquiryStatus);

module.exports = router;
