# KrishiOra

> A modern agriculture management platform designed to help farmers manage farm operations, crops, expenses, and agricultural activities through a centralized digital system.

KrishiOra is being developed as a full-stack agriculture management platform with a strong focus on **secure backend architecture, structured data management, scalable APIs, and actionable agricultural insights**.

The project is being developed incrementally, with the backend foundation and expense management module currently implemented and stabilized before moving toward the frontend application.

---

## Overview

Managing agricultural activities often involves maintaining information about farms, crops, expenses, payments, and day-to-day operations across different places or informal records.

KrishiOra aims to bring these activities into a single platform where users can:

- Manage their farms
- Maintain agricultural records
- Track farm-related expenses
- Filter and analyze expenses
- View expense summaries
- Identify high-value expenses
- Build a foundation for future agricultural insights

The long-term goal is to evolve KrishiOra into a reliable digital platform that can provide farmers with better visibility into their farm operations and financial decisions.

---

## Current Development Status

### Backend — Implemented

The backend foundation and Expense Management module are currently implemented and tested.

| Module | Status |
|---|---|
| Backend Architecture | Completed |
| Authentication | Implemented |
| Farm Management | Implemented |
| Farm Ownership Verification | Implemented |
| Expense Management | Completed |
| Expense CRUD Operations | Completed |
| Expense Filtering | Completed |
| Date Filtering | Completed |
| Date Range Filtering | Completed |
| Expense Summary | Completed |
| Top-K Expense Analysis | Completed |
| Frontend | In Development |

---

# Core Features

## 1. Authentication

KrishiOra uses authenticated users to securely access their farm-related resources.

The backend identifies the authenticated user and uses the user identity while processing farm and expense operations.

---

## 2. Farm Management

Farm resources are associated with authenticated users.

Before performing expense-related operations, the backend verifies that the authenticated user has ownership/access to the requested farm.

This provides an additional authorization layer between the user and farm-specific data.

---

## 3. Expense Management

The Expense Management module is currently the most developed backend feature.

Users can manage expenses associated with a specific farm.

### Supported Operations

- Create an expense
- Fetch all expenses
- Fetch a single expense
- Update an expense
- Delete an expense

Each expense can contain information such as:

- Category
- Item name
- Description
- Quantity
- Unit
- Unit price
- Total amount
- Expense date
- Payment status
- Payment method
- Notes
- Farm association
- User association

---

# Expense Filtering

The Expense API supports multiple filters that can be combined to retrieve specific expense records.

### Available Filters

#### Category

Example:

```text
category=Fertilizer
```

#### Payment Status

Example:

```text
payment_status=PAID
```

#### Payment Method

Example:

```text
payment_method=UPI
```

#### Exact Expense Date

Example:

```text
expense_date=2026-08-24
```

#### Date Range

Example:

```text
from_date=2026-08-01
to_date=2026-08-24
```

### Combined Example

```http
GET /api/farms/{farmId}/expenses?category=Fertilizer&payment_status=PAID&payment_method=UPI&from_date=2026-08-01&to_date=2026-08-24
```

Filters are applied at the database query level so that only relevant records are returned.

---

# Expense Analytics

KrishiOra does not only store expenses. The backend also performs calculations on the retrieved expense data.

The Expense API currently provides:

### Total Expense

The total amount spent across the selected expense records.

### Average Expense

The average value of the selected expenses.

### Highest Expense

The highest individual expense in the selected dataset.

### Lowest Expense

The lowest individual expense in the selected dataset.

### Category Summary

Expenses are grouped by category.

Example:

```json
{
  "Fertilizer": 7250,
  "Seeds": 3200,
  "Equipment": 4500
}
```

### Payment Status Summary

Expenses are grouped according to their payment status.

Example:

```json
{
  "PAID": 8500,
  "PENDING": 3200
}
```

### Payment Method Summary

Expenses are grouped according to their payment method.

Example:

```json
{
  "UPI": 6500,
  "CASH": 3000,
  "BANK_TRANSFER": 2200
}
```

These calculations provide the foundation for the future analytics dashboard.

---

# Top-K Expense Analysis

The backend also includes a **Top-K Expense Analysis** feature.

The purpose of this feature is to identify the highest-value expenses from a farm's expense records.

For example:

```text
Top 3 Expenses

1. Equipment      ₹12,000
2. Fertilizer      ₹8,500
3. Seeds           ₹5,200
```

The implementation introduces an algorithmic component into the backend rather than treating the Expense module as a simple CRUD system.

This feature can later be extended for:

- Highest expenses by category
- Highest expenses within a date range
- Top expenses for a particular crop
- Expense trend analysis
- Cost optimization insights

---

# Backend Architecture

KrishiOra follows a layered backend architecture to keep responsibilities separated.

```text
Client
  │
  ▼
Routes
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ▼
Supabase
  │
  ▼
PostgreSQL
```

### Routes

Responsible for defining API endpoints and connecting them to controllers.

### Controllers

Responsible for:

- Receiving HTTP requests
- Reading parameters and query values
- Validating request-level input
- Calling service functions
- Returning HTTP responses

### Services

Responsible for the core business logic.

The service layer handles:

- Farm ownership verification
- Database queries
- Expense filtering
- Expense calculations
- Expense summaries
- Top-K analysis

### Database

Supabase is currently used as the backend database platform with PostgreSQL.

---

# Technology Stack

## Backend

- Node.js
- Express.js
- TypeScript

## Database & Backend Services

- Supabase
- PostgreSQL

## API Testing

- Postman

## Version Control

- Git
- GitHub

## Frontend

Frontend development is planned as the next major development phase.

---

# Project Structure

The project is organized as a full-stack application.

```text
KrishiOra/
│
├── README.md
│
├── backend/
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── ...
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
└── frontend/
    └── ...
```

> The frontend structure will be expanded as frontend development progresses.

---

# API Design

The backend follows REST-style API principles.

Example Expense endpoints:

```http
POST   /api/farms/:farmId/expenses
GET    /api/farms/:farmId/expenses
GET    /api/farms/:farmId/expenses/:expenseId
PATCH  /api/farms/:farmId/expenses/:expenseId
DELETE /api/farms/:farmId/expenses/:expenseId
```

The Expense listing endpoint supports query-based filtering and analytical calculations.

Example:

```http
GET /api/farms/:farmId/expenses?category=Fertilizer&payment_status=PAID&payment_method=UPI
```

---

# Data Security

Farm-specific resources are protected using authenticated user information.

Before accessing expense records, the backend verifies the relationship between:

```text
Authenticated User
        │
        ▼
      Farm
        │
        ▼
    Expenses
```

This prevents a user from accessing expenses belonging to another user's farm through a different farm ID.

Environment variables and sensitive credentials are kept outside the source code.

---

# Development Approach

KrishiOra is being developed using an incremental approach.

Instead of implementing the entire system at once, individual modules are developed, tested, stabilized, and then used as the foundation for the next phase.

Current development flow:

```text
Backend Foundation
       ↓
Authentication
       ↓
Farm Management
       ↓
Expense CRUD
       ↓
Expense Filtering
       ↓
Date Range Filtering
       ↓
Expense Analytics
       ↓
Top-K Expense Analysis
       ↓
Backend Stabilization
       ↓
Frontend Development
       ↓
API Integration
       ↓
Final Testing
```

This approach helps keep the system easier to test, debug, maintain, and extend.

---

# Current Milestone

## Backend Expense Management — Stable

The current Expense module supports:

- Secure farm-level access
- Expense creation
- Expense retrieval
- Expense retrieval by ID
- Expense updates
- Expense deletion
- Category filtering
- Payment status filtering
- Payment method filtering
- Exact date filtering
- Date range filtering
- Total expense calculation
- Average expense calculation
- Highest expense calculation
- Lowest expense calculation
- Category-wise expense summary
- Payment-status-wise summary
- Payment-method-wise summary
- Top-K expense analysis

The backend is currently being kept stable while frontend development begins.

---

# Roadmap

The project will continue to evolve incrementally.

### Phase 1 — Backend Foundation

- [x] Backend setup
- [x] Authentication
- [x] Farm management
- [x] Farm ownership verification
- [x] Expense CRUD

### Phase 2 — Expense Intelligence

- [x] Category filtering
- [x] Payment status filtering
- [x] Payment method filtering
- [x] Exact date filtering
- [x] Date range filtering
- [x] Expense summary
- [x] Category-wise analysis
- [x] Payment-wise analysis
- [x] Top-K expense analysis

### Phase 3 — Frontend

- [ ] Frontend architecture
- [ ] Authentication UI
- [ ] Dashboard
- [ ] Farm management UI
- [ ] Expense management UI
- [ ] Expense forms
- [ ] Expense filters
- [ ] Expense analytics
- [ ] API integration

### Phase 4 — Advanced Agriculture Features

Planned future improvements may include:

- Crop management
- Crop-specific expense tracking
- Agricultural activity tracking
- Farm-level analytics
- Cost trends
- Financial insights
- Data visualization
- Intelligent agricultural recommendations

---

# Testing

The backend APIs are currently being tested using Postman.

Testing includes:

- Successful requests
- Invalid farm IDs
- Unauthorized farm access
- Expense creation
- Expense retrieval
- Expense filtering
- Date range filtering
- Expense calculations
- Top-K expense analysis
- CRUD operations

---

# Environment Configuration

Sensitive configuration values should be stored in environment variables.

Example:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=5000
```

> Never commit actual secrets, API keys, tokens, or credentials to GitHub.

A `.env.example` file can be added to document the required environment variables without exposing sensitive values.

---

# Local Development

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/KishriOra.git
```

Navigate to the backend:

```bash
cd KishriOra/backend
```

Install dependencies:

```bash
npm install
```

Create your local environment file:

```text
.env
```

Add the required environment variables and start the development server using the project's configured development command.

The backend currently runs on:

```text
http://localhost:5000
```

---

# Project Vision

KrishiOra is being built with the goal of becoming more than a basic agricultural CRUD application.

The platform is intended to combine:

```text
Agriculture
    +
Data Management
    +
Financial Tracking
    +
Analytics
    +
Algorithmic Processing
    +
Future Intelligent Insights
```

The long-term vision is to provide farmers with a centralized system that helps them understand their farm operations, track costs, and make more informed decisions.

---

# Author

**Ashutosh Mishra**

KrishiOra is an ongoing full-stack development project focused on building a practical and scalable agriculture management platform.

---

# License

This project is currently under active development.
License information will be added before the first public release.