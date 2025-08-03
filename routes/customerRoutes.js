const express = require('express');
const {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerExpenses
} = require('../controllers/customerController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(deleteCustomer);

router.route('/:id/expenses')
  .get(getCustomerExpenses);

module.exports = router;