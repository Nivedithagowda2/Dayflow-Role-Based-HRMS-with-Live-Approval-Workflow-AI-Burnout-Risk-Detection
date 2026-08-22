import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, Clock, CalendarCheck, LogIn, LogOut as LogOutIcon } from "lucide-react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [today, setToday] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [att, lv] = await Promise.all([api.get("/attendance/me"), api.get("/leave/me")]);
      const todayStr = new Date().toISOString().slice(0, 10);
      setToday(att.data.find((a) => a.date === todayStr) || null);
      setLeaves(lv.data.slice(0, 3));
    } catch (err) {
      showToast(err.response?.data?.error || "Could not load your dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkIn = async () => {
    try {
      await api.post("/attendance/check-in");
      showToast("Checked in successfully");
      load();
    } catch (err) {
      showToast(err.response?.data?.error || "Could not check in", "error");
    }
  };
  const checkOut = async () => {
    try {
      await api.post("/attendance/check-out");
      showToast("Checked out — see you tomorrow!");
      load();
    } catch (err) {
      showToast(err.response?.data?.error || "Could not check out", "error");
    }
  };

  const statusColor = {
    pending: "bg-amber-700/20 text-amber-300",
    approved: "bg-teal-700/20 text-teal-300",
    rejected: "bg-coral-700/20 text-coral-300",
  };

  const quickLinks = [
    { to: "/profile", label: "Profile", sub: "View and edit details", icon: User, iconBg: "bg-violet-500/15 text-violet-300" },
    { to: "/attendance", label: "Attendance", sub: "Daily and weekly view", icon: Clock, iconBg: "bg-teal-500/15 text-teal-300" },
    { to: "/leave", label: "Leave requests", sub: "Apply and track status", icon: CalendarCheck, iconBg: "bg-coral-500/15 text-coral-300" },
  ];

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="animate-fadeUp">
          <h1 className="text-2xl md:text-3xl font-medium">
            Welcome back, <span className="text-gold-400">{user.name.split(" ")[0]}</span>
          </h1>
          <p className="text-mutedtext text-sm mt-1">Here's where things stand today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((l, i) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className="card card-hover animate-popIn"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`chip ${l.iconBg} mb-4`}>
                  <Icon size={18} />
                </div>
                <p className="text-sm text-mutedtext">{l.label}</p>
                <p className="font-medium mt-1">{l.sub}</p>
              </Link>
            );
          })}
        </div>

        <div className="card animate-fadeUp" style={{ animationDelay: "120ms" }}>
          <h2 className="font-medium mb-4">Today's attendance</h2>
          {loading ? (
            <div className="h-10 rounded-lg bg-gradient-to-r from-bg-700 via-bg-600 to-bg-700 bg-[length:200%_100%] animate-shimmer" />
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-mutedtext">
                {today?.check_in ? (
                  <p>
                    Checked in at <span className="text-cream font-medium">{today.check_in}</span>
                    {today.check_out && (
                      <>
                        {" "}
                        · checked out at <span className="text-cream font-medium">{today.check_out}</span>
                      </>
                    )}
                  </p>
                ) : (
                  <p>You haven't checked in yet today.</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  className="btn-primary flex items-center gap-1.5"
                  onClick={checkIn}
                  disabled={!!today?.check_in}
                >
                  <LogIn size={15} /> Check in
                </button>
                <button
                  className="btn-secondary flex items-center gap-1.5"
                  onClick={checkOut}
                  disabled={!today?.check_in || !!today?.check_out}
                >
                  <LogOutIcon size={15} /> Check out
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card animate-fadeUp" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Recent leave requests</h2>
            <Link to="/leave" className="text-sm text-gold-400 font-medium hover:text-gold-200">
              Apply for leave
            </Link>
          </div>
          {leaves.length === 0 ? (
            <p className="text-sm text-mutedtext">No leave requests yet.</p>
          ) : (
            <ul className="divide-y divide-bg-600">
              {leaves.map((l) => (
                <li key={l.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize">{l.leave_type} leave</p>
                    <p className="text-xs text-mutedtext">
                      {l.start_date} to {l.end_date}
                    </p>
                  </div>
                  <span className={`badge capitalize ${statusColor[l.status]}`}>{l.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
