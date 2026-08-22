const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// Employee: apply for leave
router.post("/", (req, res) => {
  const { leave_type, start_date, end_date, remarks } = req.body;

  if (!leave_type || !start_date || !end_date) {
    return res.status(400).json({ error: "Leave type, start date and end date are required" });
  }
  if (!["paid", "sick", "unpaid"].includes(leave_type)) {
    return res.status(400).json({ error: "Invalid leave type" });
  }
  if (new Date(end_date) < new Date(start_date)) {
    return res.status(400).json({ error: "End date cannot be before start date" });
  }

  const result = db
    .prepare(
      `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, remarks)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(req.user.id, leave_type, start_date, end_date, remarks || "");

  const record = db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(record);
});

// Employee: view own leave requests
router.get("/me", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json(rows);
});

// Admin: view all leave requests, with employee name joined in
router.get("/", requireRole("admin"), (req, res) => {
  const rows = db
    .prepare(
      `SELECT lr.*, u.name as employee_name, u.department
       FROM leave_requests lr
       JOIN users u ON u.id = lr.user_id
       ORDER BY lr.status = 'pending' DESC, lr.created_at DESC`
    )
    .all();
  res.json(rows);
});

// Admin: approve or reject a leave request
router.put("/:id/decision", requireRole("admin"), (req, res) => {
  const { status, admin_comment } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
  }

  const leave = db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(req.params.id);
  if (!leave) return res.status(404).json({ error: "Leave request not found" });

  db.prepare("UPDATE leave_requests SET status = ?, admin_comment = ? WHERE id = ?").run(
    status,
    admin_comment || "",
    req.params.id
  );

  // If approved, mark the corresponding attendance days as 'leave'
  if (status === "approved") {
    const start = new Date(leave.start_date);
    const end = new Date(leave.end_date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const existing = db
        .prepare("SELECT id FROM attendance WHERE user_id = ? AND date = ?")
        .get(leave.user_id, dateStr);
      if (existing) {
        db.prepare("UPDATE attendance SET status = 'leave' WHERE id = ?").run(existing.id);
      } else {
        db.prepare("INSERT INTO attendance (user_id, date, status) VALUES (?, ?, 'leave')").run(
          leave.user_id,
          dateStr
        );
      }
    }
  }

  const updated = db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(req.params.id);
  res.json(updated);
});

module.exports = router;
