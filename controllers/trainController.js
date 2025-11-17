const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/response');
const { Train } = require('../models');
const { getCache, setCache } = require('../config/redis');

// @desc    Search trains between stations
// @route   GET /api/trains/search
// @access  Public
const searchTrains = asyncHandler(async (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    return ApiResponse.validationError(res, {
      message: 'Please provide from station, to station, and date',
      fields: ['from', 'to', 'date']
    });
  }

  // Check cache first
  const cacheKey = `trains:${from}:${to}:${date}`;
  let trains = await getCache(cacheKey);

  if (!trains) {
    // Search trains from database
    trains = await Train.searchTrains(from.toUpperCase(), to.toUpperCase(), date);
    
    // Add pricing information for each train
    const trainsWithPricing = trains.map(train => {
      const trainObj = train.toObject();
      
      // Calculate prices for available classes
      trainObj.classes = trainObj.classes.map(cls => {
        try {
          const price = train.getPriceBetweenStations(from.toUpperCase(), to.toUpperCase(), cls.type);
          return {
            ...cls,
            price,
            available: cls.availableSeats > 0
          };
        } catch (error) {
          return {
            ...cls,
            price: 0,
            available: false,
            error: error.message
          };
        }
      });

      // Add journey details
      const fromStation = trainObj.route.find(station => station.stationCode === from.toUpperCase());
      const toStation = trainObj.route.find(station => station.stationCode === to.toUpperCase());
      
      trainObj.journeyDetails = {
        from: fromStation,
        to: toStation,
        duration: trainObj.formattedDuration,
        distance: Math.abs(toStation.distance - fromStation.distance)
      };

      return trainObj;
    });

    trains = trainsWithPricing;
    
    // Cache for 30 minutes
    await setCache(cacheKey, trains, 1800);
  }

  ApiResponse.success(res, {
    trains,
    searchParams: { from, to, date },
    count: trains.length
  }, 'Trains found successfully');
});

// @desc    Get train details by ID
// @route   GET /api/trains/:id
// @access  Public
const getTrainById = asyncHandler(async (req, res) => {
  const train = await Train.findById(req.params.id);

  if (!train) {
    return ApiResponse.notFound(res, 'Train not found');
  }

  ApiResponse.success(res, train, 'Train details retrieved successfully');
});

// @desc    Get all stations
// @route   GET /api/trains/stations
// @access  Public
const getStations = asyncHandler(async (req, res) => {
  // Check cache first
  let stations = await getCache('stations:all');

  if (!stations) {
    // Get unique stations from all trains
    const trains = await Train.find({ isActive: true }, 'route.stationCode route.stationName');
    
    const stationMap = new Map();
    
    trains.forEach(train => {
      train.route.forEach(station => {
        if (!stationMap.has(station.stationCode)) {
          stationMap.set(station.stationCode, {
            code: station.stationCode,
            name: station.stationName
          });
        }
      });
    });

    stations = Array.from(stationMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    
    // Cache for 24 hours
    await setCache('stations:all', stations, 86400);
  }

  ApiResponse.success(res, stations, 'Stations retrieved successfully');
});

// @desc    Get popular routes
// @route   GET /api/trains/popular-routes
// @access  Public
const getPopularRoutes = asyncHandler(async (req, res) => {
  // This would typically come from booking analytics
  // For now, return some popular Indian railway routes
  const popularRoutes = [
    {
      from: { code: 'NDLS', name: 'New Delhi' },
      to: { code: 'CSMT', name: 'Mumbai CST' },
      frequency: 'Daily',
      minPrice: 450
    },
    {
      from: { code: 'NDLS', name: 'New Delhi' },
      to: { code: 'HWH', name: 'Howrah Junction' },
      frequency: 'Daily',
      minPrice: 520
    },
    {
      from: { code: 'NDLS', name: 'New Delhi' },
      to: { code: 'LKO', name: 'Lucknow' },
      frequency: 'Daily',
      minPrice: 280
    },
    {
      from: { code: 'CSMT', name: 'Mumbai CST' },
      to: { code: 'BLR', name: 'Bangalore' },
      frequency: 'Daily',
      minPrice: 380
    },
    {
      from: { code: 'HWH', name: 'Howrah Junction' },
      to: { code: 'CSMT', name: 'Mumbai CST' },
      frequency: 'Daily',
      minPrice: 480
    }
  ];

  ApiResponse.success(res, popularRoutes, 'Popular routes retrieved successfully');
});

// @desc    Get train schedule
// @route   GET /api/trains/:id/schedule
// @access  Public
const getTrainSchedule = asyncHandler(async (req, res) => {
  const train = await Train.findById(req.params.id);

  if (!train) {
    return ApiResponse.notFound(res, 'Train not found');
  }

  const schedule = {
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    route: train.route.map(station => ({
      stationCode: station.stationCode,
      stationName: station.stationName,
      arrivalTime: station.arrivalTime,
      departureTime: station.departureTime,
      platform: station.platform,
      distance: station.distance,
      day: station.day,
      haltTime: station.haltTime
    })),
    runningDays: train.runningDays,
    totalDistance: train.totalDistance,
    duration: train.formattedDuration
  };

  ApiResponse.success(res, schedule, 'Train schedule retrieved successfully');
});

// @desc    Check seat availability
// @route   GET /api/trains/:id/availability
// @access  Public
const checkSeatAvailability = asyncHandler(async (req, res) => {
  const { date, from, to } = req.query;
  
  if (!date || !from || !to) {
    return ApiResponse.validationError(res, {
      message: 'Please provide date, from station, and to station',
      fields: ['date', 'from', 'to']
    });
  }

  const train = await Train.findById(req.params.id);

  if (!train) {
    return ApiResponse.notFound(res, 'Train not found');
  }

  // Check if train runs on the given date
  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  if (!train.runsOnDay(dayName)) {
    return ApiResponse.error(res, `Train does not run on ${dayName}`, 400);
  }

  // Get availability for each class
  const availability = train.classes.map(cls => {
    try {
      const price = train.getPriceBetweenStations(from.toUpperCase(), to.toUpperCase(), cls.type);
      return {
        class: cls.type,
        className: cls.name,
        availableSeats: cls.availableSeats,
        totalSeats: cls.totalSeats,
        price,
        amenities: cls.amenities,
        status: cls.availableSeats > 0 ? 'Available' : 'Waiting List'
      };
    } catch (error) {
      return {
        class: cls.type,
        className: cls.name,
        availableSeats: 0,
        totalSeats: cls.totalSeats,
        price: 0,
        amenities: cls.amenities,
        status: 'Not Available',
        error: error.message
      };
    }
  });

  ApiResponse.success(res, {
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    date,
    from,
    to,
    availability
  }, 'Seat availability retrieved successfully');
});

module.exports = {
  searchTrains,
  getTrainById,
  getStations,
  getPopularRoutes,
  getTrainSchedule,
  checkSeatAvailability
};