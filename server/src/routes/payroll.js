const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// Employee: read-only view of own salary
router.get("/me", (req, res) => {
  const user = db
    .prepare("SELECT salary, job_title, department FROM users WHERE id = ?")
    .get(req.user.id);
  res.json(user);
});

// Admin: view payroll for all employees
router.get("/", requireRole("admin"), (req, res) => {
  const rows = db
    .prepare(
      "SELECT id, employee_id, name, department, job_title, salary FROM users WHERE role = 'employee' ORDER BY name"
    )
    .all();
  res.json(rows);
});

// Admin: update an employee's salary
router.put("/:id", requireRole("admin"), (req, res) => {
  const { salary } = req.body;
  if (typeof salary !== "number" || salary < 0) {
    return res.status(400).json({ error: "Salary must be a positive number" });
  }
  db.prepare("UPDATE users SET salary = ? WHERE id = ?").run(salary, req.params.id);
  const user = db
    .prepare("SELECT id, name, salary FROM users WHERE id = ?")
    .get(req.params.id);
  res.json(user);
});

module.exports = router;
