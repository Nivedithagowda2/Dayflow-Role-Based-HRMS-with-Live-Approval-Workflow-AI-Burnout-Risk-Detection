const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/; // 8+ chars, at least one letter and number

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

router.post("/signup", (req, res) => {
  const { employee_id, name, email, password, role } = req.body;

  if (!employee_id || !name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!["employee", "admin"].includes(role)) {
    return res.status(400).json({ error: "Role must be 'employee' or 'admin'" });
  }
  if (!PASSWORD_RULE.test(password)) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters and include a letter and a number" });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ? OR employee_id = ?")
    .get(email, employee_id);
  if (existing) {
    return res.status(409).json({ error: "An account with this email or employee ID already exists" });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      `INSERT INTO users (employee_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`
    )
    .run(employee_id, name, email, password_hash, role);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  const token = signToken(user);

  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

module.exports = router;
