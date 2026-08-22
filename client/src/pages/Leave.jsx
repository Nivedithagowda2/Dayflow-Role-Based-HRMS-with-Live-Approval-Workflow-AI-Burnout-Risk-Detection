import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";
import { useToast } from "../context/ToastContext.jsx";

const statusColor = {
  pending: "bg-amber-700/20 text-amber-300",
  approved: "bg-teal-700/20 text-teal-300",
  rejected: "bg-coral-700/20 text-coral-300",
};

export default function Leave() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ leave_type: "paid", start_date: "", end_date: "", remarks: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get("/leave/me").then((res) => setRows(res.data));

  useEffect(() => {
    load();
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.start_date || !form.end_date) {
      setError("Pick a start and end date");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/leave", form);
      setForm({ leave_type: "paid", start_date: "", end_date: "", remarks: "" });
      showToast("Leave request submitted");
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="card animate-fadeUp space-y-4 lg:col-span-1 h-fit">
          <div className="flex items-center gap-2">
            <CalendarCheck size={18} className="text-coral-400" />
            <h2 className="font-medium">Apply for leave</h2>
          </div>
          {error && <div className="text-sm text-coral-300 bg-coral-700/20 border border-coral-500/30 rounded-xl px-3 py-2">{error}</div>}
          <div>
            <label className="label">Leave type</label>
            <select className="input" value={form.leave_type} onChange={update("leave_type")}>
              <option value="paid">Paid</option>
              <option value="sick">Sick</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start date</label>
              <input type="date" className="input" value={form.start_date} onChange={update("start_date")} required />
            </div>
            <div>
              <label className="label">End date</label>
              <input type="date" className="input" value={form.end_date} onChange={update("end_date")} required />
            </div>
          </div>
          <div>
            <label className="label">Remarks</label>
            <textarea className="input" rows={3} value={form.remarks} onChange={update("remarks")} />
          </div>
          <button className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </form>

        <div className="card animate-fadeUp lg:col-span-2" style={{ animationDelay: "100ms" }}>
          <h2 className="font-medium mb-4">Your leave history</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-mutedtext">No leave requests yet.</p>
          ) : (
            <ul className="divide-y divide-bg-600">
              {rows.map((l) => (
                <li key={l.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium capitalize">{l.leave_type} leave</p>
                    <span className={`badge capitalize ${statusColor[l.status]}`}>{l.status}</span>
                  </div>
                  <p className="text-xs text-mutedtext mt-1">
                    {l.start_date} to {l.end_date}
                  </p>
                  {l.remarks && <p className="text-sm text-mutedtext mt-1">{l.remarks}</p>}
                  {l.admin_comment && (
                    <p className="text-xs text-mutedtext mt-1 italic">HR note: {l.admin_comment}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
