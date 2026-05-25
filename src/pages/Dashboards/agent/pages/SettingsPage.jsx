import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Shield,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  Mail,
  RefreshCcw,
  Briefcase,
  MapPin,
  User,
} from "lucide-react";

const decodeToken = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Token decoding failed:", error);
    return null;
  }
};

const AgencySettingsPage = () => {
  const [agencyProfile, setAgencyProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const BASE_URL = "http://localhost:5000/api/agency";

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  /**
   * ENFORCES ENGLISH ONLY EXTRACTION
   * Unwraps multi-stringified JSON metadata or translations cleanly
   */
  const parseEnglishText = (val) => {
    if (!val) return "—";
    let currentVal = val;

    while (typeof currentVal === "string") {
      const trimmed = currentVal.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          currentVal = JSON.parse(trimmed);
        } catch (e) {
          break;
        }
      } else {
        break;
      }
    }

    if (typeof currentVal === "object" && currentVal !== null) {
      return currentVal.en || currentVal.name?.en || currentVal.name || "—";
    }
    return String(currentVal);
  };

  const fetchAgencyProfile = async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");
      const decoded = decodeToken(token);

      // Extract agencyId from standard payload claims
      const agencyId = decoded?.agencyId || decoded?.id || decoded?.userId;

      if (!agencyId) {
        throw new Error(
          "Identity verification failure: Could not discover an agency profile reference in your session.",
        );
      }

      const res = await axios.get(`${BASE_URL}/${agencyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const agencyData = res.data?.data || res.data;

      setAgencyProfile(agencyData);
      setEmail(agencyData?.email || "");
      setProfileError("");
    } catch (err) {
      console.error("Agency metadata extraction fault:", err);
      setProfileError(
        err.response?.data?.error ||
          err.message ||
          "Failed to retrieve administrative agency parameters from resource pool.",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencyProfile();
  }, []);

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError(
        "An updated operational email contact parameter is required.",
      );
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Invalid email sequence formatting.");
      return;
    }

    try {
      setEmailLoading(true);
      const token = localStorage.getItem("token");
      const agencyId = agencyProfile?.id || decodeToken(token)?.agencyId;

      await axios.put(
        `${BASE_URL}/${agencyId}`,
        { email: trimmedEmail },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setAgencyProfile((prev) => ({ ...prev, email: trimmedEmail }));
      setEmailSuccess(true);
    } catch (err) {
      console.error("Email mutations rejected:", err);
      setEmailError(
        err.response?.data?.message ||
          "Could not update target resource email path.",
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New verification keys do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "Security policy mismatch: Key length must register >= 6 digits.",
      );
      return;
    }

    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("token");
      const agencyId = agencyProfile?.id || decodeToken(token)?.agencyId;

      await axios.put(
        `${BASE_URL}/${agencyId}`,
        {
          oldPassword,
          password: newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setPasswordSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Administrative signature modification rejected:", err);
      setPasswordError(
        err.response?.data?.message ||
          "Resource coordinator rejected security key update sequence.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin text-[#0052CC] mb-4" size={36} />
        <p className="text-xs font-black uppercase tracking-[0.3em]">
          Syncing Administrative Agency Parameters...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Card Header */}
        <header className="rounded-[2.5rem] bg-gradient-to-r from-slate-950 via-slate-900 to-[#0052CC] p-10 text-white shadow-xl overflow-hidden relative border border-slate-800">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.3),_transparent_50%)] pointer-events-none" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] items-center">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-slate-200 font-black shadow-sm backdrop-blur-md">
                <Building2 size={14} /> Agency Management Panel
              </p>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
                {parseEnglishText(
                  agencyProfile?.name || "Administrative Office",
                )}
              </h1>
              <p className="max-w-xl text-slate-300 text-sm font-medium leading-relaxed">
                Configure global settings, update authentication routes, and
                change contact configurations handling operational dispatches.
              </p>
            </div>

            <div className="rounded-3xl bg-black/20 border border-white/10 p-6 shadow-inner backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mb-4">
                Identity Profile
              </p>
              <div className="space-y-3 text-sm">
                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Classification
                    </p>
                    <p className="mt-0.5 text-sm font-black text-white">
                      {parseEnglishText(
                        agencyProfile?.agencyType?.name ||
                          agencyProfile?.type ||
                          "General Core",
                      )}
                    </p>
                  </div>
                  <Briefcase size={18} className="text-slate-500" />
                </div>
                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Jurisdiction Kebele
                    </p>
                    <p className="mt-0.5 text-sm font-black text-white">
                      {parseEnglishText(
                        agencyProfile?.kebele?.name ||
                          agencyProfile?.kebele ||
                          "All Sectors",
                      )}
                    </p>
                  </div>
                  <MapPin size={18} className="text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {profileError && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm text-rose-800">
            <div className="flex items-center gap-3 font-black text-sm uppercase tracking-wider">
              <AlertCircle size={18} className="text-rose-600" />
              Resource Interruption Alert
            </div>
            <p className="mt-2 text-sm text-rose-700 font-medium">
              {profileError}
            </p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="space-y-8">
            {/* Context Config Form */}
            <div className="rounded-[2.5rem] bg-white border border-slate-200 p-8 shadow-sm shadow-blue-900/5">
              <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Contact Channels
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Maintain valid email mappings for programmatic alert
                    escalations.
                  </p>
                </div>
                <Mail className="text-slate-400" size={20} />
              </div>

              <form onSubmit={handleEmailUpdate} className="mt-6 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      System Username
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-sm font-semibold shadow-inner flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span>{agencyProfile?.username || "Not assigned"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Administrative Gateway Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailSuccess(false);
                        setEmailError("");
                      }}
                      placeholder="agency@municipal.gov"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium text-sm outline-none focus:border-[#0052CC] focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                {emailError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}

                {emailSuccess && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>
                      Operational routing parameters updated successfully.
                    </span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:opacity-40"
                  >
                    {emailLoading && (
                      <Loader2 size={12} className="animate-spin mr-2" />
                    )}
                    Save Parameters
                  </button>
                </div>
              </form>
            </div>

            {/* Password Management Block */}
            <div className="rounded-[2.5rem] bg-white border border-slate-200 p-8 shadow-sm shadow-blue-900/5">
              <div className="pb-6 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Lock className="text-[#0052CC]" size={20} />
                  Credential Rotation Block
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Enforce strict cryptographic rotations to shield security
                  credentials.
                </p>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-5 mt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Active Clearance Password
                  </label>
                  <div className="relative">
                    <KeyRound
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type={showOld ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Input active password sequence..."
                      required
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:bg-white focus:border-[#0052CC] transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Target Core Crypt-Key
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 alphanumeric values"
                        required
                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:bg-white focus:border-[#0052CC] transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Confirm Core Crypt-Key
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type key sequence..."
                        required
                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:bg-white focus:border-[#0052CC] transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-bold">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>
                      Cryptographic properties updated across authentication
                      nodes successfully.
                    </span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={
                      passwordLoading ||
                      !oldPassword ||
                      !newPassword ||
                      !confirmPassword
                    }
                    className="w-full sm:w-auto bg-slate-950 hover:bg-[#0052CC] text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
                  >
                    {passwordLoading && (
                      <Loader2 size={12} className="animate-spin" />
                    )}
                    <span>Commit Signature Rotations</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencySettingsPage;
