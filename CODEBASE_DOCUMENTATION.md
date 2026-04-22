# Expense Tracker - Complete Codebase Documentation

## 📋 Table of Contents
1. [Backend Architecture](#backend-architecture)
2. [Backend Files Explained](#backend-files-explained)
3. [Frontend Architecture](#frontend-architecture)
4. [Frontend Files Explained](#frontend-files-explained)
5. [Data Flow](#data-flow)
6. [Security & Best Practices](#security--best-practices)

---

## Backend Architecture

### Overview
The backend is a Node.js/Express REST API with MongoDB integration. It follows a **layered architecture** pattern:
- **Routes Layer**: Define endpoints and apply validation
- **Controllers Layer**: Handle requests and responses
- **Services Layer**: (Ready for expansion) Business logic
- **Models Layer**: Database schema definitions
- **Middlewares**: Cross-cutting concerns (auth, error handling, rate limiting)
- **Utils**: Helper functions and error classes

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: express-validator
- **Security**: Rate limiting, CORS

---

## Backend Files Explained

### 1. **src/server.js** - Entry Point
```javascript
Purpose: Starts the application and manages server lifecycle
Key responsibilities:
- Connects to MongoDB
- Listens on the specified port
- Handles graceful shutdown (SIGTERM, SIGINT)
- Manages error recovery
```

**Flow**:
1. Loads Express app from `app.js`
2. Connects to database via `connectDB()`
3. Starts server on configured port
4. Sets up shutdown handlers (waits 10s before force exit)
5. Logs connection status

---

### 2. **src/app.js** - Express App Configuration
```javascript
Purpose: Sets up Express middleware, routes, and error handling
```

**Components**:
- **CORS Configuration**: 
  - Allows requests from frontend URL (env: `FRONTEND_URL`)
  - Handles preflight OPTIONS requests
  - Sets credentials, methods, and headers

- **Middleware Stack** (in order):
  1. JSON parser (`express.json()`) - parses request bodies
  2. URL encoder - parses form data
  3. Rate limiter - prevents abuse
  4. Routes - API endpoints
  5. 404 handler - catches undefined routes
  6. Error handler - catch-all for errors

- **Routes Registered**:
  - `/api/health` - health check
  - `/api/auth` - authentication (register/login)
  - `/api/user` - user info
  - `/api/expenses` - CRUD operations

---

### 3. **src/config/env.js** - Environment Configuration
```javascript
Purpose: Centralized config from environment variables
```

**Exports**:
```javascript
{
  nodeEnv: 'development|production',
  port: 3000,
  mongodbUri: 'mongodb://...',
  frontendUrl: 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: '7d'
  },
  rateLimit: {
    windowMs: 900000 (15 mins),
    maxRequests: 100
  }
}
```

**Usage**: Loaded once at startup, used throughout app

---

### 4. **src/config/database.js** - MongoDB Connection
```javascript
Purpose: Manages database connection and lifecycle
```

**Key Features**:
- **Connection Options**:
  - `maxPoolSize: 10` - important for serverless (Vercel)
  - `retryWrites: true` - automatic retry on network errors
  - `connection/socket timeouts` - prevent hanging connections
  - `family: 4` - force IPv4

- **Connection Listeners**:
  - `disconnected` - logs when connection drops
  - `error` - catches connection errors

- **Exports**:
  - `connectDB()` - establishes connection
  - `closeDB()` - gracefully closes connection

**Error Handling**: Provides helpful error messages for common issues

---

### 5. **src/models/User.js** - User Schema
```javascript
Purpose: Defines User data structure and password handling
```

**Fields**:
- `email`: String, unique, required, validated with regex
- `password`: String, min 6 chars, gets hashed before save
- `createdAt`: Date, default to now

**Methods**:
- `pre('save')`: Hooks into save event
  - Hashes password using bcrypt (salt rounds: 10)
  - Only hashes if password was modified
  - Prevents rehashing on update

- `comparePassword(candidatePassword)`: 
  - Compares input with stored hash
  - Used during login verification
  - Returns boolean promise

**Security**: Passwords never stored in plain text, hashed with bcrypt

---

### 6. **src/models/Expense.js** - Expense Schema
```javascript
Purpose: Defines Expense data structure with validation
```

**Fields**:
- `user`: ObjectId reference to User (required)
- `amount`: Number, min 0, required
- `category`: String, enum of 7 categories, lowercase, required
- `description`: String, required, max 200 chars, trimmed
- `date`: Date, default to now
- `createdAt`: Date, auto-timestamp

**Categories**: 
`['food', 'transport', 'utilities', 'entertainment', 'healthcare', 'shopping', 'other']`

**Indexing**:
- `{ user: 1, date: -1 }` - speeds up queries filtering by user and sorted by date

---

### 7. **src/controllers/authController.js** - Authentication Logic
```javascript
Purpose: Handles user registration and login
```

**Exports**:

#### `register(req, res, next)`
1. Validates input (email format, password length)
2. Checks if email already exists
3. Creates new user (password auto-hashed in model hook)
4. Generates JWT token
5. Returns token + user data
6. Returns 201 (created) status

#### `login(req, res, next)`
1. Validates input
2. Finds user by email
3. Compares provided password with stored hash
4. If mismatch, returns 401 (unauthorized)
5. Generates JWT token
6. Returns token + user data
7. Returns 200 status

**JWT Token**:
- Generated with `jwt.sign({ id: userId }, secret, { expiresIn: '7d' })`
- Contains user ID for authorization
- Expires after 7 days
- Client stores in localStorage

---

### 8. **src/controllers/expenseController.js** - Expense CRUD
```javascript
Purpose: Handles all expense operations
```

**Methods**:

#### `createExpense(req, res, next)`
- Validates input (amount, category, description, date)
- Creates expense linked to authenticated user
- Returns 201 with created expense

#### `getExpenses(req, res, next)`
- **Pagination**: 
  - `page` default 1, `limit` default 10
  - `skip = (page - 1) * limit`
- **Filters** (optional):
  - `category`: Exact match, case-insensitive
  - `startDate`/`endDate`: Date range query
- **Sorting**: By date descending (newest first)
- **Query only user's expenses**: `{ user: req.user._id }`
- **Returns**: expenses array + pagination metadata (total, pages)

#### `getExpense(req, res, next)`
- Finds single expense by ID
- Verifies user owns it (authorization check)
- Returns 404 if not found
- Returns 403 if unauthorized

#### `updateExpense(req, res, next)`
- Validates input
- Checks authorization (user owns expense)
- Updates with `findByIdAndUpdate({ new: true })`
- `new: true` returns updated document
- `runValidators: true` applies schema validation

#### `deleteExpense(req, res, next)`
- Finds expense, checks authorization
- Deletes using `deleteOne()`
- Returns empty success response

---

### 9. **src/middlewares/auth.js** - JWT Authentication
```javascript
Purpose: Verifies JWT tokens and protects routes
```

**`protect` Middleware**:
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature using secret
3. Decodes token to get user ID
4. Fetches user from DB (ensures user still exists)
5. Attaches user object to `req.user`
6. Returns 401 if token missing, invalid, or expired

**Usage**: Apply to protected routes like `/api/expenses`

---

### 10. **src/middlewares/errorHandler.js** - Global Error Handling
```javascript
Purpose: Catches errors and returns standardized responses
```

**Handles**:
- **Mongoose Validation Errors**: Returns 400 with validation messages
- **Duplicate Key Errors** (11000): Returns 400 with field name
- **JWT Errors**: Returns 401 for invalid/expired tokens
- **Custom AppError**: Returns specified status code
- **Generic Errors**: Returns 500 with message

**Response Format**:
```javascript
{
  success: false,
  error: "Error message",
  stack: "..." (only in development)
}
```

**Note**: Must be last middleware in Express

---

### 11. **src/middlewares/rateLimiter.js** - Rate Limiting
```javascript
Purpose: Prevents API abuse by limiting requests per window
```

**Configuration**:
- Window: 900,000 ms (15 minutes)
- Max requests: 100 per window
- Returns 429 (Too Many Requests) when exceeded

**Benefits**: Protects from DDoS, brute force attacks

---

### 12. **src/middlewares/notFound.js** - 404 Handler
```javascript
Purpose: Catches requests to undefined routes
```

**Response**: 
```javascript
{
  success: false,
  error: "Route not found"
}
```

---

### 13. **src/utils/asyncHandler.js** - Error Wrapper
```javascript
Purpose: Wraps async route handlers to catch errors automatically
```

**How it works**:
```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

**Benefits**:
- No need for try-catch in every controller
- Errors automatically passed to error handler
- Cleaner controller code

---

### 14. **src/utils/AppError.js** - Custom Error Class
```javascript
Purpose: Standardized error creation with status codes
```

**Properties**:
- `message`: Error description
- `statusCode`: HTTP status code
- `status`: 'fail' (4xx) or 'error' (5xx)
- `isOperational`: Marks as handled error

**Usage**:
```javascript
return next(new AppError('Email not found', 404));
```

---

### 15. **src/routes/auth.js** - Auth Endpoints
```javascript
Purpose: Defines authentication routes with validation
```

**Routes**:
- `POST /register`: Create account
  - Validation: valid email, password 6+ chars
  
- `POST /login`: Login
  - Validation: valid email, password present

**Validation Library**: express-validator
- `body()` - validates request body fields
- `.isEmail()` - checks email format
- `.isLength()` - checks string length
- `.notEmpty()` - required field
- `.withMessage()` - custom error message

---

### 16. **src/routes/expenses.js** - Expense Endpoints
```javascript
Purpose: Defines CRUD routes with protect middleware
```

**Structure**:
```javascript
router.use(protect); // All routes require auth
```

**Routes**:
- `POST /`: Create (validates: amount, category, description, date)
- `GET /`: List with filtering & pagination
- `GET /:id`: Get single expense
- `PUT /:id`: Update (validates input)
- `DELETE /:id`: Delete

**Validation**:
- Amount: Must be positive number (isFloat)
- Category: Must be from enum list (isIn)
- Description: Required, max 200 chars
- Date: Optional, must be valid ISO8601

---

### 17. **src/routes/user.js** - User Endpoints
```javascript
Purpose: User profile operations
```

**Routes**:
- `GET /me`: Get current user info (protected)
  - Returns: id, email, createdAt
  - Uses `req.user` from auth middleware

---

### 18. **src/routes/health.js** - Health Check
```javascript
Purpose: Self-diagnostic endpoint
```

**Response**: 
```javascript
{
  status: 'server is running'
}
```

**Use Case**: Monitoring, deployment verification

---

## Frontend Architecture

### Overview
Single Page Application (SPA) with React Router, state management via React Query & Context API:
- **Pages**: Full-page routes (Login, Register, Dashboard, Expenses)
- **Components**: Reusable UI elements
- **API Layer**: Axios client with interceptors
- **Context**: Global auth state
- **Styling**: TailwindCSS + inline animations

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build**: Vite (ultra-fast)
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **State Management**: @tanstack/react-query (server state) + Context API (auth)
- **HTTP Client**: Axios
- **Forms**: React Hook Form (in ExpenseModal)
- **Charts**: Recharts
- **Notifications**: Sonner (toast)
- **Animations**: Framer Motion

---

## Frontend Files Explained

### 1. **src/main.tsx** - Entry Point
```typescript
Purpose: Mounts React app to DOM
```

**Flow**:
1. Finds element with id "root" in HTML
2. Renders App component with React.StrictMode
3. Enables strict mode checks in development

---

### 2. **src/App.tsx** - Root Component
```typescript
Purpose: Sets up routing and global providers
```

**Providers** (nested):
1. **QueryClientProvider**: React Query for server state
   - Config: no refetch on window focus, retry once on error
   
2. **AuthProvider**: Context for authentication
   - Provides: user, token, login, register, logout
   
3. **BrowserRouter**: React Router setup
   
4. **Toaster**: Toast notification system (position: top-right)

**Routes**:
- `/login` → LoginPage
- `/register` → RegisterPage
- `/dashboard` → ProtectedRoute → DashboardPage
- `/expenses` → ProtectedRoute → ExpensesPage
- `/` → Redirects to /dashboard

---

### 3. **src/api/client.ts** - Axios Instance
```typescript
Purpose: Centralized HTTP client with interceptors
```

**Setup**:
- Base URL: from `VITE_API_URL` env or `http://localhost:3000/api`
- Default headers: Content-Type: application/json

**Request Interceptor**:
- Adds JWT token to Authorization header if present
- Format: `Authorization: Bearer <token>`

**Response Interceptor**:
- If 401 (Unauthorized):
  - Clears localStorage (token, user)
  - Redirects to /login
  - Handles token expiration gracefully

---

### 4. **src/api/auth.ts** - Authentication API
```typescript
Purpose: Authentication API calls with types
```

**Types**:
- `RegisterData`: { email, password }
- `LoginData`: { email, password }
- `AuthResponse`: { token, user }

**Methods**:
- `authAPI.register(data)` - POST /auth/register
- `authAPI.login(data)` - POST /auth/login
- `authAPI.getProfile()` - GET /user/me

**All**: Return typed axios promises

---

### 5. **src/api/expenses.ts** - Expenses API
```typescript
Purpose: Expense CRUD API calls
```

**Types**:
- `Expense`: Full expense object with _id
- `CreateExpenseData`: Create/update payload
- `ExpenseListResponse`: Paginated list response

**Methods**:
- `getExpenses(params?)`: GET with filters
  - Params: page, limit, category, startDate, endDate
  
- `getExpense(id)`: GET single
- `createExpense(data)`: POST
- `updateExpense(id, data)`: PUT
- `deleteExpense(id)`: DELETE

---

### 6. **src/context/AuthContext.tsx** - Auth State
```typescript
Purpose: Global authentication state management
```

**State**:
- `user`: Current user object (null if not logged in)
- `token`: JWT token (null if not logged in)
- `isLoading`: Initial load check

**Methods**:
- `login(email, password)`:
  - Calls API, stores token & user in localStorage
  - Shows success toast
  
- `register(email, password)`:
  - Auto-logs in after registration
  - Same flow as login
  
- `logout()`:
  - Clears localStorage
  - Resets state
  - Shows success toast

**Hook**: `useAuth()` returns context (throws if not in provider)

**Persistence**: Checks localStorage on mount to restore session

---

### 7. **src/components/ProtectedRoute.tsx** - Private Routes
```typescript
Purpose: Guards routes that require authentication
```

**Logic**:
1. If loading: Shows spinner
2. If no token: Redirects to /login
3. If has token: Renders children

**Usage**: Wrap page components to ensure only authenticated users access them

---

### 8. **src/components/ExpenseModal.tsx** - Expense Form
```typescript
Purpose: Reusable modal for creating/editing expenses
```

**Props**:
- `isOpen`: Controls visibility
- `onClose`: Callback to close
- `expense?`: Optional expense to edit (undefined = create mode)

**State**:
- `amount`, `category`, `description`, `date`

**Features**:
- **Edit Mode**: Populates fields with existing expense
- **Create Mode**: Defaults to today's date
- **Categories**: Dropdown with 7 options
- **Mutations**:
  - `createMutation`: Creates new expense
  - `updateMutation`: Updates existing

**UI**:
- Mobile-optimized (slides up from bottom on mobile)
- Form validation before submit
- Success/error toasts

---

### 9. **src/pages/LoginPage.tsx** - Login Form
```typescript
Purpose: User login interface
```

**Features**:
- Email & password inputs
- Password visibility toggle
- Form validation
- Loading state during submission
- Link to register page
- Beautiful gradient background
- Glassmorphism card design
- Feature badges (Secure, Fast, Analytics)

**Flow**:
1. User enters credentials
2. Submits form
3. Calls `login()` from AuthContext
4. On success: navigates to /dashboard
5. On error: shows error toast

**Styling**: Dark mode with purple/blue gradients

---

### 10. **src/pages/RegisterPage.tsx** - Registration Form
```typescript
Purpose: User account creation interface
```

**Features**:
- Email input
- Password input with visibility toggle
- Confirm password field
- Password validation (6+ chars)
- Password match verification
- Animated background elements
- Links to login page

**Validation**:
- Checks passwords match
- Checks min length 6
- Calls validation on server too

**Styling**: Similar to LoginPage with purple/pink gradients

---

### 11. **src/pages/DashboardPage.tsx** - Home Dashboard
```typescript
Purpose: Overview of expenses with charts and stats
```

**Query**: Fetches all expenses with `limit: 100`

**Sections**:

#### Header
- Logo and user email
- "View All" button → navigate to expenses
- "Add Expense" button → opens modal
- Logout button

#### Stats Cards (3 cards)
- Total Expenses: Sum of all amounts
- Total Transactions: Count of expenses
- Average Expense: Total / count

#### Pie Chart
- Shows breakdown by category
- 7 colors (one per category)
- Percentages shown
- Interactive tooltips
- Falls back to "No expenses" message

#### Recent Expenses List
- Shows 5 most recent
- Category badges with colors
- Amounts
- Dates formatted
- Action buttons (edit, delete)

**Loading**: Shows spinner while fetching

---

### 12. **src/pages/ExpensesPage.tsx** - Full Expense List
```typescript
Purpose: Complete expense management with pagination
```

**Features**:

#### Header
- Back button to dashboard
- "Add Expense" button
- Logout button

#### Search & Filter
- Search by description (text input)
- Filter by category (dropdown)
- Pagination (page indicator)

#### Display
- Table/card format depending on screen size
- Shows: date, category, description, amount, actions
- Edit button: opens modal with expense data
- Delete button: with confirmation

#### Stats
- Total amount (filtered)
- Total count (filtered)
- Average (filtered)

**Pagination**:
- Shows current page
- Next/previous buttons
- Total pages indicator

**Mutations**:
- `deleteMutation`: Handles deletion with confirmation
- Invalidates cache to refresh list

---

---

## Data Flow

### User Registration Flow
```
1. User fills RegisterPage form
2. Click "Create Account"
3. Frontend calls authAPI.register(email, password)
4. Axios requests POST /api/auth/register
5. Backend validates with express-validator
6. Checks for duplicate email
7. Creates User model (password hashed in pre-save hook)
8. Generates JWT token
9. Returns { token, user }
10. Frontend stores in localStorage
11. AuthContext updates state (user, token)
12. Navigates to /dashboard
```

### Login Flow
```
1. User fills LoginPage form
2. Click "Sign In"
3. Frontend calls authAPI.login(email, password)
4. Axios requests POST /api/auth/login
5. Backend finds user by email
6. Compares passwords using bcrypt.compare()
7. If invalid: returns 401 error
8. If valid: generates JWT

9. Frontend stores token
10. Updates AuthContext
11. Navigates to /dashboard
```

### Create Expense Flow
```
1. User on DashboardPage clicks "+ Add Expense"
2. ExpenseModal opens
3. User fills form (amount, category, description, date)
4. Click "Save"
5. Frontend validates form data
6. Calls expenseAPI.createExpense(data)
7. Axios adds auth header (from localStorage token)
8. POST /api/expenses with JSON body
9. Backend auth middleware verifies token → attaches req.user
10. Controller validates input with express-validator
11. Creates Expense model with user._id field
12. Saves to MongoDB
13. Returns expense object
14. Frontend invalidates expenses query cache
15. Toast shows "Created successfully"
16. Modal closes
17. DashboardPage refetches and updates
```

### Get Expenses with Pagination
```
1. DashboardPage mounts
2. React Query runs queryFn for ['expenses']
3. Frontend calls expenseAPI.getExpenses({ limit: 100 })
4. Axios adds auth header
5. GET /api/expenses?limit=100
6. Backend auth middleware verifies token
7. Controller queries: Expense.find({ user: req.user._id })
8. Applies sorting (date: -1)
9. Returns { expenses: [...], pagination: {...} }
10. React Query caches result
11. Frontend renders list
12. If cache expires or user requests: refetches
```

### Update Expense Flow
```
1. User clicks edit on expense in ExpensesPage
2. ExpenseModal opens with expense data prepopulated
3. User modifies fields
4. Click "Save"
5. Calls expenseAPI.updateExpense(id, data)
6. PUT /api/expenses/:id
7. Backend auth middleware verifies token
8. Controller checks authorization (user owns expense)
9. Updates document with new data
10. Runs schema validators
11. Returns updated expense
12. Frontend invalidates cache
13. List refreshes with new data
```

### Delete Expense Flow
```
1. User clicks delete on expense
2. Confirmation dialog appears
3. Click "Delete"
4. expenseAPI.deleteExpense(id)
5. DELETE /api/expenses/:id
6. Backend auth middleware verifies
7. Checks authorization
8. Calls deleteOne()
9. Returns success
10. Frontend invalidates cache
11. Expense removed from list
```

### Protected Route Flow
```
1. User tries to access /dashboard
2. ProtectedRoute checks token
3. If loading: shows spinner
4. If no token: redirects to /login
5. If has token: renders DashboardPage
6. If token expired and API 401: 
   - Response interceptor clears localStorage
   - Redirects to /login
   - User forced to re-login
```

---

## Security & Best Practices

### Backend Security

1. **Password Hashing**
   - bcryptjs with 10 salt rounds
   - Never stores plain text passwords
   - Compared during login with bcrypt.compare()

2. **JWT Authentication**
   - Secret key stored in env variable
   - Token expires after 7 days
   - Verified on every protected route
   - Decoded to extract user ID

3. **Input Validation**
   - express-validator on all endpoints
   - Checks email format, password length, categories
   - Sanitizes descriptions (trim, max length)
   - MongoDB type checking in schema

4. **Authorization**
   - Users can only access their own expenses
   - `expense.user.toString() === req.user._id.toString()`
   - Returns 403 (Forbidden) if unauthorized

5. **Rate Limiting**
   - 100 requests per 15 minutes
   - Prevents brute force attacks
   - Returns 429 (Too Many Requests)

6. **CORS**
   - Only allows requests from frontend URL
   - Prevents cross-origin attacks
   - Handles preflight OPTIONS requests

7. **Error Handling**
   - Catches all errors globally
   - Development: includes stack trace
   - Production: only safe messages
   - No sensitive data leaked

### Frontend Security

1. **Token Storage**
   - Stored in localStorage
   - Accessible to XSS attacks (trade-off for simplicity)
   - Production: consider httpOnly cookies

2. **Protected Routes**
   - ProtectedRoute component prevents unauthorized access
   - Redirects to login if token missing

3. **Request Interceptors**
   - Automatically includes token in headers
   - Consistent authentication flow

4. **Response Interceptors**
   - Handles 401 errors
   - Auto-redirects to login on expiration
   - Clears invalid tokens

5. **Input Validation**
   - Form validation before submission
   - Server-side validation double-checks
   - Prevents invalid data in database

6. **Environmental Variables**
   - API URL in `.env.local` (not in code)
   - Production values different from development

### Best Practices Implemented

#### Backend
- ✅ Separation of concerns (routes, controllers, models)
- ✅ Async/await with error handling (asyncHandler)
- ✅ Custom error class (AppError)
- ✅ Middleware for cross-cutting concerns
- ✅ Centralized config (env.js)
- ✅ Request validation
- ✅ Database indexing for performance
- ✅ Graceful shutdown handling
- ✅ Connection pooling for scalability
- ✅ Proper HTTP status codes

#### Frontend
- ✅ Component-based architecture
- ✅ React Query for server state (caching, pagination)
- ✅ Context API for auth state
- ✅ Reusable components (ExpenseModal, ProtectedRoute)
- ✅ Responsive design (mobile-first)
- ✅ Error handling with toasts
- ✅ Loading states
- ✅ TypeScript for type safety
- ✅ Environment variables for config
- ✅ Smooth animations and UX

---

## Deployment Checklist

### Backend (Node.js on Vercel/Render/Railway)
- [ ] Set environment variables (MONGODB_URI, JWT_SECRET, FRONTEND_URL)
- [ ] Install dependencies: `npm install`
- [ ] Test: `npm start`
- [ ] Configure `.vercelrc` or similar
- [ ] Deploy

### Frontend (React on Vercel/Netlify)
- [ ] Set environment variable: `VITE_API_URL=<backend-url>`
- [ ] Build: `npm run build`
- [ ] Deploy `dist/` folder
- [ ] Configure domain/SSL

---

