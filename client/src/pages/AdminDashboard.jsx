import { useEffect, useState } from "react";
import { Users, UserCheck, CalendarClock, Flame, Search } from "lucide-react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";
import { useToast } from "../context/ToastContext.jsx";

const TABS = ["Overview", "Employees", "Attendance", "Leave approvals", "Payroll"];

const riskColor = {
  Low: "bg-teal-700/20 text-teal-300",
  Medium: "bg-amber-700/20 text-amber-300",
  High: "bg-coral-700/20 text-coral-300",
};

const leaveStatusColor = {
  pending: "bg-amber-700/20 text-amber-300",
  approved: "bg-teal-700/20 text-teal-300",
  rejected: "bg-coral-700/20 text-coral-300",
};

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [tab, setTab] = useState("Overview");
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [burnout, setBurnout] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [search, setSearch] = useState("");

  const loadAll = async () => {
    try {
      const [s, e, b, a, l, p] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/profile"),
        api.get("/analytics/burnout"),
        api.get("/attendance/today"),
        api.get("/leave"),
        api.get("/payroll"),
      ]);
      setSummary(s.data);
      setEmployees(e.data.filter((u) => u.role === "employee"));
      setBurnout(b.data);
      setAttendanceToday(a.data);
      setLeaveRequests(l.data);
      setPayroll(p.data);
    } catch (err) {
      showToast(err.response?.data?.error || "Could not load admin data", "error");
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const riskFor = (userId) => burnout.find((b) => b.id === userId);

  const decide = async (id, status) => {
    const comment = window.prompt(
      status === "approved" ? "Add an approval comment (optional):" : "Reason for rejection (optional):"
    );
    try {
      await api.put(`/leave/${id}/decision`, { status, admin_comment: comment || "" });
      showToast(status === "approved" ? "Leave approved" : "Leave rejected");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Could not update leave request", "error");
    }
  };

  const updateSalary = async (id, currentSalary) => {
    const value = window.prompt("New annual salary:", currentSalary);
    if (value === null) return;
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) return showToast("Enter a valid positive number", "error");
    try {
      await api.put(`/payroll/${id}`, { salary: num });
      showToast("Salary updated");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.error || "Could not update salary", "error");
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      (e.department || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-medium animate-fadeUp">Admin overview</h1>

        <div className="flex gap-2 border-b border-bg-600 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                tab === t ? "border-gold-400 text-gold-200" : "border-transparent text-mutedtext hover:text-cream"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" && summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card animate-popIn">
              <div className="chip bg-violet-500/15 text-violet-300 mb-4">
                <Users size={18} />
              </div>
              <p className="text-sm text-mutedtext">Total employees</p>
              <p className="text-3xl font-semibold mt-1">{summary.totalEmployees}</p>
            </div>
            <div className="stat-card animate-popIn" style={{ animationDelay: "80ms" }}>
              <div className="chip bg-teal-500/15 text-teal-300 mb-4">
                <UserCheck size={18} />
              </div>
              <p className="text-sm text-mutedtext">Present today</p>
              <p className="text-3xl font-semibold mt-1">{summary.presentToday}</p>
            </div>
            <div className="stat-card animate-popIn" style={{ animationDelay: "160ms" }}>
              <div className="chip bg-coral-500/15 text-coral-300 mb-4">
                <CalendarClock size={18} />
              </div>
              <p className="text-sm text-mutedtext">Pending leave requests</p>
              <p className="text-3xl font-semibold mt-1">{summary.pendingLeaves}</p>
            </div>

            <div className="card md:col-span-3 animate-fadeUp" style={{ animationDelay: "220ms" }}>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={18} className="text-coral-400" />
                <h2 className="font-medium">Burnout risk snapshot</h2>
              </div>
              <p className="text-xs text-mutedtext mb-4">
                A rule-based indicator from attendance and leave patterns. It only recommends a
                check-in — no automatic action is taken.
              </p>
              <ul className="divide-y divide-bg-600">
                {burnout.map((b) => (
                  <li key={b.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{b.name}</p>
                      <p className="text-xs text-mutedtext">{b.department || "—"}</p>
                    </div>
                    <span className={`badge ${riskColor[b.level]}`}>{b.level} risk</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "Employees" && (
          <div className="card animate-fadeUp space-y-4">
            <div className="relative max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedtext" />
              <input
                className="input pl-9"
                placeholder="Search by name, ID, department"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-mutedtext border-b border-bg-600">
                  <th className="py-2 font-normal">Name</th>
                  <th className="py-2 font-normal">Employee ID</th>
                  <th className="py-2 font-normal">Department</th>
                  <th className="py-2 font-normal">Job title</th>
                  <th className="py-2 font-normal">Burnout risk</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((e) => {
                  const r = riskFor(e.id);
                  return (
                    <tr key={e.id} className="border-b border-bg-600 last:border-0 hover:bg-bg-700/60 transition-colors">
                      <td className="py-3">{e.name}</td>
                      <td className="py-3">{e.employee_id}</td>
                      <td className="py-3">{e.department || "—"}</td>
                      <td className="py-3">{e.job_title || "—"}</td>
                      <td className="py-3">
                        {r && <span className={`badge ${riskColor[r.level]}`}>{r.level}</span>}
                      </td>
                    </tr>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-mutedtext text-sm">
                      No employees match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Attendance" && (
          <div className="card animate-fadeUp">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-mutedtext border-b border-bg-600">
                  <th className="py-2 font-normal">Name</th>
                  <th className="py-2 font-normal">Department</th>
                  <th className="py-2 font-normal">Check-in</th>
                  <th className="py-2 font-normal">Check-out</th>
                  <th className="py-2 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceToday.map((a) => (
                  <tr key={a.user_id} className="border-b border-bg-600 last:border-0 hover:bg-bg-700/60 transition-colors">
                    <td className="py-3">{a.name}</td>
                    <td className="py-3">{a.department || "—"}</td>
                    <td className="py-3">{a.check_in || "—"}</td>
                    <td className="py-3">{a.check_out || "—"}</td>
                    <td className="py-3 capitalize">{a.status || "Not marked"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Leave approvals" && (
          <div className="card animate-fadeUp">
            {leaveRequests.length === 0 ? (
              <p className="text-sm text-mutedtext">No leave requests.</p>
            ) : (
              <ul className="divide-y divide-bg-600">
                {leaveRequests.map((l) => (
                  <li key={l.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {l.employee_name}{" "}
                        <span className="text-mutedtext font-normal capitalize">— {l.leave_type} leave</span>
                      </p>
                      <p className="text-xs text-mutedtext mt-0.5">
                        {l.start_date} to {l.end_date}
                      </p>
                      {l.remarks && <p className="text-sm text-mutedtext mt-1">{l.remarks}</p>}
                    </div>
                    {l.status === "pending" ? (
                      <div className="flex gap-2 shrink-0">
                        <button className="btn-primary" onClick={() => decide(l.id, "approved")}>
                          Approve
                        </button>
                        <button className="btn-secondary" onClick={() => decide(l.id, "rejected")}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`badge capitalize shrink-0 ${leaveStatusColor[l.status]}`}>
                        {l.status}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "Payroll" && (
          <div className="card animate-fadeUp">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-mutedtext border-b border-bg-600">
                  <th className="py-2 font-normal">Name</th>
                  <th className="py-2 font-normal">Department</th>
                  <th className="py-2 font-normal">Job title</th>
                  <th className="py-2 font-normal">Salary</th>
                  <th className="py-2 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((p) => (
                  <tr key={p.id} className="border-b border-bg-600 last:border-0 hover:bg-bg-700/60 transition-colors">
                    <td className="py-3">{p.name}</td>
                    <td className="py-3">{p.department || "—"}</td>
                    <td className="py-3">{p.job_title || "—"}</td>
                    <td className="py-3">₹{Number(p.salary).toLocaleString("en-IN")}</td>
                    <td className="py-3 text-right">
                      <button
                        className="text-sm text-gold-400 font-medium hover:text-gold-200"
                        onClick={() => updateSalary(p.id, p.salary)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
