const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// Get MongoDB URL and remove any surrounding quotes if present
let MONGODB_URL = process.env.MONGODB_URL;


// Log connection attempt
console.log("Attempting to connect to MongoDB...");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Increase socket timeout
    });
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit with failure
  }
};

connectDB();

module.exports = mongoose.connection;
