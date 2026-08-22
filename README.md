# Dayflow — Role-Based HRMS with Live Approval Workflow & AI Burnout Risk Detection

Every workday, perfectly aligned.

A role-based HR management system with live attendance tracking, real-time leave approval workflows, and a rule-based AI burnout risk indicator for HR.

## Features

- **Auth** — sign up / sign in with role selection (Employee / Admin), JWT-based sessions
- **Employee dashboard** — profile, attendance, leave requests, quick check-in/out
- **Admin dashboard** — employee list, attendance overview, leave approval queue, payroll control
- **Attendance** — check-in/check-out, daily/weekly view, status types (present, absent, half-day, leave)
- **Leave management** — apply for leave (paid/sick/unpaid), admin approve/reject with comments, live status updates
- **Payroll** — read-only view for employees, full control for admin
- **Burnout risk detector** — rule-based Low/Medium/High score per employee, calculated from attendance and leave patterns over the last 30 days. It only *recommends* a check-in to HR — it never takes automatic action.

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, JWT auth, bcrypt
- **Database:** SQLite (via better-sqlite3) — zero setup, file-based, easy to swap for PostgreSQL later

## Project structure

```
dayflow-hrms/
├── server/              # Express API
│   └── src/
│       ├── db/          # SQLite schema + seed script
│       ├── middleware/  # JWT auth + role guard
│       ├── routes/      # auth, profile, attendance, leave, payroll, analytics
│       └── utils/       # burnout risk scoring logic
└── client/              # React app
    └── src/
        ├── pages/        # Login, Signup, dashboards, attendance, leave, payroll, profile
        ├── components/   # Navbar, ProtectedRoute
        └── context/      # AuthContext
```

## Getting started

### 1. Backend

```bash
cd server
npm install
cp .env.example .env      # edit JWT_SECRET if you like
npm run seed               # creates a demo admin + employee
npm run dev                # starts the API on http://localhost:5000
```

Demo accounts created by the seed script:

| Role     | Email                 | Password      |
|----------|------------------------|---------------|
| Admin/HR | admin@dayflow.com      | Admin@123     |
| Employee | employee@dayflow.com   | Employee@123  |

### 2. Frontend

In a new terminal:

```bash
cd client
npm install
npm run dev                 # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api` requests to the backend on port 5000, so no extra config is needed.

### 3. Try it out

1. Sign in as the employee → check in → apply for leave.
2. Log out, sign in as admin → approve the leave request with a comment.
3. Log back in as the employee → see the leave status updated instantly.
4. As admin, check the **Overview** tab to see the burnout risk snapshot.

## API overview

| Method | Endpoint                        | Description                          | Role         |
|--------|----------------------------------|---------------------------------------|--------------|
| POST   | `/api/auth/signup`               | Register                              | Public       |
| POST   | `/api/auth/login`                 | Log in                                | Public       |
| GET    | `/api/profile/me`                 | Own profile                           | Any          |
| PUT    | `/api/profile/me`                 | Edit own limited fields               | Any          |
| GET    | `/api/profile`                    | List all employees                    | Admin        |
| PUT    | `/api/profile/:id`                | Edit any employee's full profile      | Admin        |
| POST   | `/api/attendance/check-in`        | Check in for today                    | Any          |
| POST   | `/api/attendance/check-out`       | Check out for today                   | Any          |
| GET    | `/api/attendance/me`              | Own attendance history                | Any          |
| GET    | `/api/attendance/today`           | Today's attendance, all employees     | Admin        |
| POST   | `/api/leave`                      | Apply for leave                       | Any          |
| GET    | `/api/leave/me`                   | Own leave history                     | Any          |
| GET    | `/api/leave`                      | All leave requests                    | Admin        |
| PUT    | `/api/leave/:id/decision`         | Approve/reject a leave request        | Admin        |
| GET    | `/api/payroll/me`                 | Own salary (read-only)                | Any          |
| GET    | `/api/payroll`                    | All employee salaries                 | Admin        |
| PUT    | `/api/payroll/:id`                | Update an employee's salary           | Admin        |
| GET    | `/api/analytics/burnout`          | Burnout risk for all employees        | Admin        |
| GET    | `/api/analytics/summary`          | Org-wide summary numbers              | Admin        |

## Switching to PostgreSQL later

The schema in `server/src/db/index.js` is written in plain SQL and maps almost directly onto Postgres — swap `better-sqlite3` for `pg`, adjust the `AUTOINCREMENT` → `SERIAL` and `TEXT CHECK(...)` syntax, and the rest of the app (routes, queries) needs little to no change since parameterized queries are used throughout.

## Notes on the burnout risk feature

The score is intentionally rule-based, not a black-box model, so HR can see exactly which factors contributed (frequent leave, repeated sick leave, absences, late check-ins). It is designed to support HR decision-making, not replace it — see `server/src/utils/burnout.js` for the full logic.
