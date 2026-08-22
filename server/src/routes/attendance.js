const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5); 
}

// Employee: check in for today
router.post("/check-in", (req, res) => {
  const date = todayStr();
  const existing = db
    .prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ?")
    .get(req.user.id, date);

  if (existing && existing.check_in) {
    return res.status(409).json({ error: "Already checked in today" });
  }

  if (existing) {
    db.prepare("UPDATE attendance SET check_in = ?, status = 'present' WHERE id = ?").run(
      nowTime(),
      existing.id
    );
  } else {
    db.prepare(
      "INSERT INTO attendance (user_id, date, check_in, status) VALUES (?, ?, ?, 'present')"
    ).run(req.user.id, date, nowTime());
  }

  const record = db.prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ?").get(
    req.user.id,
    date
  );
  res.json(record);
});

// Employee: check out for today
router.post("/check-out", (req, res) => {
  const date = todayStr();
  const existing = db
    .prepare("SELECT * FROM attendance WHERE user_id = ? AND date = ?")
    .get(req.user.id, date);

  if (!existing || !existing.check_in) {
    return res.status(400).json({ error: "You need to check in first" });
  }
  if (existing.check_out) {
    return res.status(409).json({ error: "Already checked out today" });
  }

  db.prepare("UPDATE attendance SET check_out = ? WHERE id = ?").run(nowTime(), existing.id);
  const record = db.prepare("SELECT * FROM attendance WHERE id = ?").get(existing.id);
  res.json(record);
});

// Employee: view own attendance (optionally filter by range)
router.get("/me", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 30")
    .all(req.user.id);
  res.json(rows);
});

// Admin: view attendance for a specific employee
router.get("/user/:id", requireRole("admin"), (req, res) => {
  const rows = db
    .prepare("SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 30")
    .all(req.params.id);
  res.json(rows);
});

// Admin: today's attendance snapshot across all employees
router.get("/today", requireRole("admin"), (req, res) => {
  const date = todayStr();
  const rows = db
    .prepare(
      `SELECT u.id as user_id, u.name, u.department, a.status, a.check_in, a.check_out
       FROM users u
       LEFT JOIN attendance a ON a.user_id = u.id AND a.date = ?
       WHERE u.role = 'employee'
       ORDER BY u.name`
    )
    .all(date);
  res.json(rows);
});

module.exports = router;
