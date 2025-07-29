const mongoose = require('mongoose');

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