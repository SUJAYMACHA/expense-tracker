const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { validationResult } = require('express-validator');

exports.createExpense = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { amount, category, description, date } = req.body;

  const expense = await Expense.create({
    user: req.user._id,
    amount,
    category,
    description,
    date: date || Date.now()
  });

  res.status(201).json({
    success: true,
    data: { expense }
  });
});

exports.getExpenses = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { user: req.user._id };

  // Optional filters
  if (req.query.category) {
    query.category = req.query.category.toLowerCase();
  }

  if (req.query.startDate || req.query.endDate) {
    query.date = {};
    if (req.query.startDate) {
      query.date.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query.date.$lte = new Date(req.query.endDate);
    }
  }

  const expenses = await Expense.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Expense.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

exports.getExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(new AppError('Expense not found', 404));
  }

  // Ensure user owns this expense
  if (expense.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to access this expense', 403));
  }

  res.status(200).json({
    success: true,
    data: { expense }
  });
});

exports.updateExpense = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  let expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(new AppError('Expense not found', 404));
  }

  if (expense.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this expense', 403));
  }

  const { amount, category, description, date } = req.body;

  expense = await Expense.findByIdAndUpdate(
    req.params.id,
    { amount, category, description, date },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: { expense }
  });
});

exports.deleteExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(new AppError('Expense not found', 404));
  }

  if (expense.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to delete this expense', 403));
  }

  await expense.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
