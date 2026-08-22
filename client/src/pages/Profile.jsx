import { useEffect, useState } from "react";
import { UserCircle2 } from "lucide-react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Profile() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get("/profile/me").then((res) => {
      setProfile(res.data);
      setPhone(res.data.phone || "");
      setAddress(res.data.address || "");
    });

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/profile/me", { phone, address });
      showToast("Profile updated");
      load();
    } catch (err) {
      showToast(err.response?.data?.error || "Could not save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div>
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="h-40 rounded-2xl bg-gradient-to-r from-bg-700 via-bg-600 to-bg-700 bg-[length:200%_100%] animate-shimmer" />
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-6 animate-fadeUp">
          <UserCircle2 size={20} className="text-gold-400" />
          <h1 className="text-2xl font-medium">Profile</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card animate-fadeUp space-y-4">
            <h2 className="font-medium">Job details</h2>
            <div>
              <p className="text-sm text-mutedtext">Employee ID</p>
              <p className="font-medium">{profile.employee_id}</p>
            </div>
            <div>
              <p className="text-sm text-mutedtext">Full name</p>
              <p className="font-medium">{profile.name}</p>
            </div>
            <div>
              <p className="text-sm text-mutedtext">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-mutedtext">Job title</p>
              <p className="font-medium">{profile.job_title || "Not set by HR yet"}</p>
            </div>
            <div>
              <p className="text-sm text-mutedtext">Department</p>
              <p className="font-medium">{profile.department || "Not set by HR yet"}</p>
            </div>
            <p className="text-xs text-mutedtext">These fields are managed by HR/Admin.</p>
          </div>

          <form onSubmit={handleSave} className="card animate-fadeUp space-y-4 h-fit" style={{ animationDelay: "100ms" }}>
            <h2 className="font-medium">Contact details</h2>
            <p className="text-xs text-mutedtext">You can edit these fields yourself.</p>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">Address</label>
              <textarea
                className="input"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <button className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
