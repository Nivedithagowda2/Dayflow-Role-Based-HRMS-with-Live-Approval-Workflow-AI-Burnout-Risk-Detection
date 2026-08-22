const bcrypt = require("bcryptjs");
const db = require("./index");

function upsertUser(u) {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(u.email);
  if (existing) {
    console.log(`Skipping ${u.email}, already exists`);
    return;
  }
  const hash = bcrypt.hashSync(u.password, 10);
  db.prepare(
    `INSERT INTO users (employee_id, name, email, password_hash, role, job_title, department, salary)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(u.employee_id, u.name, u.email, hash, u.role, u.job_title, u.department, u.salary);
  console.log(`Created ${u.role}: ${u.email}`);
}

upsertUser({
  employee_id: "ADM001",
  name: "Asha Rao",
  email: "admin@dayflow.com",
  password: "Admin@123",
  role: "admin",
  job_title: "HR Manager",
  department: "Human Resources",
  salary: 95000,
});

upsertUser({
  employee_id: "EMP001",
  name: "Rahul Mehta",
  email: "employee@dayflow.com",
  password: "Employee@123",
  role: "employee",
  job_title: "Software Engineer",
  department: "Engineering",
  salary: 65000,
});

console.log("\nSeed complete. Login with:");
console.log("  Admin    -> admin@dayflow.com / Admin@123");
console.log("  Employee -> employee@dayflow.com / Employee@123");
