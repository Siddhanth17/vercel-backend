const express = require('express');
const {
  processVoiceCommand,
  getSupportedLanguages,
  textToSpeech
} = require('../controllers/voiceController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/languages', getSupportedLanguages);

// Protected routes
router.use(protect);
router.post('/process', processVoiceCommand);
router.post('/speak', textToSpeech);

module.exports = router;