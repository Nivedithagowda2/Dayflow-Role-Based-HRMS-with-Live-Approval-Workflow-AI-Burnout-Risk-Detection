const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");
const { calculateBurnoutRisk } = require("../utils/burnout");

const router = express.Router();
router.use(authenticate, requireRole("admin"));

// Burnout risk for every employee - powers the Admin dashboard risk badges
router.get("/burnout", (req, res) => {
  const employees = db.prepare("SELECT id, name, department FROM users WHERE role = 'employee'").all();
  const results = employees.map((e) => ({
    ...e,
    ...calculateBurnoutRisk(e.id),
  }));
  res.json(results);
});

// Burnout risk for a single employee
router.get("/burnout/:id", (req, res) => {
  const employee = db.prepare("SELECT id, name, department FROM users WHERE id = ?").get(req.params.id);
  if (!employee) return res.status(404).json({ error: "Employee not found" });
  res.json({ ...employee, ...calculateBurnoutRisk(employee.id) });
});

// Simple org-wide summary numbers for the admin dashboard
router.get("/summary", (req, res) => {
  const totalEmployees = db
    .prepare("SELECT COUNT(*) as c FROM users WHERE role = 'employee'")
    .get().c;
  const pendingLeaves = db
    .prepare("SELECT COUNT(*) as c FROM leave_requests WHERE status = 'pending'")
    .get().c;
  const today = new Date().toISOString().slice(0, 10);
  const presentToday = db
    .prepare("SELECT COUNT(*) as c FROM attendance WHERE date = ? AND status = 'present'")
    .get(today).c;

  res.json({ totalEmployees, pendingLeaves, presentToday });
});

module.exports = router;
