const Joi = require('joi');

// User registration validation schema
const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Name should only contain letters and spaces',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid Indian phone number (10 digits starting with 6-9)'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    })
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Profile update validation schema
const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.pattern.base': 'Name should only contain letters and spaces',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .messages({
      'string.pattern.base': 'Please provide a valid Indian phone number (10 digits starting with 6-9)'
    }),
  
  preferences: Joi.object({
    language: Joi.string()
      .valid('en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'or', 'pa'),
    
    notifications: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean()
    }),
    
    accessibility: Joi.object({
      voiceAssistant: Joi.boolean(),
      largeText: Joi.boolean(),
      highContrast: Joi.boolean()
    })
  })
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters',
      'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, and one number'
    })
});

// Forgot password validation schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address'
    })
});

// Reset password validation schema
const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters',
      'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, and one number'
    })
});

// Booking validation schema
const bookingSchema = Joi.object({
  trainId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid train ID format'
    }),
  
  from: Joi.object({
    stationCode: Joi.string().required(),
    stationName: Joi.string().required()
  }).required(),
  
  to: Joi.object({
    stationCode: Joi.string().required(),
    stationName: Joi.string().required()
  }).required(),
  
  journeyDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': 'Journey date cannot be in the past'
    }),
  
  passengers: Joi.array()
    .items(
      Joi.object({
        name: Joi.string()
          .min(2)
          .max(50)
          .pattern(/^[a-zA-Z\s]+$/)
          .required(),
        age: Joi.number()
          .integer()
          .min(1)
          .max(120)
          .required(),
        gender: Joi.string()
          .valid('Male', 'Female', 'Other')
          .required(),
        berthPreference: Joi.string()
          .valid('Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'No Preference')
          .default('No Preference')
      })
    )
    .min(1)
    .max(6)
    .required()
    .messages({
      'array.min': 'At least one passenger is required',
      'array.max': 'Maximum 6 passengers allowed per booking'
    }),
  
  class: Joi.object({
    type: Joi.string()
      .valid('1A', '2A', '3A', 'CC', 'SL', '2S', 'GEN')
      .required(),
    name: Joi.string()
      .valid('First AC', 'Second AC', 'Third AC', 'Chair Car', 'Sleeper', 'Second Sitting', 'General')
      .required()
  }).required(),
  
  contactDetails: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).required()
  }).required()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors,
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  bookingSchema
};