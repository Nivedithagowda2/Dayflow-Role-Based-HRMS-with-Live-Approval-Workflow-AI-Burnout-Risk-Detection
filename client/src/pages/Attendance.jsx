import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";

const statusColor = {
  present: "bg-teal-700/20 text-teal-300",
  absent: "bg-coral-700/20 text-coral-300",
  "half-day": "bg-amber-700/20 text-amber-300",
  leave: "bg-violet-500/15 text-violet-300",
};

export default function Attendance() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/attendance/me").then((res) => {
      setRows(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-6 animate-fadeUp">
          <Clock size={20} className="text-gold-400" />
          <h1 className="text-2xl font-medium">Your attendance</h1>
        </div>

        <div className="card animate-fadeUp">
          {loading ? (
            <div className="h-24 rounded-lg bg-gradient-to-r from-bg-700 via-bg-600 to-bg-700 bg-[length:200%_100%] animate-shimmer" />
          ) : rows.length === 0 ? (
            <p className="text-sm text-mutedtext">No attendance records yet. Check in from your dashboard to get started.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-mutedtext border-b border-bg-600">
                  <th className="py-2 font-normal">Date</th>
                  <th className="py-2 font-normal">Check-in</th>
                  <th className="py-2 font-normal">Check-out</th>
                  <th className="py-2 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-bg-600 last:border-0 hover:bg-bg-700/60 transition-colors">
                    <td className="py-3">{r.date}</td>
                    <td className="py-3">{r.check_in || "—"}</td>
                    <td className="py-3">{r.check_out || "—"}</td>
                    <td className="py-3">
                      <span className={`badge capitalize ${statusColor[r.status]}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
