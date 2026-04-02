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
// ⚠️ CORS MIDDLEWARE - MUST BE FIRST
// ============================================
const allowedOrigins = [
  'https://m-expense-tracker.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('✅ Allowed CORS Origins:', allowedOrigins);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cookie');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
  }
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// ============================================
// JSON PARSER - BEFORE ROUTES
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
