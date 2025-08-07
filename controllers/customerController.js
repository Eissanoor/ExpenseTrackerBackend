const Customer = require('../models/customerModel');
const mongoose = require('mongoose');

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Validate organization if provided
    if (req.body.organization) {
      const Organization = require('../models/organizationModel');
      const organization = await Organization.findOne({
        _id: req.body.organization,
        user: req.user.id,
      });
      
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
      }
    }

    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'nameSearch', 'organization'];
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query object with user filter
    let queryObj = { user: req.user.id, ...reqQuery };

    // Filter by organization if provided
    if (req.query.organization) {
      queryObj.organization = req.query.organization;
    }

    // Name partial search
    if (req.query.nameSearch) {
      queryObj.name = { $regex: req.query.nameSearch, $options: 'i' };
    }

    // Finding resource
    let query = Customer.find(queryObj);

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
      query = query.sort('name');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Customer.countDocuments(queryObj);

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const customers = await query;

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
      count: customers.length,
      pagination,
      total,
      data: customers,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete customer and all related expenses
// @route   DELETE /api/customers/:id
// @access  Private
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Delete all expenses related to this customer
    const Expense = require('../models/expenseModel');
    const deleteResult = await Expense.deleteMany({
      customer: req.params.id,
      user: req.user.id,
    });

    // Delete the customer
    await customer.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: `Customer deleted along with ${deleteResult.deletedCount} related expenses`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get customer expenses
// @route   GET /api/customers/:id/expenses
// @access  Private
exports.getCustomerExpenses = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const Expense = require('../models/expenseModel');
    
    // Find expenses related to this customer
    const expenses = await Expense.find({
      customer: req.params.id,
      user: req.user.id,
    }).sort('-date');
    
    // Calculate total amount of all expenses
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalAmount,
      data: expenses,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get customers by organization ID
// @route   GET /api/customers/organization/:organizationId
// @access  Private
exports.getCustomersByOrganization = async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    
    // Validate organization exists and belongs to user
    const Organization = require('../models/organizationModel');
    const organization = await Organization.findOne({
      _id: organizationId,
      user: req.user.id,
    });
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }
    
    // Copy req.query
    const reqQuery = { ...req.query };
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'nameSearch'];
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query object with user and organization filter
    let queryObj = { 
      user: req.user.id, 
      organization: organizationId,
      ...reqQuery 
    };

    // Name partial search
    if (req.query.nameSearch) {
      queryObj.name = { $regex: req.query.nameSearch, $options: 'i' };
    }

    // Finding resource
    let query = Customer.find(queryObj);

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
      query = query.sort('name');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Customer.countDocuments(queryObj);

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const customers = await query;

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
      count: customers.length,
      pagination,
      total,
      data: customers,
      organization: organization.name
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};