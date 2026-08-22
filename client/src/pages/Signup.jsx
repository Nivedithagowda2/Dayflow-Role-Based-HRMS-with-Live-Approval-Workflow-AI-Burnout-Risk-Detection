import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signup(form);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-900 bg-hero-radial bg-noise relative overflow-hidden flex flex-col">
      <div className="absolute top-0 right-[10%] w-80 h-80 rounded-full bg-teal-500/10 blur-3xl animate-float" />

      <header className="relative z-10 px-8 md:px-14 pt-10">
        <span className="text-xs tracking-[0.3em] uppercase text-mutedtext">Dayflow HRMS</span>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <h1
          className="font-display font-medium leading-[0.9] text-cream animate-fadeUp"
          style={{ fontSize: "clamp(2.75rem, 9vw, 5.5rem)" }}
        >
          Join in.
        </h1>
        <p className="text-mutedtext max-w-sm mt-4 text-sm animate-fadeUp" style={{ animationDelay: "80ms" }}>
          Create your account to start tracking attendance, requesting leave, and staying aligned.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm mt-8 card animate-popIn text-left space-y-4"
          style={{ animationDelay: "160ms" }}
        >
          {error && (
            <div className="text-sm text-coral-300 bg-coral-700/20 border border-coral-500/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="label">Employee ID</label>
            <input className="input" value={form.employee_id} onChange={update("employee_id")} required />
          </div>
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={update("name")} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={update("email")} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={update("password")}
              required
              minLength={8}
            />
            <p className="text-xs text-mutedtext mt-1">At least 8 characters, with a letter and a number.</p>
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={update("role")}>
              <option value="employee">Employee</option>
              <option value="admin">Admin / HR</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-sm text-mutedtext text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-gold-400 font-medium hover:text-gold-200">
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
