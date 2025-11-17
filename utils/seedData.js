const { Train } = require('../models');

// Sample train data for development
const sampleTrains = [
  {
    trainNumber: '12001',
    trainName: 'Shatabdi Express',
    trainType: 'Shatabdi',
    route: [
      {
        stationCode: 'NDLS',
        stationName: 'New Delhi',
        arrivalTime: null,
        departureTime: '06:00',
        platform: '16',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'GZB',
        stationName: 'Ghaziabad',
        arrivalTime: '06:35',
        departureTime: '06:37',
        platform: '4',
        distance: 25,
        day: 1,
        haltTime: 2
      },
      {
        stationCode: 'MB',
        stationName: 'Moradabad',
        arrivalTime: '08:15',
        departureTime: '08:20',
        platform: '1',
        distance: 164,
        day: 1,
        haltTime: 5
      },
      {
        stationCode: 'BE',
        stationName: 'Bareilly',
        arrivalTime: '09:03',
        departureTime: '09:05',
        platform: '2',
        distance: 252,
        day: 1,
        haltTime: 2
      },
      {
        stationCode: 'LKO',
        stationName: 'Lucknow',
        arrivalTime: '11:20',
        departureTime: null,
        platform: '1',
        distance: 496,
        day: 1,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: 'CC',
        name: 'Chair Car',
        totalSeats: 78,
        availableSeats: 45,
        basePrice: 200,
        pricePerKm: 0.8,
        amenities: ['AC', 'Meals', 'WiFi', 'Charging Point']
      },
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 20,
        basePrice: 400,
        pricePerKm: 1.2,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point']
      }
    ],
    runningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    duration: { hours: 5, minutes: 20 },
    totalDistance: 496,
    pantryAvailable: true,
    wifiAvailable: true
  },
  {
    trainNumber: '12002',
    trainName: 'Rajdhani Express',
    trainType: 'Rajdhani',
    route: [
      {
        stationCode: 'NDLS',
        stationName: 'New Delhi',
        arrivalTime: null,
        departureTime: '16:55',
        platform: '2',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'CNB',
        stationName: 'Kanpur Central',
        arrivalTime: '21:25',
        departureTime: '21:30',
        platform: '1',
        distance: 441,
        day: 1,
        haltTime: 5
      },
      {
        stationCode: 'ALD',
        stationName: 'Allahabad Junction',
        arrivalTime: '23:03',
        departureTime: '23:05',
        platform: '10',
        distance: 634,
        day: 1,
        haltTime: 2
      },
      {
        stationCode: 'MGS',
        stationName: 'Mughal Sarai',
        arrivalTime: '01:15',
        departureTime: '01:25',
        platform: '4',
        distance: 764,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'PNBE',
        stationName: 'Patna Junction',
        arrivalTime: '04:30',
        departureTime: '04:40',
        platform: '10',
        distance: 995,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'HWH',
        stationName: 'Howrah Junction',
        arrivalTime: '09:55',
        departureTime: null,
        platform: '23',
        distance: 1441,
        day: 2,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: '1A',
        name: 'First AC',
        totalSeats: 18,
        availableSeats: 8,
        basePrice: 800,
        pricePerKm: 2.5,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point', 'Reading Light']
      },
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 25,
        basePrice: 500,
        pricePerKm: 1.8,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point']
      },
      {
        type: '3A',
        name: 'Third AC',
        totalSeats: 64,
        availableSeats: 40,
        basePrice: 350,
        pricePerKm: 1.2,
        amenities: ['AC', 'Bedding', 'Charging Point']
      }
    ],
    runningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    duration: { hours: 17, minutes: 0 },
    totalDistance: 1441,
    pantryAvailable: true,
    wifiAvailable: true
  },
  {
    trainNumber: '12003',
    trainName: 'Mumbai Express',
    trainType: 'Express',
    route: [
      {
        stationCode: 'NDLS',
        stationName: 'New Delhi',
        arrivalTime: null,
        departureTime: '21:35',
        platform: '14',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'JHS',
        stationName: 'Jhansi Junction',
        arrivalTime: '03:58',
        departureTime: '04:08',
        platform: '1',
        distance: 415,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'BPL',
        stationName: 'Bhopal Junction',
        arrivalTime: '07:00',
        departureTime: '07:10',
        platform: '6',
        distance: 707,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'NGP',
        stationName: 'Nagpur Junction',
        arrivalTime: '13:15',
        departureTime: '13:25',
        platform: '2',
        distance: 1058,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'CSMT',
        stationName: 'Mumbai CST',
        arrivalTime: '08:25',
        departureTime: null,
        platform: '18',
        distance: 1384,
        day: 3,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: '1A',
        name: 'First AC',
        totalSeats: 24,
        availableSeats: 12,
        basePrice: 600,
        pricePerKm: 2.0,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point', 'Reading Light']
      },
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 30,
        basePrice: 400,
        pricePerKm: 1.5,
        amenities: ['AC', 'Bedding', 'WiFi', 'Charging Point']
      },
      {
        type: '3A',
        name: 'Third AC',
        totalSeats: 72,
        availableSeats: 55,
        basePrice: 250,
        pricePerKm: 1.0,
        amenities: ['AC', 'Bedding', 'Charging Point']
      },
      {
        type: 'SL',
        name: 'Sleeper',
        totalSeats: 72,
        availableSeats: 60,
        basePrice: 150,
        pricePerKm: 0.6,
        amenities: ['Charging Point']
      },
      {
        type: 'GEN',
        name: 'General',
        totalSeats: 100,
        availableSeats: 85,
        basePrice: 50,
        pricePerKm: 0.3,
        amenities: []
      }
    ],
    runningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    duration: { hours: 34, minutes: 50 },
    totalDistance: 1384,
    pantryAvailable: true,
    wifiAvailable: false
  },
  {
    trainNumber: '12004',
    trainName: 'Duronto Express',
    trainType: 'Duronto',
    route: [
      {
        stationCode: 'CSMT',
        stationName: 'Mumbai CST',
        arrivalTime: null,
        departureTime: '14:00',
        platform: '18',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'NDLS',
        stationName: 'New Delhi',
        arrivalTime: '07:35',
        departureTime: null,
        platform: '16',
        distance: 1384,
        day: 2,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: '1A',
        name: 'First AC',
        totalSeats: 18,
        availableSeats: 10,
        basePrice: 700,
        pricePerKm: 2.2,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point', 'Reading Light']
      },
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 35,
        basePrice: 450,
        pricePerKm: 1.6,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point']
      },
      {
        type: '3A',
        name: 'Third AC',
        totalSeats: 64,
        availableSeats: 50,
        basePrice: 300,
        pricePerKm: 1.1,
        amenities: ['AC', 'Bedding', 'Charging Point']
      }
    ],
    runningDays: ['Tuesday', 'Thursday', 'Saturday'],
    duration: { hours: 17, minutes: 35 },
    totalDistance: 1384,
    pantryAvailable: true,
    wifiAvailable: true
  },
  {
    trainNumber: '12005',
    trainName: 'Chennai Express',
    trainType: 'Express',
    route: [
      {
        stationCode: 'NDLS',
        stationName: 'New Delhi',
        arrivalTime: null,
        departureTime: '15:50',
        platform: '14',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'AGC',
        stationName: 'Agra Cantt',
        arrivalTime: '18:25',
        departureTime: '18:30',
        platform: '1',
        distance: 199,
        day: 1,
        haltTime: 5
      },
      {
        stationCode: 'JHS',
        stationName: 'Jhansi Junction',
        arrivalTime: '21:15',
        departureTime: '21:25',
        platform: '2',
        distance: 415,
        day: 1,
        haltTime: 10
      },
      {
        stationCode: 'BPL',
        stationName: 'Bhopal Junction',
        arrivalTime: '02:30',
        departureTime: '02:40',
        platform: '4',
        distance: 707,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'NGP',
        stationName: 'Nagpur Junction',
        arrivalTime: '08:45',
        departureTime: '08:55',
        platform: '3',
        distance: 1058,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'BZA',
        stationName: 'Vijayawada Junction',
        arrivalTime: '18:30',
        departureTime: '18:40',
        platform: '1',
        distance: 1520,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'MAS',
        stationName: 'Chennai Central',
        arrivalTime: '06:15',
        departureTime: null,
        platform: '9',
        distance: 2180,
        day: 3,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 28,
        basePrice: 500,
        pricePerKm: 1.4,
        amenities: ['AC', 'Bedding', 'WiFi', 'Charging Point']
      },
      {
        type: '3A',
        name: 'Third AC',
        totalSeats: 72,
        availableSeats: 45,
        basePrice: 350,
        pricePerKm: 1.0,
        amenities: ['AC', 'Bedding', 'Charging Point']
      },
      {
        type: 'SL',
        name: 'Sleeper',
        totalSeats: 72,
        availableSeats: 55,
        basePrice: 200,
        pricePerKm: 0.5,
        amenities: ['Charging Point']
      }
    ],
    runningDays: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
    duration: { hours: 38, minutes: 25 },
    totalDistance: 2180,
    pantryAvailable: true,
    wifiAvailable: false
  },
  {
    trainNumber: '12006',
    trainName: 'Bangalore Rajdhani',
    trainType: 'Rajdhani',
    route: [
      {
        stationCode: 'NDLS',
        stationName: 'New Delhi',
        arrivalTime: null,
        departureTime: '20:05',
        platform: '2',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'BPL',
        stationName: 'Bhopal Junction',
        arrivalTime: '05:15',
        departureTime: '05:25',
        platform: '6',
        distance: 707,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'SC',
        stationName: 'Secunderabad',
        arrivalTime: '18:45',
        departureTime: '18:55',
        platform: '10',
        distance: 1558,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'SBC',
        stationName: 'Bangalore City',
        arrivalTime: '05:55',
        departureTime: null,
        platform: '1',
        distance: 2444,
        day: 3,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: '1A',
        name: 'First AC',
        totalSeats: 18,
        availableSeats: 8,
        basePrice: 800,
        pricePerKm: 2.3,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point', 'Reading Light']
      },
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 22,
        basePrice: 550,
        pricePerKm: 1.7,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point']
      },
      {
        type: '3A',
        name: 'Third AC',
        totalSeats: 64,
        availableSeats: 40,
        basePrice: 400,
        pricePerKm: 1.2,
        amenities: ['AC', 'Bedding', 'Charging Point']
      }
    ],
    runningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    duration: { hours: 33, minutes: 50 },
    totalDistance: 2444,
    pantryAvailable: true,
    wifiAvailable: true
  },
  {
    trainNumber: '12007',
    trainName: 'Kolkata Mail',
    trainType: 'Express',
    route: [
      {
        stationCode: 'CSMT',
        stationName: 'Mumbai CST',
        arrivalTime: null,
        departureTime: '12:50',
        platform: '18',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'NGP',
        stationName: 'Nagpur Junction',
        arrivalTime: '01:15',
        departureTime: '01:25',
        platform: '2',
        distance: 778,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'BZA',
        stationName: 'Vijayawada Junction',
        arrivalTime: '14:30',
        departureTime: '14:40',
        platform: '1',
        distance: 1240,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'BBS',
        stationName: 'Bhubaneswar',
        arrivalTime: '04:45',
        departureTime: '04:55',
        platform: '4',
        distance: 1680,
        day: 3,
        haltTime: 10
      },
      {
        stationCode: 'HWH',
        stationName: 'Howrah Junction',
        arrivalTime: '11:30',
        departureTime: null,
        platform: '23',
        distance: 2014,
        day: 3,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 30,
        basePrice: 450,
        pricePerKm: 1.3,
        amenities: ['AC', 'Bedding', 'WiFi', 'Charging Point']
      },
      {
        type: '3A',
        name: 'Third AC',
        totalSeats: 72,
        availableSeats: 50,
        basePrice: 300,
        pricePerKm: 0.9,
        amenities: ['AC', 'Bedding', 'Charging Point']
      },
      {
        type: 'SL',
        name: 'Sleeper',
        totalSeats: 72,
        availableSeats: 60,
        basePrice: 180,
        pricePerKm: 0.4,
        amenities: ['Charging Point']
      },
      {
        type: 'GEN',
        name: 'General',
        totalSeats: 100,
        availableSeats: 80,
        basePrice: 80,
        pricePerKm: 0.2,
        amenities: []
      }
    ],
    runningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    duration: { hours: 46, minutes: 40 },
    totalDistance: 2014,
    pantryAvailable: true,
    wifiAvailable: false
  },
  {
    trainNumber: '12008',
    trainName: 'Pune Shatabdi',
    trainType: 'Shatabdi',
    route: [
      {
        stationCode: 'CSMT',
        stationName: 'Mumbai CST',
        arrivalTime: null,
        departureTime: '17:35',
        platform: '18',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'LNL',
        stationName: 'Lonavala',
        arrivalTime: '19:08',
        departureTime: '19:10',
        platform: '1',
        distance: 106,
        day: 1,
        haltTime: 2
      },
      {
        stationCode: 'PUNE',
        stationName: 'Pune Junction',
        arrivalTime: '20:25',
        departureTime: null,
        platform: '1',
        distance: 192,
        day: 1,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: 'CC',
        name: 'Chair Car',
        totalSeats: 78,
        availableSeats: 50,
        basePrice: 150,
        pricePerKm: 0.9,
        amenities: ['AC', 'Meals', 'WiFi', 'Charging Point']
      },
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 25,
        basePrice: 300,
        pricePerKm: 1.5,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point']
      }
    ],
    runningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    duration: { hours: 2, minutes: 50 },
    totalDistance: 192,
    pantryAvailable: true,
    wifiAvailable: true
  },
  {
    trainNumber: '12009',
    trainName: 'Ahmedabad Express',
    trainType: 'Express',
    route: [
      {
        stationCode: 'CSMT',
        stationName: 'Mumbai CST',
        arrivalTime: null,
        departureTime: '19:05',
        platform: '18',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'BRC',
        stationName: 'Vadodara Junction',
        arrivalTime: '02:28',
        departureTime: '02:33',
        platform: '4',
        distance: 392,
        day: 2,
        haltTime: 5
      },
      {
        stationCode: 'ADI',
        stationName: 'Ahmedabad',
        arrivalTime: '05:15',
        departureTime: null,
        platform: '1',
        distance: 492,
        day: 2,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: '1A',
        name: 'First AC',
        totalSeats: 18,
        availableSeats: 12,
        basePrice: 400,
        pricePerKm: 1.8,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point', 'Reading Light']
      },
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 35,
        basePrice: 250,
        pricePerKm: 1.2,
        amenities: ['AC', 'Bedding', 'WiFi', 'Charging Point']
      },
      {
        type: '3A',
        name: 'Third AC',
        totalSeats: 72,
        availableSeats: 55,
        basePrice: 180,
        pricePerKm: 0.8,
        amenities: ['AC', 'Bedding', 'Charging Point']
      },
      {
        type: 'SL',
        name: 'Sleeper',
        totalSeats: 72,
        availableSeats: 65,
        basePrice: 120,
        pricePerKm: 0.4,
        amenities: ['Charging Point']
      }
    ],
    runningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    duration: { hours: 10, minutes: 10 },
    totalDistance: 492,
    pantryAvailable: true,
    wifiAvailable: false
  },
  {
    trainNumber: '12010',
    trainName: 'Jaipur Express',
    trainType: 'Express',
    route: [
      {
        stationCode: 'NDLS',
        stationName: 'New Delhi',
        arrivalTime: null,
        departureTime: '19:50',
        platform: '16',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'RE',
        stationName: 'Rewari Junction',
        arrivalTime: '21:25',
        departureTime: '21:27',
        platform: '2',
        distance: 82,
        day: 1,
        haltTime: 2
      },
      {
        stationCode: 'AII',
        stationName: 'Ajmer Junction',
        arrivalTime: '02:15',
        departureTime: '02:20',
        platform: '1',
        distance: 445,
        day: 2,
        haltTime: 5
      },
      {
        stationCode: 'JP',
        stationName: 'Jaipur',
        arrivalTime: '04:30',
        departureTime: null,
        platform: '4',
        distance: 308,
        day: 2,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 32,
        basePrice: 200,
        pricePerKm: 1.0,
        amenities: ['AC', 'Bedding', 'Charging Point']
      },
      {
        type: '3A',
        name: 'Third AC',
        totalSeats: 72,
        availableSeats: 50,
        basePrice: 150,
        pricePerKm: 0.7,
        amenities: ['AC', 'Bedding', 'Charging Point']
      },
      {
        type: 'SL',
        name: 'Sleeper',
        totalSeats: 72,
        availableSeats: 60,
        basePrice: 100,
        pricePerKm: 0.4,
        amenities: ['Charging Point']
      },
      {
        type: 'GEN',
        name: 'General',
        totalSeats: 100,
        availableSeats: 85,
        basePrice: 50,
        pricePerKm: 0.2,
        amenities: []
      }
    ],
    runningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    duration: { hours: 8, minutes: 40 },
    totalDistance: 308,
    pantryAvailable: true,
    wifiAvailable: false
  },
  {
    trainNumber: '12011',
    trainName: 'Kalka Shatabdi',
    trainType: 'Shatabdi',
    route: [
      {
        stationCode: 'NDLS',
        stationName: 'New Delhi',
        arrivalTime: null,
        departureTime: '07:40',
        platform: '16',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'PNP',
        stationName: 'Panipat Junction',
        arrivalTime: '08:33',
        departureTime: '08:35',
        platform: '1',
        distance: 90,
        day: 1,
        haltTime: 2
      },
      {
        stationCode: 'UMB',
        stationName: 'Ambala Cantt',
        arrivalTime: '10:05',
        departureTime: '10:10',
        platform: '4',
        distance: 200,
        day: 1,
        haltTime: 5
      },
      {
        stationCode: 'CDG',
        stationName: 'Chandigarh',
        arrivalTime: '11:05',
        departureTime: '11:10',
        platform: '1',
        distance: 258,
        day: 1,
        haltTime: 5
      },
      {
        stationCode: 'KLK',
        stationName: 'Kalka',
        arrivalTime: '11:50',
        departureTime: null,
        platform: '1',
        distance: 296,
        day: 1,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: 'CC',
        name: 'Chair Car',
        totalSeats: 78,
        availableSeats: 45,
        basePrice: 180,
        pricePerKm: 0.8,
        amenities: ['AC', 'Meals', 'WiFi', 'Charging Point']
      },
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 20,
        basePrice: 350,
        pricePerKm: 1.4,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point']
      }
    ],
    runningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    duration: { hours: 4, minutes: 10 },
    totalDistance: 296,
    pantryAvailable: true,
    wifiAvailable: true
  },
  {
    trainNumber: '12012',
    trainName: 'Coromandel Express',
    trainType: 'Express',
    route: [
      {
        stationCode: 'HWH',
        stationName: 'Howrah Junction',
        arrivalTime: null,
        departureTime: '14:45',
        platform: '23',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'BBS',
        stationName: 'Bhubaneswar',
        arrivalTime: '21:15',
        departureTime: '21:20',
        platform: '4',
        distance: 334,
        day: 1,
        haltTime: 5
      },
      {
        stationCode: 'BZA',
        stationName: 'Vijayawada Junction',
        arrivalTime: '07:30',
        departureTime: '07:40',
        platform: '1',
        distance: 774,
        day: 2,
        haltTime: 10
      },
      {
        stationCode: 'MAS',
        stationName: 'Chennai Central',
        arrivalTime: '17:45',
        departureTime: null,
        platform: '9',
        distance: 1166,
        day: 2,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: '1A',
        name: 'First AC',
        totalSeats: 18,
        availableSeats: 10,
        basePrice: 500,
        pricePerKm: 2.0,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point', 'Reading Light']
      },
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 25,
        basePrice: 350,
        pricePerKm: 1.3,
        amenities: ['AC', 'Bedding', 'WiFi', 'Charging Point']
      },
      {
        type: '3A',
        name: 'Third AC',
        totalSeats: 72,
        availableSeats: 45,
        basePrice: 250,
        pricePerKm: 0.9,
        amenities: ['AC', 'Bedding', 'Charging Point']
      },
      {
        type: 'SL',
        name: 'Sleeper',
        totalSeats: 72,
        availableSeats: 55,
        basePrice: 150,
        pricePerKm: 0.4,
        amenities: ['Charging Point']
      }
    ],
    runningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    duration: { hours: 27, minutes: 0 },
    totalDistance: 1166,
    pantryAvailable: true,
    wifiAvailable: false
  },
  {
    trainNumber: '12013',
    trainName: 'Amritsar Shatabdi',
    trainType: 'Shatabdi',
    route: [
      {
        stationCode: 'NDLS',
        stationName: 'New Delhi',
        arrivalTime: null,
        departureTime: '06:20',
        platform: '16',
        distance: 0,
        day: 1,
        haltTime: 0
      },
      {
        stationCode: 'PNP',
        stationName: 'Panipat Junction',
        arrivalTime: '07:13',
        departureTime: '07:15',
        platform: '1',
        distance: 90,
        day: 1,
        haltTime: 2
      },
      {
        stationCode: 'UMB',
        stationName: 'Ambala Cantt',
        arrivalTime: '08:45',
        departureTime: '08:50',
        platform: '4',
        distance: 200,
        day: 1,
        haltTime: 5
      },
      {
        stationCode: 'LDH',
        stationName: 'Ludhiana Junction',
        arrivalTime: '10:15',
        departureTime: '10:20',
        platform: '2',
        distance: 320,
        day: 1,
        haltTime: 5
      },
      {
        stationCode: 'JUC',
        stationName: 'Jalandhar City',
        arrivalTime: '11:05',
        departureTime: '11:07',
        platform: '1',
        distance: 380,
        day: 1,
        haltTime: 2
      },
      {
        stationCode: 'ASR',
        stationName: 'Amritsar Junction',
        arrivalTime: '12:10',
        departureTime: null,
        platform: '1',
        distance: 449,
        day: 1,
        haltTime: 0
      }
    ],
    classes: [
      {
        type: 'CC',
        name: 'Chair Car',
        totalSeats: 78,
        availableSeats: 40,
        basePrice: 220,
        pricePerKm: 0.9,
        amenities: ['AC', 'Meals', 'WiFi', 'Charging Point']
      },
      {
        type: '2A',
        name: 'Second AC',
        totalSeats: 48,
        availableSeats: 18,
        basePrice: 400,
        pricePerKm: 1.5,
        amenities: ['AC', 'Meals', 'Bedding', 'WiFi', 'Charging Point']
      }
    ],
    runningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    duration: { hours: 5, minutes: 50 },
    totalDistance: 449,
    pantryAvailable: true,
    wifiAvailable: true
  }
];

// Function to seed train data
const seedTrains = async () => {
  try {
    // Clear existing trains
    await Train.deleteMany({});
    console.log('Cleared existing train data');
    
    // Insert sample trains
    const trains = await Train.insertMany(sampleTrains);
    console.log(`✅ Seeded ${trains.length} trains successfully`);
    
    return trains;
  } catch (error) {
    console.error('Error seeding train data:', error);
    throw error;
  }
};

module.exports = {
  seedTrains,
  sampleTrains
};