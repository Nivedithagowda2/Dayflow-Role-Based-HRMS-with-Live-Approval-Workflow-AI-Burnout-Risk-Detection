import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";

export default function Payroll() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/payroll/me").then((res) => setData(res.data));
  }, []);

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-6 animate-fadeUp">
          <Wallet size={20} className="text-gold-400" />
          <h1 className="text-2xl font-medium">Payroll</h1>
        </div>
        <div className="card animate-popIn max-w-md">
          <p className="text-xs text-mutedtext uppercase tracking-wide mb-4">Read-only</p>
          {data ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-mutedtext">Job title</p>
                <p className="font-medium">{data.job_title || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-mutedtext">Department</p>
                <p className="font-medium">{data.department || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-mutedtext">Annual salary</p>
                <p className="font-semibold text-3xl text-gold-400 font-display">
                  ₹{Number(data.salary).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-24 rounded-lg bg-gradient-to-r from-bg-700 via-bg-600 to-bg-700 bg-[length:200%_100%] animate-shimmer" />
          )}
        </div>
      </main>
    </div>
  );
}
