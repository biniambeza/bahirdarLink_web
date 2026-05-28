import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Fingerprint,
  Building2,
  User,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

/* ─── API CONFIGURATION ─────────────────────────────────────── */
const API = axios.create({
  baseURL: "https://bahirlink-backend-1.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ─── UTILITIES ─────────────────────────────────────────────── */
const decodeToken = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    );
  } catch {
    return null;
  }
};

const parseLocalizedText = (val) => {
  if (!val) return "—";
  if (typeof val === "object") return val.en || val.am || "—";
  if (typeof val === "string" && val.trim().startsWith("{")) {
    try {
      const p = JSON.parse(val);
      return p.en || p.am || "—";
    } catch {}
  }
  return String(val);
};

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/* ─── SHARED UI COMPONENTS ──────────────────────────────────── */
const Alert = ({ type, children }) => {
  const isError = type === "error";
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border ${
        isError
          ? "bg-rose-50 border-rose-200 text-rose-700"
          : "bg-emerald-50 border-emerald-200 text-emerald-700"
      }`}
    >
      {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      <span>{children}</span>
    </div>
  );
};

const FieldLabel = ({ children }) => (
  <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-1.5">
    {children}
  </label>
);

const FormInput = ({ type = "text", ...props }) => (
  <input
    type={type}
    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60 disabled:bg-slate-100"
    {...props}
  />
);

/* ─── ISOLATED FEATURE FORMS ────────────────────────────────── */
const EmailForm = ({ initialEmail, username, teamId, onUpdateSuccess }) => {
  const [email, setEmail] = useState(initialEmail || "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  useEffect(() => {
    setEmail(initialEmail || "");
  }, [initialEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    const trimmed = email.trim();
    if (!trimmed)
      return setStatus({
        type: "error",
        message: "Please enter an email address.",
      });
    if (!isValidEmail(trimmed))
      return setStatus({ type: "error", message: "Invalid email address." });

    try {
      setLoading(true);
      await API.put(`/responderTeam/${teamId}`, { email: trimmed });
      setStatus({ type: "success", message: "Email updated successfully." });
      onUpdateSuccess(trimmed);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to update email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3.5 px-6 py-5 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Mail size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Contact Information
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Update your notification email.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>System Username</FieldLabel>
            <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-400 cursor-not-allowed">
              {username || "Not assigned"}
            </div>
          </div>
          <div>
            <FieldLabel>Primary Email</FieldLabel>
            <FormInput
              type="email"
              value={email}
              placeholder="name@example.com"
              onChange={(e) => {
                setEmail(e.target.value);
                setStatus({ type: null, message: "" });
              }}
            />
          </div>
        </div>

        {status.type && <Alert type={status.type}>{status.message}</Alert>}

        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 hover:to-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Save Email <ChevronRight size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

const PasswordForm = ({ teamId }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    if (newPassword !== confirmPassword) {
      return setStatus({
        type: "error",
        message: "New passwords do not match.",
      });
    }
    if (newPassword.length < 6) {
      return setStatus({
        type: "error",
        message: "Password must be at least 6 characters.",
      });
    }

    try {
      setLoading(true);
      await API.put(`/responderTeam/${teamId}`, {
        oldPassword,
        password: newPassword,
      });
      setStatus({ type: "success", message: "Password updated successfully." });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    if (newPassword.length === 0) return null;
    if (newPassword.length < 6)
      return {
        label: "Weak",
        color: "bg-rose-500",
        text: "text-rose-500",
        width: "w-[30%]",
      };
    if (newPassword.length < 10)
      return {
        label: "Fair",
        color: "bg-amber-500",
        text: "text-amber-500",
        width: "w-[60%]",
      };
    return {
      label: "Strong",
      color: "bg-emerald-500",
      text: "text-emerald-500",
      width: "w-full",
    };
  };

  const strength = getStrength();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-3.5 px-6 py-5 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Fingerprint size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Password Rotation
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Secure your team control panel.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
        <div>
          <FieldLabel>Current Password</FieldLabel>
          <div className="relative flex items-center">
            <FormInput
              type={showOld ? "text" : "password"}
              value={oldPassword}
              placeholder="Enter current password"
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-0 h-full px-3.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>New Password</FieldLabel>
            <div className="relative flex items-center">
              <FormInput
                type={showNew ? "text" : "password"}
                value={newPassword}
                placeholder="Min. 6 chars"
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-0 h-full px-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <FieldLabel>Confirm Password</FieldLabel>
            <div className="relative flex items-center">
              <FormInput
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                placeholder="Repeat password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-0 h-full px-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {strength && (
          <div className="flex items-center gap-2.5 mt-1">
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${strength.color} rounded-full transition-all duration-300 ${strength.width}`}
              />
            </div>
            <span
              className={`text-[10px] font-bold tracking-wider uppercase min-w-[42px] ${strength.text}`}
            >
              {strength.label}
            </span>
          </div>
        )}

        {status.type && <Alert type={status.type}>{status.message}</Alert>}

        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={
              loading || !oldPassword || !newPassword || !confirmPassword
            }
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 hover:to-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Update Password <ChevronRight size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

/* ─── MAIN COMPONENT ────────────────────────────────────────── */
const ResponderTeamSettingsPage = () => {
  const [teamProfile, setTeamProfile] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAgencyTypeLabel = () => {
    const name =
      teamProfile?.agency?.agencyType?.name ||
      teamProfile?.agency?.AgencyType?.name ||
      teamProfile?.agencyType?.name ||
      teamProfile?.agency?.type ||
      teamProfile?.agencyType ||
      teamProfile?.agency?.name;
    const id =
      teamProfile?.agency?.agencyTypeId ||
      teamProfile?.agencyTypeId ||
      teamProfile?.agency?.agencyType?.id ||
      teamProfile?.agencyType?.id;
    if (name) return parseLocalizedText(name);
    if (id) return `Agency type #${id}`;
    return "Unknown agency type";
  };

  useEffect(() => {
    const fetchTeamProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const decoded = decodeToken(token);
        const extractedId = decoded?.id || decoded?.userId;
        if (!extractedId)
          throw new Error("Could not extract team ID from token.");
        setTeamId(extractedId);

        const res = await API.get(`/responderTeam/${extractedId}`);
        const teamData = res.data?.data || res.data;
        let detail = teamData;

        const agencyId =
          teamData?.agencyId || teamData?.agency?.id || teamData?.agency?._id;
        if (agencyId) {
          try {
            const ar = await API.get(`/agency/${agencyId}`);
            detail = { ...teamData, agency: ar.data?.data || ar.data };
          } catch (agencyErr) {
            console.error(
              "Failed to append agency details details:",
              agencyErr,
            );
          }
        }
        setTeamProfile(detail);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to retrieve team data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-50 to-slate-50 font-sans text-slate-400">
        <div className="w-9 h-9 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="font-semibold tracking-wide text-sm">Loading profile…</p>
      </div>
    );
  }

  const metadataRows = [
    {
      icon: <Building2 size={13} />,
      label: "Agency Type",
      value: getAgencyTypeLabel(),
    },
    {
      icon: <User size={13} />,
      label: "Username",
      value: teamProfile?.username || "Not assigned",
    },
    {
      icon: <Mail size={13} />,
      label: "Email",
      value: teamProfile?.email || "No email on file",
      mono: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-slate-100 font-sans text-slate-900 px-6 py-12 md:pb-20">
      <div className="max-w-4xl mx-auto flex flex-col gap-7">
        {/* ── HERO BANNER ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 p-10 text-white shadow-xl shadow-blue-600/20">
          {/* Decorative shapes */}
          <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-10 left-40 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-7">
            <div className="flex-1 min-w-[220px]">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold tracking-widest uppercase text-white/90 backdrop-blur-md mb-4.5">
                <Shield size={12} /> Responder Settings
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-none mb-3">
                {teamProfile?.name
                  ? parseLocalizedText(teamProfile.name)
                  : "Tactical Response Unit"}
              </h1>
              <p className="text-sm leading-relaxed text-blue-100/70 max-w-md font-normal">
                Manage credentials and contact details for your responder unit.
              </p>
            </div>

            {/* Quick Metadata Info Container */}
            <div className="flex flex-col gap-2 min-w-[240px]">
              {metadataRows.map(({ icon, label, value, mono }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl p-3 backdrop-blur-md"
                >
                  <span className="text-white/60 shrink-0">{icon}</span>
                  <div>
                    <div className="text-[9px] font-bold tracking-widest uppercase text-white/50">
                      {label}
                    </div>
                    <div
                      className={`text-sm font-bold text-white mt-0.5 break-all ${mono ? "font-mono text-xs" : ""}`}
                    >
                      {value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {/* ── ACTIONS GRIDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <EmailForm
            initialEmail={teamProfile?.email}
            username={teamProfile?.username}
            teamId={teamId}
            onUpdateSuccess={(updatedEmail) =>
              setTeamProfile((prev) => ({ ...prev, email: updatedEmail }))
            }
          />
          <PasswordForm teamId={teamId} />
        </div>

        <p className="text-center text-xs font-medium text-slate-400">
          Changes are saved immediately to your account.
        </p>
      </div>
    </div>
  );
};

export default ResponderTeamSettingsPage;
