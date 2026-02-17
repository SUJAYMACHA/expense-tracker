// Quick verification script to test all dependencies
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

console.log('✓ Express loaded:', typeof express);
console.log('✓ Mongoose loaded:', typeof mongoose);
console.log('✓ JWT loaded:', typeof jwt);
console.log('✓ bcrypt loaded:', typeof bcrypt);
console.log('✓ express-validator loaded:', typeof body);

// Test JWT
const token = jwt.sign({ userId: 123 }, 'test-secret', { expiresIn: '1h' });
console.log('✓ JWT token generated:', token.substring(0, 20) + '...');

// Test bcrypt
const hash = bcrypt.hashSync('password123', 10);
console.log('✓ Password hashed:', hash.substring(0, 20) + '...');

// Test Express app
const app = express();
app.use(express.json());
app.get('/test', (req, res) => res.json({ message: 'Working!' }));

const server = app.listen(3001, () => {
  console.log('✓ Express server running on port 3001');
  console.log('\n✅ All dependencies verified and working!');
  server.close();
});
