const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const config = require('../config/env');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return next(new AppError('User no longer exists', 401));
    }
    
    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401));
  }
});

module.exports = { protect };
