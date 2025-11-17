const express = require('express');
const {
  getSeatNavigation,
  getAvailableCabs,
  bookCab,
  getAvailablePorters,
  bookPorter,
  getFoodMenu,
  orderFood,
  verifyCleanliness,
  getRewardPoints
} = require('../controllers/servicesController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Seat Navigation
router.get('/navigation/seat', getSeatNavigation);

// Cab Services
router.get('/cab/available', getAvailableCabs);
router.post('/cab/book', protect, bookCab);

// Porter Services
router.get('/porter/available', getAvailablePorters);
router.post('/porter/book', protect, bookPorter);

// Food Services
router.get('/food/menu', getFoodMenu);
router.post('/food/order', protect, orderFood);

// Cleanliness & Rewards
router.post('/cleanliness/verify', protect, verifyCleanliness);
router.get('/rewards/points', protect, getRewardPoints);

module.exports = router;