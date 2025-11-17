const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/response');
const { User } = require('../models');
const { setCache, getCache, deleteCache } = require('../config/redis');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Validation
  if (!name || !email || !phone || !password) {
    return ApiResponse.validationError(res, {
      message: 'Please provide all required fields',
      fields: ['name', 'email', 'phone', 'password']
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'phone';
    return ApiResponse.error(res, `User with this ${field} already exists`, 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password
  });

  // Generate JWT token
  const token = user.getSignedJwtToken();

  // Cache user data
  await setCache(`user:${user._id}`, user.profile, 3600); // 1 hour

  ApiResponse.success(res, {
    token,
    user: user.profile
  }, 'User registered successfully', 201);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return ApiResponse.validationError(res, {
      message: 'Please provide email and password',
      fields: ['email', 'password']
    });
  }

  // Check for user (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return ApiResponse.unauthorized(res, 'Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    return ApiResponse.unauthorized(res, 'Account is deactivated. Please contact support.');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return ApiResponse.unauthorized(res, 'Invalid credentials');
  }

  // Update last login
  await user.updateLastLogin();

  // Generate JWT token
  const token = user.getSignedJwtToken();

  // Cache user data
  await setCache(`user:${user._id}`, user.profile, 3600); // 1 hour

  ApiResponse.success(res, {
    token,
    user: user.profile
  }, 'Login successful');
});

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  // Check cache first
  let userData = await getCache(`user:${req.user._id}`);
  
  if (!userData) {
    // If not in cache, get from database
    const user = await User.findById(req.user._id).populate('upcomingJourneys');
    userData = user.profile;
    
    // Cache for future requests
    await setCache(`user:${user._id}`, userData, 3600);
  }

  ApiResponse.success(res, userData, 'Profile retrieved successfully');
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {};
  const allowedFields = ['name', 'phone', 'preferences'];

  // Only update allowed fields
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  // Don't allow email updates through this endpoint for security
  if (req.body.email) {
    return ApiResponse.error(res, 'Email cannot be updated through this endpoint', 400);
  }

  if (Object.keys(fieldsToUpdate).length === 0) {
    return ApiResponse.error(res, 'No valid fields provided for update', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  // Update cache
  await setCache(`user:${user._id}`, user.profile, 3600);

  ApiResponse.success(res, user.profile, 'Profile updated successfully');
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return ApiResponse.validationError(res, {
      message: 'Please provide current password and new password',
      fields: ['currentPassword', 'newPassword']
    });
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return ApiResponse.unauthorized(res, 'Current password is incorrect');
  }

  // Validate new password
  if (newPassword.length < 6) {
    return ApiResponse.validationError(res, {
      message: 'New password must be at least 6 characters',
      fields: ['newPassword']
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Clear user cache to force refresh
  await deleteCache(`user:${user._id}`);

  ApiResponse.success(res, null, 'Password changed successfully');
});

// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // Clear user cache
  await deleteCache(`user:${req.user._id}`);

  // In a more sophisticated setup, you might want to blacklist the token
  // For now, we'll just send a success response
  // The client should remove the token from storage

  ApiResponse.success(res, null, 'Logged out successfully');
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return ApiResponse.validationError(res, {
      message: 'Please provide email address',
      fields: ['email']
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return ApiResponse.error(res, 'User not found with this email', 404);
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  // In a real application, you would send an email with the reset token
  // For now, we'll just return a success message
  console.log(`Password reset token for ${email}: ${resetToken}`);

  ApiResponse.success(res, {
    message: 'Password reset instructions sent to email',
    // In development, include the token for testing
    ...(process.env.NODE_ENV === 'development' && { resetToken })
  }, 'Reset token generated successfully');
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const resetToken = req.params.resettoken;

  if (!newPassword) {
    return ApiResponse.validationError(res, {
      message: 'Please provide new password',
      fields: ['newPassword']
    });
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return ApiResponse.error(res, 'Invalid or expired reset token', 400);
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Generate new JWT token
  const token = user.getSignedJwtToken();

  ApiResponse.success(res, {
    token,
    user: user.profile
  }, 'Password reset successful');
});

// @desc    Get user statistics
// @route   GET /api/auth/stats
// @access  Private
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // This could be cached for better performance
  const stats = await Promise.all([
    // Get total bookings
    require('../models').Booking.countDocuments({ userId }),
    // Get upcoming bookings
    require('../models').Booking.countDocuments({
      userId,
      journeyDate: { $gte: new Date() },
      status: { $in: ['Confirmed', 'RAC'] }
    }),
    // Get total spent (sum of completed bookings)
    require('../models').Booking.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId(userId),
          paymentStatus: 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalPrice' }
        }
      }
    ])
  ]);

  const userStats = {
    totalBookings: stats[0],
    upcomingBookings: stats[1],
    totalSpent: stats[2][0]?.totalSpent || 0,
    rewardPoints: req.user.rewardPoints,
    memberSince: req.user.createdAt
  };

  ApiResponse.success(res, userStats, 'User statistics retrieved successfully');
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  getUserStats
};