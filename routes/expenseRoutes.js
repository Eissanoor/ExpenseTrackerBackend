const express = require('express');
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getWeeklyExpenses,
  getMonthlyExpenses,
} = require('../controllers/expenseController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// Summary and report routes
router.get('/summary', getExpenseSummary);
router.get('/weekly', getWeeklyExpenses);
router.get('/monthly', getMonthlyExpenses);

// CRUD routes
router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router; 