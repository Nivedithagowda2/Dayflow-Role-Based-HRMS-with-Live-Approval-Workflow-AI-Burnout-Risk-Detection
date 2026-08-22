import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") {
      setEmail("admin@dayflow.com");
      setPassword("Admin@123");
    } else {
      setEmail("employee@dayflow.com");
      setPassword("Employee@123");
    }
  };

  return (
    <div className="min-h-screen bg-bg-900 bg-hero-radial bg-noise relative overflow-hidden flex flex-col">
      {/* ambient glow orbs */}
      <div className="absolute top-1/4 left-[10%] w-72 h-72 rounded-full bg-gold-400/10 blur-3xl animate-float" />
      <div className="absolute bottom-0 right-[8%] w-96 h-96 rounded-full bg-violet-500/10 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <header className="relative z-10 px-8 md:px-14 pt-10">
        <span className="text-xs tracking-[0.3em] uppercase text-mutedtext">Dayflow HRMS</span>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-mutedtext text-sm md:text-base mb-3 animate-fadeUp">
          Every workday, perfectly aligned.
        </p>
        <h1
          className="font-display font-medium leading-[0.9] text-cream animate-fadeUp"
          style={{ fontSize: "clamp(3.5rem, 12vw, 8rem)", animationDelay: "80ms" }}
        >
          Sign in.
        </h1>
        <p className="text-mutedtext max-w-md mt-5 text-sm md:text-base animate-fadeUp" style={{ animationDelay: "160ms" }}>
          One workspace for attendance, leave, payroll, and HR approvals — built for teams that
          move fast.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm mt-10 card animate-popIn text-left space-y-4"
          style={{ animationDelay: "240ms" }}
        >
          {error && (
            <div className="text-sm text-coral-300 bg-coral-700/20 border border-coral-500/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-1.5" disabled={loading}>
            {loading ? "Signing in..." : (
              <>Enter Dayflow <ArrowRight size={16} /></>
            )}
          </button>

          <p className="text-sm text-mutedtext text-center">
            No account?{" "}
            <Link to="/signup" className="text-gold-400 font-medium hover:text-gold-200">
              Sign up
            </Link>
          </p>
        </form>

        <div className="flex gap-2 mt-6 w-full max-w-sm animate-fadeUp" style={{ animationDelay: "320ms" }}>
          <button
            onClick={() => fillDemo("admin")}
            className="flex-1 text-xs text-mutedtext text-center bg-bg-800 hover:text-gold-200 hover:border-gold-400/40 border border-bg-600 rounded-xl px-3 py-2 transition-colors"
          >
            Try demo admin
          </button>
          <button
            onClick={() => fillDemo("employee")}
            className="flex-1 text-xs text-mutedtext text-center bg-bg-800 hover:text-gold-200 hover:border-gold-400/40 border border-bg-600 rounded-xl px-3 py-2 transition-colors"
          >
            Try demo employee
          </button>
        </div>
      </main>

      <footer className="relative z-10 px-8 md:px-14 pb-8 flex flex-wrap gap-x-8 gap-y-2 text-xs text-mutedtext">
        <span>/ Role-based access</span>
        <span>/ Live approval workflow</span>
        <span>/ AI burnout risk detection</span>
      </footer>
    </div>
  );
}
