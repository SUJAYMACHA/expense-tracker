const express = require('express');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expenses');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const rateLimiter = require('./middlewares/rateLimiter');

const app = express();

// ============================================
// ⚠️ CORS CONFIGURATION - MUST BE FIRST
// ============================================

// Get frontend URL from environment or use defaults
const frontendUrl = process.env.FRONTEND_URL?.trim() || 'http://localhost:5173';

console.log('='.repeat(60));
console.log('🌐 CORS Configuration:');
console.log('   FRONTEND_URL env var:', process.env.FRONTEND_URL);
console.log('   Using:', frontendUrl);
console.log('='.repeat(60));

// CORS middleware - MUST be applied before routes
app.all('*', (req, res, next) => {
  const origin = req.get('origin');
  
  // Always set CORS headers for the configured frontend URL
  res.set('Access-Control-Allow-Origin', frontendUrl);
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.set('Access-Control-Max-Age', '86400');
  
  // Answer OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS preflight request handled');
    return res.status(200).end();
  }
  
  next();
});

// ============================================
// JSON & URL PARSERS
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// RATE LIMITER
// ============================================
app.use(rateLimiter);

// ============================================
// ROUTES
// ============================================
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/expenses', expenseRoutes);

// ============================================
// ERROR HANDLING - LAST
// ============================================
app.use(notFound);
app.use(errorHandler);

module.exports = app;
