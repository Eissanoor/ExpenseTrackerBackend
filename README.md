# Expense Tracker API

A Node.js API for tracking personal expenses with MongoDB.

## Features

- User authentication (register, login)
- CRUD operations for expenses
- Pagination and filtering
- Expense reporting (weekly, monthly, custom date range)
- Category-based expense tracking
- Total expense calculations

## Setup

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   ```
4. Start the server
   ```
   npm start
   ```

## API Endpoints

### Authentication

- **Register User**: `POST /api/users/register`
  - Body: `{ "username": "user1", "email": "user1@example.com", "password": "password123" }`

- **Login User**: `POST /api/users/login`
  - Body: `{ "email": "user1@example.com", "password": "password123" }`

- **Get Current User**: `GET /api/users/me`
  - Header: `Authorization: Bearer YOUR_TOKEN`

### Expenses

- **Create Expense**: `POST /api/expenses`
  - Header: `Authorization: Bearer YOUR_TOKEN`
  - Body: `{ "item": "Groceries", "description": "Weekly shopping", "amount": 50.25, "category": "food" }`

- **Get All Expenses**: `GET /api/expenses`
  - Header: `Authorization: Bearer YOUR_TOKEN`
  - Query Parameters:
    - Pagination: `page=1&limit=10`
    - Sorting: `sort=date` or `sort=-amount`
    - Filtering: `category=food`
    - Date Range: `startDate=2023-01-01&endDate=2023-01-31`

- **Get Single Expense**: `GET /api/expenses/:id`
  - Header: `Authorization: Bearer YOUR_TOKEN`

- **Update Expense**: `PUT /api/expenses/:id`
  - Header: `Authorization: Bearer YOUR_TOKEN`
  - Body: `{ "amount": 45.75 }`

- **Delete Expense**: `DELETE /api/expenses/:id`
  - Header: `Authorization: Bearer YOUR_TOKEN`

### Reports

- **Get Expense Summary**: `GET /api/expenses/summary`
  - Header: `Authorization: Bearer YOUR_TOKEN`
  - Query Parameters:
    - Date Range: `startDate=2023-01-01&endDate=2023-01-31`
    - Category: `category=food`

- **Get Weekly Expenses**: `GET /api/expenses/weekly`
  - Header: `Authorization: Bearer YOUR_TOKEN`

- **Get Monthly Expenses**: `GET /api/expenses/monthly`
  - Header: `Authorization: Bearer YOUR_TOKEN`

## Categories

Available expense categories:
- food
- transportation
- entertainment
- utilities
- shopping
- health
- education
- other 