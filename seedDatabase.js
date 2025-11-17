const mongoose = require('mongoose');
const { seedTrains } = require('./utils/seedData');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log('🌱 Seeding sample train data...');
    
    await seedTrains();
    
    console.log('🎉 Database seeded successfully with sample trains!');
    console.log('📊 You now have sample trains for Delhi-Mumbai, Delhi-Kolkata, and Delhi-Lucknow routes');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();