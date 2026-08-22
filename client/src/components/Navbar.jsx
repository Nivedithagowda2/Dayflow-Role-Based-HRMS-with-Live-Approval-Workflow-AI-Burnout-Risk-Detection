import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Clock, CalendarCheck, Wallet, User, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links =
    user.role === "admin"
      ? [{ to: "/admin", label: "Overview", icon: ShieldCheck }]
      : [
          { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/attendance", label: "Attendance", icon: Clock },
          { to: "/leave", label: "Leave", icon: CalendarCheck },
          { to: "/payroll", label: "Payroll", icon: Wallet },
          { to: "/profile", label: "Profile", icon: User },
        ];

  return (
    <header className="border-b border-bg-600 bg-bg-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-display text-lg font-medium text-cream">
            Day<span className="text-gold-400">flow</span>
          </span>
          <nav className="flex gap-1">
            {links.map((l) => {
              const Icon = l.icon;
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-gold-400/15 text-gold-200"
                      : "text-mutedtext hover:bg-bg-700 hover:text-cream"
                  }`}
                >
                  <Icon size={15} />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-mutedtext hidden sm:block">{user.name}</span>
          <button onClick={handleLogout} className="btn-secondary flex items-center gap-1.5">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>
    </header>
  );
}
