# Complete Auth Flow Test Guide

## What Now Exists:
✅ User model (bcrypt password hashing)
✅ POST /api/auth/register
✅ POST /api/auth/login  
✅ JWT middleware
✅ Protected route: GET /api/user/me

## To Test (Need MongoDB):

### Option 1: MongoDB Atlas (Free, Recommended)
1. Go to https://cloud.mongodb.com
2. Create free account
3. Create free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense_tracker
   ```

### Option 2: Docker (If Docker Desktop is running)
```bash
docker-compose up -d mongodb
npm run dev
```

### Option 3: Local MongoDB
Install MongoDB Community Server, then:
```bash
npm run dev
```

## Test the Auth Flow:

### 1. Start server
```bash
npm run dev
```

### 2. Register a user
```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Response will include JWT token:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "email": "test@example.com" }
  }
}
```

### 3. Login (get token again)
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### 4. Access protected route
```bash
curl http://localhost:3000/api/user/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

This will return your user info if token is valid, or 401 error if not.

## What This Proves:
- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens are generated on register/login
- ✅ Protected routes verify JWT
- ✅ Auth middleware works

## Next: Build Expense CRUD
Once auth works, we add:
- models/Expense.js
- routes/expenses.js
- controllers/expenseController.js
All expense routes will use `protect` middleware.
