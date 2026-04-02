const express = require('express');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expenses');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const rateLimiter = require('./middlewares/rateLimiter');

const app = express();

// ⚠️ CORS MUST BE FIRST BEFORE ALL OTHER MIDDLEWARE
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('🌐 FRONTEND_URL:', frontendUrl);
console.log('✅ CORS will be enabled for:', frontendUrl);

// CORS Headers for ALL requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', frontendUrl);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  res.header('Access-Control-Max-Age', '86400');
  
  console.log(`📍 ${req.method} ${req.path} - CORS headers set`);
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ OPTIONS preflight handled for ${req.path}`);
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/expenses', expenseRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
