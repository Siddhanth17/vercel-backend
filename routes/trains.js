const express = require('express');
const {
  searchTrains,
  getTrainById,
  getStations,
  getPopularRoutes,
  getTrainSchedule,
  checkSeatAvailability
} = require('../controllers/trainController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/search', searchTrains);
router.get('/stations', getStations);
router.get('/popular-routes', getPopularRoutes);
router.get('/:id', getTrainById);
router.get('/:id/schedule', getTrainSchedule);
router.get('/:id/availability', checkSeatAvailability);

module.exports = router;