const express = require('express');
const {
  initiatePayment,
  processCardPayment,
  processUPIPayment,
  verifyPaymentStatus,
  getPaymentHistory,
  processRefund
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All payment routes require authentication
router.use(protect);

router.post('/initiate', initiatePayment);
router.post('/card', processCardPayment);
router.post('/upi', processUPIPayment);
router.post('/refund', processRefund);
router.get('/history', getPaymentHistory);
router.get('/status/:paymentId', verifyPaymentStatus);

module.exports = router;