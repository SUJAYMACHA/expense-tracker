const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pooling - important for serverless/Vercel
      maxPoolSize: 10,
      minPoolSize: 2,
      
      // Socket timeout
      socketTimeoutMS: 45000,
      
      // Connection timeout
      connectTimeoutMS: 10000,
      
      // Retry logic
      retryWrites: true,
      w: 'majority',
      
      // Family IPv4
      family: 4
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error.message);
    });

  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    
    // Provide helpful error message
    if (error.message.includes('MONGODB_URI')) {
      console.error('ℹ️  Make sure MONGODB_URI is set in your environment variables');
    } else if (error.message.includes('authentication failed')) {
      console.error('ℹ️  Check your MongoDB credentials in MONGODB_URI');
    } else if (error.message.includes('connect ECONNREFUSED')) {
      console.error('ℹ️  MongoDB server is not running or unreachable');
    }
    
    process.exit(1);
  }
};

// Close connection gracefully
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
  }
};

module.exports = connectDB;
module.exports.closeDB = closeDB;
