const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/response');
const { Booking, User } = require('../models');

// @desc    Initiate payment
// @route   POST /api/payment/initiate
// @access  Private
const initiatePayment = asyncHandler(async (req, res) => {
  const { bookingId, paymentMethod } = req.body;

  if (!bookingId || !paymentMethod) {
    return ApiResponse.validationError(res, {
      message: 'Booking ID and payment method are required',
      fields: ['bookingId', 'paymentMethod']
    });
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    userId: req.user._id,
    paymentStatus: 'Pending'
  });

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found or payment already processed');
  }

  // Generate payment ID
  const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Update booking with payment ID
  booking.paymentId = paymentId;
  await booking.save();

  // In a real implementation, you would integrate with actual payment gateways
  // For now, we'll simulate the payment initiation
  const paymentData = {
    paymentId,
    bookingId: booking._id,
    amount: booking.totalPrice,
    currency: 'INR',
    paymentMethod,
    status: 'initiated',
    redirectUrl: paymentMethod === 'card' 
      ? `/payment/card/${paymentId}` 
      : `/payment/upi/${paymentId}`,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  };

  ApiResponse.success(res, paymentData, 'Payment initiated successfully');
});

// @desc    Process card payment
// @route   POST /api/payment/card
// @access  Private
const processCardPayment = asyncHandler(async (req, res) => {
  const {
    paymentId,
    cardNumber,
    expiryMonth,
    expiryYear,
    cvv,
    cardholderName
  } = req.body;

  if (!paymentId || !cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
    return ApiResponse.validationError(res, {
      message: 'All card details are required',
      fields: ['paymentId', 'cardNumber', 'expiryMonth', 'expiryYear', 'cvv', 'cardholderName']
    });
  }

  const booking = await Booking.findOne({
    paymentId,
    userId: req.user._id,
    paymentStatus: 'Pending'
  });

  if (!booking) {
    return ApiResponse.notFound(res, 'Invalid payment ID or booking not found');
  }

  // Simulate card validation (in real implementation, use payment gateway)
  const isValidCard = validateCardDetails(cardNumber, expiryMonth, expiryYear, cvv);
  
  if (!isValidCard) {
    return ApiResponse.error(res, 'Invalid card details', 400);
  }

  // Simulate payment processing
  const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

  if (paymentSuccess) {
    // Update booking status
    booking.paymentStatus = 'Completed';
    booking.status = 'Confirmed';
    await booking.save();

    // Add reward points to user (5% of booking amount)
    const rewardPoints = Math.floor(booking.totalPrice * 0.05);
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { rewardPoints: rewardPoints }
    });

    ApiResponse.success(res, {
      paymentId,
      status: 'success',
      bookingId: booking._id,
      pnr: booking.pnr,
      amount: booking.totalPrice,
      rewardPointsEarned: rewardPoints,
      message: 'Payment successful! Your ticket has been confirmed.'
    }, 'Payment processed successfully');
  } else {
    // Update booking status to failed
    booking.paymentStatus = 'Failed';
    await booking.save();

    ApiResponse.error(res, 'Payment failed. Please try again or use a different payment method.', 400);
  }
});

// @desc    Process UPI payment (placeholder)
// @route   POST /api/payment/upi
// @access  Private
const processUPIPayment = asyncHandler(async (req, res) => {
  // UPI payment is marked as under development
  ApiResponse.error(res, 'UPI payment is currently under development. Please use card payment.', 501);
});

// @desc    Verify payment status
// @route   GET /api/payment/status/:paymentId
// @access  Private
const verifyPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const booking = await Booking.findOne({
    paymentId,
    userId: req.user._id
  });

  if (!booking) {
    return ApiResponse.notFound(res, 'Payment not found');
  }

  const paymentStatus = {
    paymentId,
    bookingId: booking._id,
    pnr: booking.pnr,
    amount: booking.totalPrice,
    status: booking.paymentStatus,
    bookingStatus: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };

  ApiResponse.success(res, paymentStatus, 'Payment status retrieved successfully');
});

// @desc    Get payment history
// @route   GET /api/payment/history
// @access  Private
const getPaymentHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const payments = await Booking.find({
    userId: req.user._id,
    paymentStatus: { $in: ['Completed', 'Failed', 'Refunded'] }
  })
    .select('paymentId pnr totalPrice paymentStatus createdAt trainName trainNumber')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Booking.countDocuments({
    userId: req.user._id,
    paymentStatus: { $in: ['Completed', 'Failed', 'Refunded'] }
  });

  ApiResponse.success(res, {
    payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'Payment history retrieved successfully');
});

// @desc    Process refund
// @route   POST /api/payment/refund
// @access  Private
const processRefund = asyncHandler(async (req, res) => {
  const { bookingId, reason } = req.body;

  const booking = await Booking.findOne({
    _id: bookingId,
    userId: req.user._id,
    paymentStatus: 'Completed'
  });

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found or not eligible for refund');
  }

  if (booking.status === 'Cancelled') {
    return ApiResponse.error(res, 'Booking is already cancelled', 400);
  }

  // Calculate refund amount
  const refundDetails = booking.calculateRefund();

  if (refundDetails.refundAmount === 0) {
    return ApiResponse.error(res, 'No refund available for this booking', 400);
  }

  // Process refund (in real implementation, integrate with payment gateway)
  booking.paymentStatus = 'Refunded';
  booking.status = 'Cancelled';
  booking.cancellationDetails = {
    cancelledAt: new Date(),
    refundAmount: refundDetails.refundAmount,
    cancellationCharges: refundDetails.cancellationCharges,
    reason: reason || 'User requested cancellation'
  };

  await booking.save();

  ApiResponse.success(res, {
    bookingId: booking._id,
    pnr: booking.pnr,
    refundDetails,
    message: 'Refund processed successfully. Amount will be credited to your account within 5-7 business days.'
  }, 'Refund processed successfully');
});

// Helper function to validate card details (basic validation)
const validateCardDetails = (cardNumber, expiryMonth, expiryYear, cvv) => {
  // Remove spaces and validate card number length
  const cleanCardNumber = cardNumber.replace(/\s/g, '');
  if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    return false;
  }

  // Validate expiry date
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const expYear = parseInt(expiryYear);
  const expMonth = parseInt(expiryMonth);

  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return false;
  }

  // Validate CVV
  if (cvv.length < 3 || cvv.length > 4) {
    return false;
  }

  // Basic Luhn algorithm check for card number
  return luhnCheck(cleanCardNumber);
};

// Luhn algorithm for card number validation
const luhnCheck = (cardNumber) => {
  let sum = 0;
  let alternate = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let n = parseInt(cardNumber.charAt(i));

    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }

    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
};

module.exports = {
  initiatePayment,
  processCardPayment,
  processUPIPayment,
  verifyPaymentStatus,
  getPaymentHistory,
  processRefund
};