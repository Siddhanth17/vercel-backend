const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    match: [
      /^[6-9]\d{9}$/,
      'Please provide a valid Indian phone number'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  rewardPoints: {
    type: Number,
    default: 0,
    min: [0, 'Reward points cannot be negative']
  },
  upcomingJourneys: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Booking'
  }],
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'or', 'pa']
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    accessibility: {
      voiceAssistant: { type: Boolean, default: false },
      largeText: { type: Boolean, default: false },
      highContrast: { type: Boolean, default: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for email and phone for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });

// Virtual for user's full profile
UserSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    rewardPoints: this.rewardPoints,
    preferences: this.preferences,
    upcomingJourneys: this.upcomingJourneys,
    createdAt: this.createdAt
  };
});

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      name: this.name
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add reward points
UserSchema.methods.addRewardPoints = async function(points, reason = 'General') {
  this.rewardPoints += points;
  await this.save();
  
  // Log the reward transaction (could be expanded to a separate model)
  console.log(`Added ${points} reward points to user ${this.email} for: ${reason}`);
  
  return this.rewardPoints;
};

// Deduct reward points
UserSchema.methods.deductRewardPoints = async function(points, reason = 'Redemption') {
  if (this.rewardPoints < points) {
    throw new Error('Insufficient reward points');
  }
  
  this.rewardPoints -= points;
  await this.save();
  
  console.log(`Deducted ${points} reward points from user ${this.email} for: ${reason}`);
  
  return this.rewardPoints;
};

// Update last login
UserSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

module.exports = mongoose.model('User', UserSchema);