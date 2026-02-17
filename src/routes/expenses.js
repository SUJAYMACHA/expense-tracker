const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');

const router = express.Router();

// All routes require authentication
router.use(protect);

const expenseValidation = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .isIn(['food', 'transport', 'utilities', 'entertainment', 'healthcare', 'shopping', 'other'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date')
];

router.post('/', expenseValidation, createExpense);
router.get('/', getExpenses);
router.get('/:id', getExpense);
router.put('/:id', expenseValidation, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
