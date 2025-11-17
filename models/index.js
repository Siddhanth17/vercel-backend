// Export all models from a single file for easier imports
const User = require('./User');
const Train = require('./Train');
const Booking = require('./Booking');

module.exports = {
  User,
  Train,
  Booking
};