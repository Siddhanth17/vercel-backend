const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  },
  trainId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Train',
    required: [true, 'Booking must have a train']
  },
  trainNumber: {
    type: String,
    required: [true, 'Train number is required']
  },
  trainName: {
    type: String,
    required: [true, 'Train name is required']
  },
  pnr: {
    type: String,
    unique: true,
    required: [true, 'PNR is required'],
    match: [/^[A-Z0-9]{10}$/, 'PNR must be 10 characters alphanumeric']
  },
  from: {
    stationCode: {
      type: String,
      required: true,
      uppercase: true
    },
    stationName: {
      type: String,
      required: true
    },
    departureTime: {
      type: String,
      required: true
    },
    platform: String
  },
  to: {
    stationCode: {
      type: String,
      required: true,
      uppercase: true
    },
    stationName: {
      type: String,
      required: true
    },
    arrivalTime: {
      type: String,
      required: true
    },
    platform: String
  },
  journeyDate: {
    type: Date,
    required: [true, 'Journey date is required'],
    validate: {
      validator: function(date) {
        return date >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Journey date cannot be in the past'
    }
  },
  passengers: [{
    name: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true,
      maxlength: [50, 'Passenger name cannot exceed 50 characters']
    },
    age: {
      type: Number,
      required: [true, 'Passenger age is required'],
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      required: [true, 'Passenger gender is required'],
      enum: ['Male', 'Female', 'Other']
    },
    seatNumber: {
      type: String,
      trim: true
    },
    coachNumber: {
      type: String,
      trim: true
    },
    berthPreference: {
      type: String,
      enum: ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'No Preference'],
      default: 'No Preference'
    }
  }],
  class: {
    type: {
      type: String,
      required: true,
      enum: ['1A', '2A', '3A', 'CC', 'SL', '2S', 'GEN']
    },
    name: {
      type: String,
      required: true,
      enum: ['First AC', 'Second AC', 'Third AC', 'Chair Car', 'Sleeper', 'Second Sitting', 'General']
    }
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  priceBreakdown: {
    basePrice: Number,
    taxes: Number,
    convenienceFee: Number,
    discount: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['Confirmed', 'RAC', 'Waiting List', 'Cancelled', 'Chart Prepared'],
    default: 'Confirmed'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentId: {
    type: String
  },
  cancellationDetails: {
    cancelledAt: Date,
    refundAmount: Number,
    cancellationCharges: Number,
    reason: String
  },
  additionalServices: {
    cabBooking: {
      pickup: {
        booked: { type: Boolean, default: false },
        serviceId: String,
        amount: Number
      },
      drop: {
        booked: { type: Boolean, default: false },
        serviceId: String,
        amount: Number
      }
    },
    porter: {
      booked: { type: Boolean, default: false },
      porterId: String,
      amount: Number
    },
    food: [{
      itemId: String,
      itemName: String,
      quantity: Number,
      price: Number,
      deliveryStatus: {
        type: String,
        enum: ['Ordered', 'Preparing', 'Delivered', 'Cancelled'],
        default: 'Ordered'
      }
    }]
  },
  specialRequests: {
    wheelchairAssistance: { type: Boolean, default: false },
    mealPreference: {
      type: String,
      enum: ['Vegetarian', 'Non-Vegetarian', 'Jain', 'Vegan', 'None'],
      default: 'None'
    },
    berthPreference: String,
    otherRequests: String
  },
  contactDetails: {
    email: {
      type: String,
      required: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid phone number']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better query performance
BookingSchema.index({ userId: 1 });
BookingSchema.index({ pnr: 1 });
BookingSchema.index({ trainNumber: 1 });
BookingSchema.index({ journeyDate: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ paymentStatus: 1 });

// Virtual for journey duration
BookingSchema.virtual('journeyDuration').get(function() {
  // This would need to be calculated based on train schedule
  // For now, returning a placeholder
  return 'Duration calculated from train schedule';
});

// Virtual for total passengers
BookingSchema.virtual('totalPassengers').get(function() {
  return this.passengers.length;
});

// Virtual for booking summary
BookingSchema.virtual('summary').get(function() {
  return {
    pnr: this.pnr,
    trainNumber: this.trainNumber,
    trainName: this.trainName,
    from: `${this.from.stationName} (${this.from.stationCode})`,
    to: `${this.to.stationName} (${this.to.stationCode})`,
    journeyDate: this.journeyDate,
    class: this.class.name,
    passengers: this.passengers.length,
    status: this.status,
    totalPrice: this.totalPrice
  };
});

// Pre-save middleware to generate PNR if not provided
BookingSchema.pre('save', async function(next) {
  if (!this.pnr) {
    this.pnr = await this.constructor.generatePNR();
  }
  next();
});

// Static method to generate unique PNR
BookingSchema.statics.generatePNR = async function() {
  let pnr;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate 10-character alphanumeric PNR
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    pnr = '';
    for (let i = 0; i < 10; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if PNR already exists
    const existingBooking = await this.findOne({ pnr });
    if (!existingBooking) {
      isUnique = true;
    }
  }
  
  return pnr;
};

// Method to calculate refund amount
BookingSchema.methods.calculateRefund = function() {
  const now = new Date();
  const journeyDate = new Date(this.journeyDate);
  const hoursUntilJourney = (journeyDate - now) / (1000 * 60 * 60);
  
  let refundPercentage = 0;
  
  if (hoursUntilJourney > 48) {
    refundPercentage = 0.9; // 90% refund
  } else if (hoursUntilJourney > 12) {
    refundPercentage = 0.75; // 75% refund
  } else if (hoursUntilJourney > 4) {
    refundPercentage = 0.5; // 50% refund
  } else {
    refundPercentage = 0; // No refund
  }
  
  const refundAmount = this.totalPrice * refundPercentage;
  const cancellationCharges = this.totalPrice - refundAmount;
  
  return {
    refundAmount: Math.round(refundAmount),
    cancellationCharges: Math.round(cancellationCharges),
    refundPercentage: refundPercentage * 100
  };
};

// Method to cancel booking
BookingSchema.methods.cancelBooking = async function(reason = 'User requested') {
  const refundDetails = this.calculateRefund();
  
  this.status = 'Cancelled';
  this.cancellationDetails = {
    cancelledAt: new Date(),
    refundAmount: refundDetails.refundAmount,
    cancellationCharges: refundDetails.cancellationCharges,
    reason
  };
  
  await this.save();
  return refundDetails;
};

// Static method to get user's upcoming bookings
BookingSchema.statics.getUpcomingBookings = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return await this.find({
    userId,
    journeyDate: { $gte: today },
    status: { $in: ['Confirmed', 'RAC'] },
    isActive: true
  }).sort({ journeyDate: 1 });
};

// Static method to get booking history
BookingSchema.statics.getBookingHistory = async function(userId, limit = 10) {
  return await this.find({
    userId,
    isActive: true
  }).sort({ createdAt: -1 }).limit(limit);
};

module.exports = mongoose.model('Booking', BookingSchema);