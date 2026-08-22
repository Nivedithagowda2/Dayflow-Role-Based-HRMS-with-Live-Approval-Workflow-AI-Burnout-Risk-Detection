# Dayflow — Role-Based HRMS with Live Approval Workflow & AI Burnout Risk Detection

**Every workday, perfectly aligned.**

A Human Resource Management System that digitizes core HR operations — onboarding, attendance, leave, payroll, and approvals — for two roles: **Employees** and **Admin/HR**. Built around one core idea: a live, real-time approval loop between employee actions and HR decisions, with a rule-based burnout risk indicator layered on top.

---

##  Demo Video

[![Dayflow HRMS Demo](https://img.youtube.com/vi/577H2Bd_SP0/maxresdefault.jpg)](https://www.youtube.com/watch?v=577H2Bd_SP0)

▶️ **[Watch the full demo on YouTube](https://www.youtube.com/watch?v=577H2Bd_SP0)**


## 1. Problem Statement

Most small and mid-sized companies still manage HR processes manually — spreadsheets, WhatsApp messages, and paper leave forms — with no single source of truth and no clear approval trail. This creates friction for both sides:

- **Employees** don't have a clean way to check their attendance, apply for leave, or see their payroll details.
- **HR/Admins** don't have a centralized view of who's present, who's on leave, or whose leave requests are still pending.

**The ask:** build an HRMS that provides secure authentication, role-based access (Admin vs Employee), employee profile management, attendance tracking, leave and time-off management, and approval workflows for HR — with visibility into payroll and basic analytics/reports.

## 2. Our Solution

Dayflow is a full-stack web application with two dedicated dashboards — one for Employees, one for Admin/HR — connected by a **live approval workflow**: an employee checks in or applies for leave, and it's instantly visible to HR for action, with the decision reflecting back to the employee in real time. No page reloads, no manual syncing, no spreadsheets.

On top of the core requirements, Dayflow adds one differentiator: a **rule-based burnout risk detector**. It looks at each employee's attendance and leave patterns over the last 30 days and flags a Low / Medium / High risk level for HR — not as an automated decision system, but as a recommendation to check in with that person. This doubles as the "analytics & reports" requirement from the original spec, done in a way that's actually actionable rather than just a static chart.

### Requirement coverage

| Requirement (from the original spec) | How Dayflow covers it |
|---|---|
| Secure authentication (Sign up / Sign in) | Employee ID, email, password, role selection; JWT-based sessions; bcrypt password hashing |
| Role-based access (Admin vs Employee) | Separate protected routes and dashboards per role, enforced both in the UI and the API |
| Employee profile management | View/edit for employees (limited fields); full view/edit for Admin |
| Attendance tracking (daily/weekly) | Check-in/check-out, daily and weekly views, status types: Present, Absent, Half-day, Leave |
| Leave and time-off management | Apply for Paid/Sick/Unpaid leave with dates and remarks; status tracking (Pending/Approved/Rejected) |
| Approval workflows for HR/Admin | Admin queue to approve/reject with comments; status updates reflect instantly on the employee side |
| Payroll visibility | Read-only for employees; full view/edit for Admin |
| Analytics & reports dashboard | Burnout risk snapshot (Low/Medium/High) per employee, calculated from attendance and leave data |

## 3. Architecture

Dayflow follows a standard three-tier architecture:

```
┌─────────────────────────────────────────────────────┐
│                  Client — React (Vite)                │
│   Employee Dashboard         Admin Dashboard          │
│   Profile · Attendance ·     Employees · Approvals ·  │
│   Leave · Payroll             Attendance · Payroll     │
└───────────────────────┬───────────────────────────────┘
                         │ REST API (JWT in Authorization header)
┌───────────────────────▼───────────────────────────────┐
│            Backend — Node.js / Express                │
│  ┌────────┐ ┌────────────┐ ┌───────┐ ┌──────────────┐ │
│  │  Auth  │ │ Attendance │ │ Leave │ │ Payroll + AI │ │
│  │        │ │            │ │       │ │(burnout risk)│ │
│  └────────┘ └────────────┘ └───────┘ └──────────────┘ │
└───────────────────────┬───────────────────────────────┘
                         │ SQL (parameterized queries)
┌───────────────────────▼───────────────────────────────┐
│              Database — SQLite (better-sqlite3)        │
│   users · attendance · leave_requests                  │
└─────────────────────────────────────────────────────────┘
```

**How a leave request flows through the system (the core workflow):**

1. Employee submits a leave request → `POST /api/leave` → row inserted with `status = pending`.
2. Admin opens the **Leave approvals** tab → `GET /api/leave` → sees it immediately (no separate sync step).
3. Admin approves/rejects with a comment → `PUT /api/leave/:id/decision` → status updated; if approved, the corresponding days are also written into the `attendance` table as `leave`.
4. Employee reloads their Leave page → `GET /api/leave/me` → sees the updated status and HR's comment.

**Where the burnout engine lives:** it isn't a separate service. It's a function (`server/src/utils/burnout.js`) that queries a user's last 30 days of attendance and leave records, applies a small set of weighted rules (frequent leave, repeated sick leave, absences, late check-ins), and returns a score, a risk level, and the specific factors that contributed — so HR can see exactly why a score was given, not a black box.

## 4. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS + React Router + Axios | Fast dev loop, component-driven UI, utility-first styling |
| Icons | lucide-react | Lightweight, consistent icon set |
| Backend | Node.js + Express | Simple, well-understood REST API layer |
| Auth | JWT + bcryptjs | Stateless sessions, industry-standard password hashing |
| Database | SQLite via better-sqlite3 | Zero setup, file-based — no separate DB server needed for a hackathon demo; schema is plain SQL and maps cleanly onto PostgreSQL later |

## 5. Project Structure

```
dayflow-hrms/
├── server/                      # Express API
│   └── src/
│       ├── db/
│       │   ├── index.js         # SQLite connection + schema
│       │   └── seed.js          # Creates demo admin + employee
│       ├── middleware/
│       │   └── auth.js          # JWT verification + role guard
│       ├── routes/
│       │   ├── auth.js          # signup, login
│       │   ├── profile.js       # view/edit profile
│       │   ├── attendance.js    # check-in/out, history
│       │   ├── leave.js         # apply, approve/reject
│       │   ├── payroll.js       # salary view/edit
│       │   └── analytics.js     # burnout risk, org summary
│       ├── utils/
│       │   └── burnout.js       # rule-based risk scoring
│       └── index.js              # app entry point
│
└── client/                       # React app
    └── src/
        ├── pages/                # Login, Signup, dashboards, Attendance, Leave, Payroll, Profile
        ├── components/           # Navbar, ProtectedRoute
        ├── context/              # AuthContext, ToastContext
        ├── api.js                # Axios instance with JWT interceptor
        └── App.jsx                # Routes
```

## 6. Getting Started

### Prerequisites
- Node.js 18+
- npm

### Backend

```bash
cd server
npm install
cp .env.example .env        # edit JWT_SECRET if you like
npm run seed                 # creates a demo admin + employee
npm run dev                  # starts the API on http://localhost:5000
```

### Frontend

In a separate terminal:

```bash
cd client
npm install
npm run dev                   # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api` requests to port 5000, so no extra configuration is needed.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin/HR | admin@dayflow.com | Admin@123 |
| Employee | employee@dayflow.com | Employee@123 |

### Try the core workflow

1. Sign in as the employee → check in → apply for leave.
2. Log out, sign in as admin → open **Leave approvals** → approve the request with a comment.
3. Log back in as the employee → the leave status is already updated to **Approved**, with HR's comment attached.
4. Back on the admin side, check the **Overview** tab for the burnout risk snapshot.

## 7. API Reference

| Method | Endpoint | Description | Role |
|---|---|---|---|
| POST | `/api/auth/signup` | Register a new account | Public |
| POST | `/api/auth/login` | Log in | Public |
| GET | `/api/profile/me` | View own profile | Any |
| PUT | `/api/profile/me` | Edit own limited fields (phone, address) | Any |
| GET | `/api/profile` | List all employees | Admin |
| PUT | `/api/profile/:id` | Edit any employee's full profile | Admin |
| POST | `/api/attendance/check-in` | Check in for today | Any |
| POST | `/api/attendance/check-out` | Check out for today | Any |
| GET | `/api/attendance/me` | Own attendance history | Any |
| GET | `/api/attendance/today` | Today's attendance, all employees | Admin |
| POST | `/api/leave` | Apply for leave | Any |
| GET | `/api/leave/me` | Own leave history | Any |
| GET | `/api/leave` | All leave requests | Admin |
| PUT | `/api/leave/:id/decision` | Approve/reject a leave request | Admin |
| GET | `/api/payroll/me` | Own salary (read-only) | Any |
| GET | `/api/payroll` | All employee salaries | Admin |
| PUT | `/api/payroll/:id` | Update an employee's salary | Admin |
| GET | `/api/analytics/burnout` | Burnout risk for all employees | Admin |
| GET | `/api/analytics/summary` | Org-wide summary numbers | Admin |

## 8. The Burnout Risk Feature, in Detail

The score is intentionally **rule-based, not a black-box ML model**, so HR can see exactly which factors contributed to a rating:

- Frequent leave requests in the last 30 days
- Repeated sick leave specifically
- Multiple unexplained absences
- Frequent half-days
- Frequent late check-ins

Each factor adds weighted points; the total maps to **Low / Medium / High**. The output always includes a plain-language recommendation ("HR check-in recommended" for High, "keep an eye on this employee" for Medium) — and it never takes automatic action. It's a decision-support signal for a human, not an automated system. See `server/src/utils/burnout.js` for the full logic.

## 9. Future Enhancements

- Weekly attendance calendar view
- Leave balance tracker (e.g. "12 of 18 paid days used")
- Email/in-app notifications on leave decisions
- CSV export for payroll and attendance
- Dark/light theme toggle
- Migrate SQLite → PostgreSQL for production use


## 👥 Team Members

| Name | Role | Responsibilities |
|------|------|------------------|
| **Niveditha** | Team Lead & Backend Developer and Database  | Backend development, database design, and API development |
| **Chithra** | Frontend Developer | UI/UX development and frontend implementation |
| **Navitha** | Backend Developer | Backend development and API integration |


## 10. License

This project was built as a submission for a hackathon/academic assignment based on the "Dayflow — Human Resource Management System" problem statement.









