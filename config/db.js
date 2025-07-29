const mongoose = require('mongoose');

// Set default JWT configuration
process.env.JWT_SECRET = process.env.JWT_SECRET || 'expense_tracker_jwt_secret_key';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

const connectDB = async () => {
  try {
    // Use a direct connection string if environment variable is not available
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 