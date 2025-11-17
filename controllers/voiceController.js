const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/response');
const { Train } = require('../models');

// @desc    Process voice command
// @route   POST /api/voice/process
// @access  Private
const processVoiceCommand = asyncHandler(async (req, res) => {
  const { transcript, language = 'en' } = req.body;

  if (!transcript) {
    return ApiResponse.validationError(res, {
      message: 'Voice transcript is required',
      fields: ['transcript']
    });
  }

  try {
    // Parse voice command and extract booking intent
    const intent = await parseVoiceIntent(transcript, language);
    
    if (!intent.recognized) {
      return ApiResponse.success(res, {
        recognized: false,
        message: getLocalizedMessage('not_understood', language),
        suggestions: getLocalizedMessage('suggestions', language)
      }, 'Voice command not recognized');
    }

    // Process the recognized intent
    const response = await processBookingIntent(intent);
    
    ApiResponse.success(res, {
      recognized: true,
      intent: intent.type,
      data: response,
      message: getLocalizedMessage('command_processed', language),
      voiceResponse: generateVoiceResponse(response, language)
    }, 'Voice command processed successfully');

  } catch (error) {
    console.error('Voice processing error:', error);
    ApiResponse.error(res, 'Failed to process voice command', 500);
  }
});

// @desc    Get supported languages
// @route   GET /api/voice/languages
// @access  Public
const getSupportedLanguages = asyncHandler(async (req, res) => {
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
  ];

  ApiResponse.success(res, languages, 'Supported languages retrieved successfully');
});

// @desc    Convert text to speech
// @route   POST /api/voice/speak
// @access  Private
const textToSpeech = asyncHandler(async (req, res) => {
  const { text, language = 'en', voice = 'default' } = req.body;

  if (!text) {
    return ApiResponse.validationError(res, {
      message: 'Text is required for speech synthesis',
      fields: ['text']
    });
  }

  // In a real implementation, you would integrate with a TTS service
  // For now, we'll return the configuration for client-side TTS
  const speechConfig = {
    text,
    language,
    voice,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  };

  ApiResponse.success(res, speechConfig, 'Speech configuration generated');
});

// Helper function to parse voice intent
const parseVoiceIntent = async (transcript, language) => {
  const normalizedText = transcript.toLowerCase().trim();
  
  // Define patterns for different languages
  const patterns = {
    en: {
      book_ticket: [
        /book.*ticket/i,
        /i want to book/i,
        /book.*train/i,
        /reserve.*seat/i
      ],
      search_train: [
        /search.*train/i,
        /find.*train/i,
        /train.*from.*to/i,
        /show.*trains/i
      ],
      check_status: [
        /check.*status/i,
        /pnr.*status/i,
        /booking.*status/i
      ],
      cancel_ticket: [
        /cancel.*ticket/i,
        /cancel.*booking/i
      ]
    },
    hi: {
      book_ticket: [
        /टिकट.*बुक/i,
        /रिजर्वेशन/i,
        /ट्रेन.*बुक/i
      ],
      search_train: [
        /ट्रेन.*खोज/i,
        /गाड़ी.*दिखा/i
      ]
    }
    // Add more language patterns as needed
  };

  const langPatterns = patterns[language] || patterns.en;
  
  // Check for booking intent
  for (const pattern of langPatterns.book_ticket || []) {
    if (pattern.test(normalizedText)) {
      return {
        recognized: true,
        type: 'book_ticket',
        confidence: 0.9,
        entities: extractBookingEntities(normalizedText, language)
      };
    }
  }

  // Check for search intent
  for (const pattern of langPatterns.search_train || []) {
    if (pattern.test(normalizedText)) {
      return {
        recognized: true,
        type: 'search_train',
        confidence: 0.8,
        entities: extractSearchEntities(normalizedText, language)
      };
    }
  }

  // Check for status intent
  for (const pattern of langPatterns.check_status || []) {
    if (pattern.test(normalizedText)) {
      return {
        recognized: true,
        type: 'check_status',
        confidence: 0.85,
        entities: extractStatusEntities(normalizedText, language)
      };
    }
  }

  return {
    recognized: false,
    type: 'unknown',
    confidence: 0
  };
};

// Helper function to extract booking entities
const extractBookingEntities = (text, language) => {
  const entities = {};
  
  // Extract station names (simplified - in real implementation, use NER)
  const stationPatterns = [
    /from\s+([a-zA-Z\s]+)\s+to\s+([a-zA-Z\s]+)/i,
    /([a-zA-Z\s]+)\s+to\s+([a-zA-Z\s]+)/i
  ];

  for (const pattern of stationPatterns) {
    const match = text.match(pattern);
    if (match) {
      entities.from = match[1].trim();
      entities.to = match[2].trim();
      break;
    }
  }

  // Extract date
  const datePatterns = [
    /tomorrow/i,
    /today/i,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      entities.date = match[0];
      break;
    }
  }

  // Extract passenger count
  const passengerMatch = text.match(/(\d+)\s*(passenger|person|people)/i);
  if (passengerMatch) {
    entities.passengers = parseInt(passengerMatch[1]);
  }

  // Extract class
  const classPatterns = [
    /first\s*ac/i,
    /second\s*ac/i,
    /third\s*ac/i,
    /sleeper/i,
    /general/i,
    /chair\s*car/i
  ];

  for (const pattern of classPatterns) {
    if (pattern.test(text)) {
      entities.class = text.match(pattern)[0];
      break;
    }
  }

  return entities;
};

// Helper function to extract search entities
const extractSearchEntities = (text, language) => {
  return extractBookingEntities(text, language); // Similar extraction logic
};

// Helper function to extract status entities
const extractStatusEntities = (text, language) => {
  const entities = {};
  
  // Extract PNR
  const pnrMatch = text.match(/([A-Z0-9]{10})/);
  if (pnrMatch) {
    entities.pnr = pnrMatch[1];
  }

  return entities;
};

// Helper function to process booking intent
const processBookingIntent = async (intent) => {
  switch (intent.type) {
    case 'book_ticket':
      return await handleBookingIntent(intent.entities);
    case 'search_train':
      return await handleSearchIntent(intent.entities);
    case 'check_status':
      return await handleStatusIntent(intent.entities);
    default:
      return { message: 'Intent not supported yet' };
  }
};

// Handle booking intent
const handleBookingIntent = async (entities) => {
  const response = {
    action: 'show_booking_form',
    prefilled: {}
  };

  if (entities.from) response.prefilled.from = entities.from;
  if (entities.to) response.prefilled.to = entities.to;
  if (entities.date) response.prefilled.date = entities.date;
  if (entities.passengers) response.prefilled.passengers = entities.passengers;
  if (entities.class) response.prefilled.class = entities.class;

  return response;
};

// Handle search intent
const handleSearchIntent = async (entities) => {
  if (entities.from && entities.to) {
    try {
      // Perform actual train search
      const trains = await Train.searchTrains(
        entities.from.toUpperCase(),
        entities.to.toUpperCase(),
        entities.date || new Date().toISOString().split('T')[0]
      );

      return {
        action: 'show_search_results',
        trains: trains.slice(0, 3), // Show top 3 results
        searchParams: entities
      };
    } catch (error) {
      return {
        action: 'show_error',
        message: 'Could not find trains for the specified route'
      };
    }
  }

  return {
    action: 'request_details',
    missing: ['from', 'to'].filter(field => !entities[field])
  };
};

// Handle status intent
const handleStatusIntent = async (entities) => {
  if (entities.pnr) {
    return {
      action: 'check_pnr_status',
      pnr: entities.pnr
    };
  }

  return {
    action: 'request_pnr',
    message: 'Please provide your PNR number'
  };
};

// Helper function to get localized messages
const getLocalizedMessage = (key, language) => {
  const messages = {
    en: {
      not_understood: "I didn't understand that. Could you please repeat?",
      suggestions: "Try saying 'Book a ticket from Delhi to Mumbai' or 'Search trains'",
      command_processed: "I understood your request. Let me help you with that."
    },
    hi: {
      not_understood: "मुझे समझ नहीं आया। कृपया दोबारा कहें?",
      suggestions: "कहने की कोशिश करें 'दिल्ली से मुंबई टिकट बुक करें' या 'ट्रेन खोजें'",
      command_processed: "मैं आपका अनुरोध समझ गया। मैं आपकी मदद करता हूं।"
    }
  };

  return messages[language]?.[key] || messages.en[key];
};

// Helper function to generate voice response
const generateVoiceResponse = (response, language) => {
  switch (response.action) {
    case 'show_booking_form':
      return getLocalizedMessage('booking_form_ready', language) || 
             "I've prepared the booking form with your details. Please review and confirm.";
    case 'show_search_results':
      return `I found ${response.trains.length} trains for your journey. Let me show you the options.`;
    case 'check_pnr_status':
      return `Let me check the status for PNR ${response.pnr}.`;
    default:
      return "I'm processing your request.";
  }
};

module.exports = {
  processVoiceCommand,
  getSupportedLanguages,
  textToSpeech
};