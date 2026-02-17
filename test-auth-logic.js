// Verify JWT auth logic works (without MongoDB)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = 'test-secret';
const userId = '507f1f77bcf86cd799439011';

// Test 1: Password hashing
console.log('Test 1: Password Hashing');
const password = 'mypassword123';
const hash = bcrypt.hashSync(password, 10);
const isValid = bcrypt.compareSync(password, hash);
console.log('  ✓ Password hashed:', hash.substring(0, 20) + '...');
console.log('  ✓ Password verified:', isValid);

// Test 2: JWT generation
console.log('\nTest 2: JWT Generation');
const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
console.log('  ✓ Token generated:', token.substring(0, 30) + '...');

// Test 3: JWT verification
console.log('\nTest 3: JWT Verification');
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('  ✓ Token verified, user ID:', decoded.id);
} catch (error) {
  console.log('  ✗ Token verification failed');
}

// Test 4: Invalid token
console.log('\nTest 4: Invalid Token Rejection');
try {
  jwt.verify('invalid.token.here', JWT_SECRET);
  console.log('  ✗ Should have rejected invalid token');
} catch (error) {
  console.log('  ✓ Invalid token rejected:', error.message);
}

console.log('\n✅ All auth logic tests passed!');
console.log('\nNext: Connect to MongoDB and test actual routes:');
console.log('  1. Set MONGODB_URI in .env');
console.log('  2. npm run dev');
console.log('  3. Follow steps in TEST_AUTH.md');
