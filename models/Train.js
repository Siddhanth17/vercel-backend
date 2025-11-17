const mongoose = require('mongoose');

const TrainSchema = new mongoose.Schema({
  trainNumber: {
    type: String,
    required: [true, 'Please provide train number'],
    unique: true,
    trim: true,
    match: [/^\d{5}$/, 'Train number must be 5 digits']
  },
  trainName: {
    type: String,
    required: [true, 'Please provide train name'],
    trim: true,
    maxlength: [100, 'Train name cannot exceed 100 characters']
  },
  trainType: {
    type: String,
    required: true,
    enum: ['Express', 'Superfast', 'Rajdhani', 'Shatabdi', 'Duronto', 'Local', 'Passenger'],
    default: 'Express'
  },
  route: [{
    stationCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    stationName: {
      type: String,
      required: true,
      trim: true
    },
    arrivalTime: {
      type: String,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    departureTime: {
      type: String,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    platform: {
      type: String,
      default: 'TBD'
    },
    distance: {
      type: Number,
      required: true,
      min: [0, 'Distance cannot be negative']
    },
    day: {
      type: Number,
      required: true,
      min: [1, 'Day must be at least 1'],
      default: 1
    },
    haltTime: {
      type: Number, // in minutes
      default: 2,
      min: [0, 'Halt time cannot be negative']
    }
  }],
  classes: [{
    type: {
      type: String,
      required: true,
      enum: ['1A', '2A', '3A', 'CC', 'SL', '2S', 'GEN'],
      // 1A: First AC, 2A: Second AC, 3A: Third AC, CC: Chair Car, SL: Sleeper, 2S: Second Sitting, GEN: General
    },
    name: {
      type: String,
      required: true,
      enum: ['First AC', 'Second AC', 'Third AC', 'Chair Car', 'Sleeper', 'Second Sitting', 'General']
    },
    totalSeats: {
      type: Number,
      required: true,
      min: [1, 'Total seats must be at least 1']
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, 'Available seats cannot be negative']
    },
    basePrice: {
      type: Number,
      required: true,
      min: [0, 'Base price cannot be negative']
    },
    pricePerKm: {
      type: Number,
      required: true,
      min: [0, 'Price per km cannot be negative']
    },
    amenities: [{
      type: String,
      enum: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point', 'Reading Light']
    }]
  }],
  runningDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  duration: {
    hours: {
      type: Number,
      required: true,
      min: [0, 'Duration hours cannot be negative']
    },
    minutes: {
      type: Number,
      required: true,
      min: [0, 'Duration minutes cannot be negative'],
      max: [59, 'Duration minutes cannot exceed 59']
    }
  },
  totalDistance: {
    type: Number,
    required: true,
    min: [0, 'Total distance cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  pantryAvailable: {
    type: Boolean,
    default: false
  },
  wifiAvailable: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better query performance
TrainSchema.index({ trainNumber: 1 });
TrainSchema.index({ 'route.stationCode': 1 });
TrainSchema.index({ runningDays: 1 });
TrainSchema.index({ isActive: 1 });

// Virtual for source station
TrainSchema.virtual('source').get(function() {
  return this.route && this.route.length > 0 ? this.route[0] : null;
});

// Virtual for destination station
TrainSchema.virtual('destination').get(function() {
  return this.route && this.route.length > 0 ? this.route[this.route.length - 1] : null;
});

// Virtual for formatted duration
TrainSchema.virtual('formattedDuration').get(function() {
  const hours = this.duration.hours;
  const minutes = this.duration.minutes;
  return `${hours}h ${minutes}m`;
});

// Method to get price between two stations for a specific class
TrainSchema.methods.getPriceBetweenStations = function(fromStationCode, toStationCode, classType) {
  const fromStation = this.route.find(station => station.stationCode === fromStationCode);
  const toStation = this.route.find(station => station.stationCode === toStationCode);
  
  if (!fromStation || !toStation) {
    throw new Error('Station not found in route');
  }
  
  const classInfo = this.classes.find(cls => cls.type === classType);
  if (!classInfo) {
    throw new Error('Class not available');
  }
  
  const distance = Math.abs(toStation.distance - fromStation.distance);
  const price = classInfo.basePrice + (distance * classInfo.pricePerKm);
  
  return Math.round(price);
};

// Method to check if train runs on a specific day
TrainSchema.methods.runsOnDay = function(dayName) {
  return this.runningDays.includes(dayName);
};

// Method to get available classes with seat availability
TrainSchema.methods.getAvailableClasses = function() {
  return this.classes.filter(cls => cls.availableSeats > 0);
};

// Method to update seat availability
TrainSchema.methods.updateSeatAvailability = async function(classType, seatsToBook) {
  const classInfo = this.classes.find(cls => cls.type === classType);
  
  if (!classInfo) {
    throw new Error('Class not found');
  }
  
  if (classInfo.availableSeats < seatsToBook) {
    throw new Error('Insufficient seats available');
  }
  
  classInfo.availableSeats -= seatsToBook;
  await this.save();
  
  return classInfo.availableSeats;
};

// Static method to search trains between stations
TrainSchema.statics.searchTrains = async function(fromStationCode, toStationCode, date) {
  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  
  const trains = await this.find({
    isActive: true,
    runningDays: dayName,
    'route.stationCode': { $all: [fromStationCode, toStationCode] }
  });
  
  // Filter trains where from station comes before to station in route
  const validTrains = trains.filter(train => {
    const fromIndex = train.route.findIndex(station => station.stationCode === fromStationCode);
    const toIndex = train.route.findIndex(station => station.stationCode === toStationCode);
    return fromIndex < toIndex && fromIndex !== -1 && toIndex !== -1;
  });
  
  return validTrains;
};

module.exports = mongoose.model('Train', TrainSchema);