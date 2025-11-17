const express = require('express');
const {
  createBooking,
  getUserBookings,
  getBookingByPNR,
  getBookingById,
  cancelBooking,
  getUpcomingBookings,
  getBookingHistory,
  updateBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/pnr/:pnr', getBookingByPNR);

// Protected routes
router.use(protect);

router.post('/create', createBooking);
router.get('/user', getUserBookings);
router.get('/upcoming', getUpcomingBookings);
router.get('/history', getBookingHistory);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.put('/:id/cancel', cancelBooking);

module.exports = router;