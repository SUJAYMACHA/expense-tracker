const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const config = require('../config/env');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expire
  });
};

exports.register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }

  const user = await User.create({ email, password });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        email: user.email
      }
    }
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        email: user.email
      }
    }
  });
});
