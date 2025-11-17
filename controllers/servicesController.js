const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/response');
const { User } = require('../models');

// Seat Finder Navigation
const getSeatNavigation = asyncHandler(async (req, res) => {
  const { pnr, currentLocation } = req.query;

  if (!pnr) {
    return ApiResponse.validationError(res, {
      message: 'PNR is required for seat navigation',
      fields: ['pnr']
    });
  }

  // Mock navigation data - in real implementation, integrate with station maps
  const navigationData = {
    pnr,
    platform: 'Platform 3',
    coach: 'S7',
    seatNumber: '45',
    directions: [
      { step: 1, instruction: 'Enter the station from Main Entrance', distance: '0m' },
      { step: 2, instruction: 'Walk straight towards Platform 3', distance: '150m' },
      { step: 3, instruction: 'Take the stairs/escalator to Platform 3', distance: '200m' },
      { step: 4, instruction: 'Walk towards Coach S7 (7th coach from engine)', distance: '250m' },
      { step: 5, instruction: 'Find seat number 45 in Coach S7', distance: '280m' }
    ],
    estimatedWalkTime: '8 minutes',
    totalDistance: '280 meters',
    platformLayout: {
      coachPositions: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'],
      yourCoach: 'S7',
      facilities: {
        restroom: 'Near Coach S5',
        waterCooler: 'Near Coach S3 and S8',
        foodStall: 'Platform end near Coach S1'
      }
    }
  };

  ApiResponse.success(res, navigationData, 'Seat navigation retrieved successfully');
});

// Cab Booking Integration
const getAvailableCabs = asyncHandler(async (req, res) => {
  const { pickup, destination, serviceType = 'all' } = req.query;

  if (!pickup || !destination) {
    return ApiResponse.validationError(res, {
      message: 'Pickup and destination locations are required',
      fields: ['pickup', 'destination']
    });
  }

  // Mock cab data - in real implementation, integrate with Uber/Ola APIs
  const cabOptions = [
    {
      service: 'Uber',
      options: [
        {
          type: 'UberGo',
          estimatedFare: 180,
          estimatedTime: '12 mins',
          distance: '8.5 km',
          available: true
        },
        {
          type: 'UberX',
          estimatedFare: 220,
          estimatedTime: '10 mins',
          distance: '8.5 km',
          available: true
        }
      ]
    },
    {
      service: 'Ola',
      options: [
        {
          type: 'Mini',
          estimatedFare: 175,
          estimatedTime: '15 mins',
          distance: '8.5 km',
          available: true
        },
        {
          type: 'Prime',
          estimatedFare: 210,
          estimatedTime: '12 mins',
          distance: '8.5 km',
          available: true
        }
      ]
    }
  ];

  ApiResponse.success(res, {
    pickup,
    destination,
    cabOptions,
    bookingNote: 'Cab booking integration is available. Redirecting to respective apps.'
  }, 'Available cabs retrieved successfully');
});

const bookCab = asyncHandler(async (req, res) => {
  const { service, cabType, pickup, destination, bookingId } = req.body;

  if (!service || !cabType || !pickup || !destination) {
    return ApiResponse.validationError(res, {
      message: 'All cab booking details are required',
      fields: ['service', 'cabType', 'pickup', 'destination']
    });
  }

  // Mock booking - in real implementation, integrate with actual APIs
  const cabBooking = {
    cabBookingId: `CAB_${Date.now()}`,
    service,
    cabType,
    pickup,
    destination,
    status: 'confirmed',
    driverDetails: {
      name: 'Rajesh Kumar',
      phone: '+91-98765-43210',
      vehicleNumber: 'DL-01-AB-1234',
      rating: 4.8
    },
    estimatedArrival: '12 minutes',
    fare: service === 'Uber' ? 220 : 210,
    bookingTime: new Date(),
    trainBookingId: bookingId
  };

  ApiResponse.success(res, cabBooking, 'Cab booked successfully', 201);
});

// Porter Service
const getAvailablePorters = asyncHandler(async (req, res) => {
  const { stationCode, date } = req.query;

  if (!stationCode) {
    return ApiResponse.validationError(res, {
      message: 'Station code is required',
      fields: ['stationCode']
    });
  }

  // Mock porter data
  const availablePorters = [
    {
      porterId: 'POR001',
      name: 'Ramesh Singh',
      licenseNumber: 'NDLS-POR-001',
      rating: 4.7,
      experience: '8 years',
      languages: ['Hindi', 'English'],
      fixedRate: 50,
      available: true,
      location: 'Platform 1-3'
    },
    {
      porterId: 'POR002',
      name: 'Suresh Kumar',
      licenseNumber: 'NDLS-POR-002',
      rating: 4.9,
      experience: '12 years',
      languages: ['Hindi', 'English', 'Punjabi'],
      fixedRate: 50,
      available: true,
      location: 'Platform 4-6'
    },
    {
      porterId: 'POR003',
      name: 'Mahesh Yadav',
      licenseNumber: 'NDLS-POR-003',
      rating: 4.6,
      experience: '5 years',
      languages: ['Hindi', 'English'],
      fixedRate: 50,
      available: true,
      location: 'Platform 7-10'
    }
  ];

  ApiResponse.success(res, {
    stationCode,
    availablePorters,
    fixedRate: 50,
    rateInfo: 'Government fixed rate - No bargaining required'
  }, 'Available porters retrieved successfully');
});

const bookPorter = asyncHandler(async (req, res) => {
  const { porterId, bookingId, serviceType, pickupLocation, dropLocation } = req.body;

  if (!porterId || !serviceType) {
    return ApiResponse.validationError(res, {
      message: 'Porter ID and service type are required',
      fields: ['porterId', 'serviceType']
    });
  }

  const porterBooking = {
    porterBookingId: `POR_${Date.now()}`,
    porterId,
    serviceType,
    pickupLocation,
    dropLocation,
    fixedRate: 50,
    status: 'confirmed',
    porterContact: '+91-98765-12345',
    estimatedTime: '5 minutes',
    bookingTime: new Date(),
    trainBookingId: bookingId
  };

  ApiResponse.success(res, porterBooking, 'Porter booked successfully', 201);
});

// Food Ordering
const getFoodMenu = asyncHandler(async (req, res) => {
  const { trainNumber, stationCode } = req.query;

  // Mock food menu
  const foodMenu = {
    categories: [
      {
        name: 'Vegetarian',
        icon: '🥬',
        items: [
          {
            id: 'VEG001',
            name: 'Veg Thali',
            price: 120,
            description: 'Complete vegetarian meal with rice, dal, vegetables, roti, and sweet',
            image: '/images/veg-thali.jpg',
            preparationTime: '15 mins',
            rating: 4.5,
            vendor: 'Railway Catering'
          },
          {
            id: 'VEG002',
            name: 'Paneer Butter Masala',
            price: 150,
            description: 'Rich paneer curry with butter naan',
            image: '/images/paneer-masala.jpg',
            preparationTime: '20 mins',
            rating: 4.7,
            vendor: 'Startup Kitchen Co.'
          },
          {
            id: 'VEG003',
            name: 'South Indian Combo',
            price: 100,
            description: 'Idli, dosa, sambar, and coconut chutney',
            image: '/images/south-combo.jpg',
            preparationTime: '12 mins',
            rating: 4.6,
            vendor: 'South Express Foods'
          }
        ]
      },
      {
        name: 'Non-Vegetarian',
        icon: '🍗',
        items: [
          {
            id: 'NON001',
            name: 'Chicken Biryani',
            price: 180,
            description: 'Aromatic basmati rice with tender chicken pieces',
            image: '/images/chicken-biryani.jpg',
            preparationTime: '25 mins',
            rating: 4.8,
            vendor: 'Biryani Express'
          },
          {
            id: 'NON002',
            name: 'Butter Chicken',
            price: 200,
            description: 'Creamy chicken curry with naan bread',
            image: '/images/butter-chicken.jpg',
            preparationTime: '20 mins',
            rating: 4.7,
            vendor: 'Punjab Kitchen'
          }
        ]
      },
      {
        name: 'Snacks & Beverages',
        icon: '🥤',
        items: [
          {
            id: 'SNK001',
            name: 'Samosa (2 pcs)',
            price: 30,
            description: 'Crispy fried pastry with spiced potato filling',
            image: '/images/samosa.jpg',
            preparationTime: '5 mins',
            rating: 4.3,
            vendor: 'Quick Bites'
          },
          {
            id: 'SNK002',
            name: 'Masala Chai',
            price: 20,
            description: 'Traditional Indian spiced tea',
            image: '/images/masala-chai.jpg',
            preparationTime: '3 mins',
            rating: 4.5,
            vendor: 'Chai Point'
          },
          {
            id: 'SNK003',
            name: 'Fresh Fruit Juice',
            price: 40,
            description: 'Seasonal fresh fruit juice',
            image: '/images/fruit-juice.jpg',
            preparationTime: '5 mins',
            rating: 4.4,
            vendor: 'Fresh & Healthy'
          }
        ]
      }
    ],
    deliveryInfo: {
      deliveryTime: '20-30 minutes',
      deliveryCharge: 10,
      minimumOrder: 50
    }
  };

  ApiResponse.success(res, foodMenu, 'Food menu retrieved successfully');
});

const orderFood = asyncHandler(async (req, res) => {
  const { items, seatNumber, coachNumber, bookingId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return ApiResponse.validationError(res, {
      message: 'Food items are required',
      fields: ['items']
    });
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = totalAmount >= 50 ? 10 : 0;

  const foodOrder = {
    orderId: `FOOD_${Date.now()}`,
    items,
    seatNumber,
    coachNumber,
    totalAmount: totalAmount + deliveryCharge,
    deliveryCharge,
    status: 'confirmed',
    estimatedDelivery: '25 minutes',
    orderTime: new Date(),
    trainBookingId: bookingId
  };

  ApiResponse.success(res, foodOrder, 'Food order placed successfully', 201);
});

// Cleanliness Rewards
const verifyCleanliness = asyncHandler(async (req, res) => {
  const { bookingId, seatPhoto, cleanlinessRating } = req.body;

  if (!bookingId) {
    return ApiResponse.validationError(res, {
      message: 'Booking ID is required',
      fields: ['bookingId']
    });
  }

  // Mock AI verification - in real implementation, use image recognition
  const isClean = Math.random() > 0.3; // 70% chance of being clean
  const pointsEarned = isClean ? Math.floor(Math.random() * 20) + 10 : 0; // 10-30 points

  if (isClean && pointsEarned > 0) {
    // Add points to user account
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { rewardPoints: pointsEarned }
    });
  }

  const verificationResult = {
    bookingId,
    isClean,
    pointsEarned,
    message: isClean 
      ? `Great job! You earned ${pointsEarned} reward points for keeping your seat clean.`
      : 'Seat cleanliness could be improved. No points awarded this time.',
    totalPoints: req.user.rewardPoints + pointsEarned,
    nextRewardAt: Math.ceil((req.user.rewardPoints + pointsEarned) / 100) * 100
  };

  ApiResponse.success(res, verificationResult, 'Cleanliness verification completed');
});

const getRewardPoints = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  const rewardData = {
    currentPoints: user.rewardPoints,
    tier: getTier(user.rewardPoints),
    nextTierAt: getNextTierThreshold(user.rewardPoints),
    redeemableRewards: [
      {
        id: 'SHOP001',
        name: '₹50 Shopping Voucher',
        pointsRequired: 500,
        available: user.rewardPoints >= 500
      },
      {
        id: 'SHOP002',
        name: '₹100 Shopping Voucher',
        pointsRequired: 1000,
        available: user.rewardPoints >= 1000
      },
      {
        id: 'FOOD001',
        name: 'Free Meal Voucher',
        pointsRequired: 300,
        available: user.rewardPoints >= 300
      }
    ]
  };

  ApiResponse.success(res, rewardData, 'Reward points retrieved successfully');
});

// Helper functions
const getTier = (points) => {
  if (points >= 5000) return 'Platinum';
  if (points >= 2000) return 'Gold';
  if (points >= 500) return 'Silver';
  return 'Bronze';
};

const getNextTierThreshold = (points) => {
  if (points < 500) return 500;
  if (points < 2000) return 2000;
  if (points < 5000) return 5000;
  return null; // Already at highest tier
};

module.exports = {
  getSeatNavigation,
  getAvailableCabs,
  bookCab,
  getAvailablePorters,
  bookPorter,
  getFoodMenu,
  orderFood,
  verifyCleanliness,
  getRewardPoints
};