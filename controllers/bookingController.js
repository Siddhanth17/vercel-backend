const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/response');
const { Booking, Train, User } = require('../models');
const { validate, bookingSchema } = require('../utils/validation');

// @desc    Create new booking
// @route   POST /api/bookings/create
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  // Validate request body
  const { error } = bookingSchema.validate(req.body);
  if (error) {
    return ApiResponse.validationError(res, error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    })));
  }

  const {
    trainId,
    from,
    to,
    journeyDate,
    passengers,
    class: selectedClass,
    contactDetails
  } = req.body;

  // Get train details
  const train = await Train.findById(trainId);
  if (!train) {
    return ApiResponse.notFound(res, 'Train not found');
  }

  // Check if train runs on the journey date
  const dayName = new Date(journeyDate).toLocaleDateString('en-US', { weekday: 'long' });
  if (!train.runsOnDay(dayName)) {
    return ApiResponse.error(res, `Train does not run on ${dayName}`, 400);
  }

  // Check seat availability
  const classInfo = train.classes.find(cls => cls.type === selectedClass.type);
  if (!classInfo) {
    return ApiResponse.error(res, 'Selected class not available on this train', 400);
  }

  if (classInfo.availableSeats < passengers.length) {
    return ApiResponse.error(res, 'Insufficient seats available', 400);
  }

  // Calculate price
  let totalPrice;
  try {
    const pricePerPassenger = train.getPriceBetweenStations(from.stationCode, to.stationCode, selectedClass.type);
    const basePrice = pricePerPassenger * passengers.length;
    const taxes = Math.round(basePrice * 0.05); // 5% tax
    const convenienceFee = 20; // Fixed convenience fee
    
    totalPrice = basePrice + taxes + convenienceFee;
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }

  // Get station details from train route
  const fromStation = train.route.find(station => station.stationCode === from.stationCode);
  const toStation = train.route.find(station => station.stationCode === to.stationCode);

  if (!fromStation || !toStation) {
    return ApiResponse.error(res, 'Invalid station codes for this train', 400);
  }

  // Create booking
  const bookingData = {
    userId: req.user._id,
    trainId: train._id,
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    from: {
      stationCode: fromStation.stationCode,
      stationName: fromStation.stationName,
      departureTime: fromStation.departureTime,
      platform: fromStation.platform
    },
    to: {
      stationCode: toStation.stationCode,
      stationName: toStation.stationName,
      arrivalTime: toStation.arrivalTime,
      platform: toStation.platform
    },
    journeyDate: new Date(journeyDate),
    passengers: passengers.map(passenger => ({
      ...passenger,
      seatNumber: '', // Will be assigned later
      coachNumber: '' // Will be assigned later
    })),
    class: selectedClass,
    totalPrice,
    priceBreakdown: {
      basePrice: totalPrice - Math.round(totalPrice * 0.05) - 20,
      taxes: Math.round(totalPrice * 0.05),
      convenienceFee: 20,
      discount: 0
    },
    contactDetails,
    paymentStatus: 'Pending'
  };

  const booking = await Booking.create(bookingData);

  // Update seat availability
  await train.updateSeatAvailability(selectedClass.type, passengers.length);

  // Add booking to user's upcoming journeys
  await User.findByIdAndUpdate(req.user._id, {
    $push: { upcomingJourneys: booking._id }
  });

  ApiResponse.success(res, {
    booking: booking.summary,
    pnr: booking.pnr,
    totalPrice: booking.totalPrice,
    paymentRequired: true
  }, 'Booking created successfully', 201);
});

// @desc    Get user bookings
// @route   GET /api/bookings/user
// @access  Private
const getUserBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const query = { userId: req.user._id, isActive: true };
  if (status) {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('trainId', 'trainName trainNumber');

  const total = await Booking.countDocuments(query);

  ApiResponse.success(res, {
    bookings: bookings.map(booking => booking.summary),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'User bookings retrieved successfully');
});

// @desc    Get booking by PNR
// @route   GET /api/bookings/pnr/:pnr
// @access  Public
const getBookingByPNR = asyncHandler(async (req, res) => {
  const { pnr } = req.params;

  const booking = await Booking.findOne({ pnr, isActive: true })
    .populate('trainId', 'trainName trainNumber route');

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found with this PNR');
  }

  ApiResponse.success(res, booking, 'Booking details retrieved successfully');
});

// @desc    Get booking details
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    userId: req.user._id,
    isActive: true
  }).populate('trainId', 'trainName trainNumber route');

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found');
  }

  ApiResponse.success(res, booking, 'Booking details retrieved successfully');
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const booking = await Booking.findOne({
    _id: req.params.id,
    userId: req.user._id,
    isActive: true
  });

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found');
  }

  if (booking.status === 'Cancelled') {
    return ApiResponse.error(res, 'Booking is already cancelled', 400);
  }

  if (booking.paymentStatus !== 'Completed') {
    return ApiResponse.error(res, 'Cannot cancel booking with pending payment', 400);
  }

  // Calculate refund
  const refundDetails = await booking.cancelBooking(reason);

  // Update train seat availability
  const train = await Train.findById(booking.trainId);
  if (train) {
    const classInfo = train.classes.find(cls => cls.type === booking.class.type);
    if (classInfo) {
      classInfo.availableSeats += booking.passengers.length;
      await train.save();
    }
  }

  ApiResponse.success(res, {
    booking: booking.summary,
    refundDetails
  }, 'Booking cancelled successfully');
});

// @desc    Get upcoming bookings
// @route   GET /api/bookings/upcoming
// @access  Private
const getUpcomingBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.getUpcomingBookings(req.user._id);

  ApiResponse.success(res, {
    bookings: bookings.map(booking => booking.summary),
    count: bookings.length
  }, 'Upcoming bookings retrieved successfully');
});

// @desc    Get booking history
// @route   GET /api/bookings/history
// @access  Private
const getBookingHistory = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const bookings = await Booking.getBookingHistory(req.user._id, parseInt(limit));

  ApiResponse.success(res, {
    bookings: bookings.map(booking => booking.summary),
    count: bookings.length
  }, 'Booking history retrieved successfully');
});

// @desc    Update booking (for modifications)
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    userId: req.user._id,
    isActive: true
  });

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found');
  }

  if (booking.status === 'Cancelled') {
    return ApiResponse.error(res, 'Cannot modify cancelled booking', 400);
  }

  // Only allow certain fields to be updated
  const allowedUpdates = ['contactDetails', 'specialRequests'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return ApiResponse.error(res, 'No valid fields provided for update', 400);
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  ApiResponse.success(res, updatedBooking.summary, 'Booking updated successfully');
});

module.exports = {
  createBooking,
  getUserBookings,
  getBookingByPNR,
  getBookingById,
  cancelBooking,
  getUpcomingBookings,
  getBookingHistory,
  updateBooking
};