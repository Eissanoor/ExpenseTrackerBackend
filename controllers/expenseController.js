const Expense = require('../models/expenseModel');
const mongoose = require('mongoose');

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;

    // Validate customer if provided
    if (req.body.customer) {
      const Customer = require('../models/customerModel');
      const customer = await Customer.findOne({
        _id: req.body.customer,
        user: req.user.id
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }
    }

    const expense = await Expense.create(req.body);

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all expenses with pagination and filtering
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'startDate', 'endDate', 'week', 'month', 'year', 'amountEquals', 'amountGreaterThan', 'amountLessThan', 'itemSearch', 'customerId'];
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query object with user filter
    let queryObj = { user: req.user.id, ...reqQuery };

    // Item partial search
    if (req.query.itemSearch) {
      queryObj.item = { $regex: req.query.itemSearch, $options: 'i' };
    }
    
    // Filter by customer
    if (req.query.customerId) {
      queryObj.customer = req.query.customerId;
    }

    // Date filtering
    if (req.query.startDate && req.query.endDate) {
      queryObj.date = {
        $gte: new Date(req.query.startDate).toISOString(),
        $lte: new Date(req.query.endDate).toISOString()
      };
    } else if (req.query.startDate) {
      queryObj.date = { $gte: new Date(req.query.startDate).toISOString() };
    } else if (req.query.endDate) {
      queryObj.date = { $lte: new Date(req.query.endDate).toISOString() };
    } else if (req.query.week && req.query.year) {
      // Week filtering (week number and year)
      const year = parseInt(req.query.year);
      const week = parseInt(req.query.week);
      
      // Calculate the start date of the specified week
      const startDate = new Date(year, 0, 1 + (week - 1) * 7);
      // Adjust to the nearest Sunday if not already
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - dayOfWeek);
      
      // Calculate the end date (start date + 6 days)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      queryObj.date = { $gte: startDate.toISOString(), $lte: endDate.toISOString() };
    } else if (req.query.month && req.query.year) {
      // Month filtering (month number and year)
      const year = parseInt(req.query.year);
      const month = parseInt(req.query.month) - 1; // JavaScript months are 0-indexed
      
      // First day of the specified month
      const startDate = new Date(year, month, 1);
      
      // First day of the next month
      const endDate = new Date(year, month + 1, 0);
      
      queryObj.date = { $gte: startDate.toISOString(), $lte: endDate.toISOString() };
    }

    // Amount filtering
    if (req.query.amountEquals) {
      queryObj.amount = parseFloat(req.query.amountEquals);
    } else {
      // Create amount filter object if needed
      const amountFilter = {};
      
      if (req.query.amountGreaterThan) {
        amountFilter.$gte = parseFloat(req.query.amountGreaterThan);
      }
      
      if (req.query.amountLessThan) {
        amountFilter.$lte = parseFloat(req.query.amountLessThan);
      }
      
      // Add amount filter to query object if any amount filters were specified
      if (Object.keys(amountFilter).length > 0) {
        queryObj.amount = amountFilter;
      }
    }

    // Finding resource
    let query = Expense.find(queryObj);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-date');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Expense.countDocuments(queryObj);

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const expenses = await query.populate('customer', 'name');

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: expenses.length,
      pagination,
      total,
      data: expenses,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('customer', 'name');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get expense summary (total amount)
// @route   GET /api/expenses/summary
// @access  Private
exports.getExpenseSummary = async (req, res) => {
  try {
    // Create filter object
    const filter = { user: req.user.id };

    // Date filtering
    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate).toISOString(),
        $lte: new Date(req.query.endDate).toISOString()
      };
    } else if (req.query.startDate) {
      filter.date = { $gte: new Date(req.query.startDate).toISOString() };
    } else if (req.query.endDate) {
      filter.date = { $lte: new Date(req.query.endDate).toISOString() };
    }

    // Calculate total amount
    const result = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const total = result.length > 0 ? result[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        total
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get weekly expense report
// @route   GET /api/expenses/weekly
// @access  Private
exports.getWeeklyExpenses = async (req, res) => {
  try {
    // Get the start date (7 days ago)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Create filter object
    const filter = {
      user: req.user.id,
      date: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
    };

    // Get daily totals
    const dailyTotals = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $substr: ['$date', 0, 10] }, // Extract YYYY-MM-DD from ISO string
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate total
    const total = dailyTotals.reduce((acc, day) => acc + day.total, 0);

    res.status(200).json({
      success: true,
      data: {
        period: {
          start: startDate,
          end: endDate
        },
        total,
        dailyTotals
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get monthly expense report
// @route   GET /api/expenses/monthly
// @access  Private
exports.getMonthlyExpenses = async (req, res) => {
  try {
    // Get the start date (30 days ago)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Create filter object
    const filter = {
      user: req.user.id,
      date: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
    };

    // Get daily totals
    const dailyTotals = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $substr: ['$date', 0, 10] }, // Extract YYYY-MM-DD from ISO string
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate total
    const total = dailyTotals.reduce((acc, day) => acc + day.total, 0);

    res.status(200).json({
      success: true,
      data: {
        period: {
          start: startDate,
          end: endDate
        },
        total,
        dailyTotals
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}; 

// @desc    Get total amount of expenses (no filtering)
// @route   GET /api/expenses/total
// @access  Private
exports.getTotalAmount = async (req, res) => {
  try {
    // Get the user ID from the request
    const userId = req.user.id;
    
    // Check if organization ID is provided in query params
    const organizationId = req.query.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }
    
    // Verify the organization exists and belongs to the requesting user
    const Organization = require('../models/organizationModel');
    const organization = await Organization.findOne({
      _id: organizationId,
      user: userId
    });
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or you do not have access to it'
      });
    }
    
    // Find all customers associated with this organization
    const Customer = require('../models/customerModel');
    const customers = await Customer.find({ 
      organization: organizationId 
    });
    
    // Get customer IDs
    const customerIds = customers.map(customer => customer._id);
    
    // If no customers found, return zero totals
    if (customerIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          total: 0,
          count: 0,
          organizationId
        }
      });
    }
    
    // Aggregation to sum all expenses for customers in this organization
    const result = await Expense.aggregate([
      { 
        $match: { 
          customer: { $in: customerIds.map(id => new mongoose.Types.ObjectId(id)) }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: "$amount" }, 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    // Get the total or default to 0 if no expenses found
    const total = result.length > 0 ? result[0].total : 0;
    const count = result.length > 0 ? result[0].count : 0;
    
    res.status(200).json({
      success: true,
      data: {
        total,
        count,
        organizationId
      }
    });
  } catch (error) {
    console.error('Error in getTotalAmount:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}; 