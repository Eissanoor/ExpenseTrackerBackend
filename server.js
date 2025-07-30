const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const errorHandler = require('./middlewares/errorMiddleware');

// Load environment variables
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });
console.log('Env file path:', envPath);


// Connect to database
require('./config/db');

// Create Express app 
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// Default route
app.get('/', (req, res) => {
  res.send('Expense Tracker API is running');
});

// Error handling middleware
app.use(errorHandler);

// Start server //server updated
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 