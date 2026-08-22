const db = require("../db");

/**
 * Rule-based burnout risk score.
 * Looks at the last 30 days of attendance and leave data for a user
 * and produces a Low / Medium / High risk label plus the contributing factors.
 *
 * This is intentionally rule-based (not a black box) so HR can see exactly
 * why a score was given, and it never takes automatic action - it only
 * surfaces a recommendation for a human to review.
 */
function calculateBurnoutRisk(userId) {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceStr = since.toISOString().slice(0, 10);

  const attendance = db
    .prepare(`SELECT * FROM attendance WHERE user_id = ? AND date >= ?`)
    .all(userId, sinceStr);

  const leaves = db
    .prepare(
      `SELECT * FROM leave_requests WHERE user_id = ? AND start_date >= ? AND status != 'rejected'`
    )
    .all(userId, sinceStr);

  let score = 0;
  const factors = [];

  // Factor 1: frequent leave requests in the last 30 days
  if (leaves.length >= 4) {
    score += 3;
    factors.push("Frequent leave requests (4+ in last 30 days)");
  } else if (leaves.length >= 2) {
    score += 1;
    factors.push("Multiple leave requests in last 30 days");
  }

  // Factor 2: sick leave specifically (possible stress/health signal)
  const sickLeaves = leaves.filter((l) => l.leave_type === "sick").length;
  if (sickLeaves >= 2) {
    score += 2;
    factors.push("Repeated sick leave");
  }

  // Factor 3: absences / half-days
  const absences = attendance.filter((a) => a.status === "absent").length;
  const halfDays = attendance.filter((a) => a.status === "half-day").length;
  if (absences >= 3) {
    score += 2;
    factors.push("Multiple unexplained absences");
  }
  if (halfDays >= 3) {
    score += 1;
    factors.push("Frequent half-days");
  }

  // Factor 4: late check-ins (after 10:30) as a rough overwork/irregularity signal
  const lateCheckIns = attendance.filter((a) => a.check_in && a.check_in > "10:30").length;
  if (lateCheckIns >= 5) {
    score += 1;
    factors.push("Frequent late check-ins");
  }

  let level = "Low";
  if (score >= 5) level = "High";
  else if (score >= 2) level = "Medium";

  return {
    score,
    level,
    factors,
    recommendation:
      level === "High"
        ? "Suggested action: HR check-in recommended"
        : level === "Medium"
        ? "Suggested action: keep an eye on this employee"
        : "No action needed",
  };
}

module.exports = { calculateBurnoutRisk };
