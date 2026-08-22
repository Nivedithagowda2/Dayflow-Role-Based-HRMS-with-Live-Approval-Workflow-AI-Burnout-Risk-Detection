const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

function publicUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

// Get own profile
router.get("/me", (req, res) => { 
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  res.json(publicUser(user));
});

// Employee can edit limited fields on their own profile
router.put("/me", (req, res) => {
  const { phone, address } = req.body;
  db.prepare(`UPDATE users SET phone = ?, address = ? WHERE id = ?`).run(
    phone || "",
    address || "",
    req.user.id
  );
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  res.json(publicUser(user));
});

// Admin: list all employees
router.get("/", requireRole("admin"), (req, res) => {
  const users = db.prepare("SELECT * FROM users ORDER BY name").all();
  res.json(users.map(publicUser));
});

// Admin: view a specific employee's profile
router.get("/:id", requireRole("admin"), (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "Employee not found" });
  res.json(publicUser(user));
});

// Admin: edit any employee's full profile
router.put("/:id", requireRole("admin"), (req, res) => {
  const { name, job_title, department, phone, address, salary } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "Employee not found" });

  db.prepare(
    `UPDATE users SET name = ?, job_title = ?, department = ?, phone = ?, address = ?, salary = ? WHERE id = ?`
  ).run(
    name ?? user.name,
    job_title ?? user.job_title,
    department ?? user.department,
    phone ?? user.phone,
    address ?? user.address,
    salary ?? user.salary,
    req.params.id
  );

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  res.json(publicUser(updated));
});

module.exports = router;
