# Expense Tracker API

A clean, production-ready REST API for tracking personal expenses with user authentication.

## Features

- User authentication with JWT
- CRUD operations for expenses
- Expense categorization and filtering
- Pagination support
- Rate limiting
- Input validation
- Centralized error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Security**: Rate limiting, CORS

## Prerequisites

- Node.js 18+ 
- MongoDB 5+
- npm or yarn

## Local Setup

### Without Docker

1. Clone the repository
```bash
git clone <repository-url>
cd expense-tracker-api
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB locally

5. Run the application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### With Docker

```bash
# Start both API and MongoDB
docker-compose up

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/expense_tracker |
| `JWT_SECRET` | Secret key for JWT | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## API Overview

### Health Check
- `GET /api/health` - Check API status

### Authentication (Coming soon)
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and get token

### Expenses (Coming soon)
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - List expenses (with pagination)
- `GET /api/expenses/:id` - Get single expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── models/          # Database models
├── routes/          # API routes
├── middlewares/     # Custom middleware
├── services/        # Business logic
├── utils/           # Helper functions
├── app.js           # Express app setup
└── server.js        # Entry point
```

## Development

```bash
# Run linter
npm run lint

# Run tests (when implemented)
npm test
```

## License

MIT
