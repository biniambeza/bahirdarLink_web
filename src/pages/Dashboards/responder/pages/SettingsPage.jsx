import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Shield,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Phone,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  Radio,
  Mail,
  User,
  RefreshCcw,
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

const ResponderTeamSettingsPage = () => {
  const [teamProfile, setTeamProfile] = useState(null);
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

  const BASE_URL = "http://localhost:5000/api/responderTeam";

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const parseLocalizedText = (val) => {
    if (!val) return "—";
    if (typeof val === "object") return val.en || val.am || "—";
    if (typeof val === "string" && val.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(val);
        return parsed.en || parsed.am || "—";
      } catch (e) {}
    }
    return String(val);
  };

  const getAgencyTypeLabel = () => {
    const agencyTypeName =
      teamProfile?.agency?.agencyType?.name ||
      teamProfile?.agency?.AgencyType?.name ||
      teamProfile?.agencyType?.name ||
      teamProfile?.agency?.type ||
      teamProfile?.agencyType ||
      teamProfile?.agency?.name;

    const agencyTypeId =
      teamProfile?.agency?.agencyTypeId ||
      teamProfile?.agencyTypeId ||
      teamProfile?.agency?.agencyType?.id ||
      teamProfile?.agencyType?.id;

    if (agencyTypeName) {
      return parseLocalizedText(agencyTypeName);
    }

    if (agencyTypeId) {
      return `Agency type #${agencyTypeId}`;
    }

    return "Unknown agency type";
  };

  const fetchTeamProfile = async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");
      const decoded = decodeToken(token);

      const teamId = decoded?.id || decoded?.userId;

      if (!teamId) {
        throw new Error(
          "Could not extract a valid team ID identifier from your login token.",
        );
      }

      const res = await axios.get(`${BASE_URL}/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const teamData = res.data?.data || res.data;
      let detailedTeamData = teamData;
      const agencyId =
        teamData?.agencyId || teamData?.agency?.id || teamData?.agency?._id;

      if (agencyId) {
        try {
          const agencyRes = await axios.get(
            `http://localhost:5000/api/agency/${agencyId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const agencyData = agencyRes.data?.data || agencyRes.data;
          detailedTeamData = { ...teamData, agency: agencyData };
        } catch (agencyErr) {
          console.warn("Failed to fetch responder agency metadata:", agencyErr);
        }
      }

      setTeamProfile(detailedTeamData);
      setEmail(detailedTeamData?.email || "");
      setProfileError("");
    } catch (err) {
      console.error("Responder profile sync failure:", err);
      setProfileError(
        err.message ||
          "Failed to retrieve team data. Verify that your auth token holds the identifier payload.",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamProfile();
  }, []);

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Please enter an email address.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      setEmailLoading(true);
      const token = localStorage.getItem("token");
      const decoded = decodeToken(token);
      const teamId = decoded?.id || decoded?.userId;

      if (!teamId) {
        throw new Error("Identity lookup failed. Please log in again.");
      }

      await axios.put(
        `${BASE_URL}/${teamId}`,
        { email: trimmedEmail },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setTeamProfile((prev) => ({ ...prev, email: trimmedEmail }));
      setEmailSuccess(true);
      setEmailError("");
    } catch (err) {
      console.error("Email update failed:", err);
      setEmailError(
        err.response?.data?.message ||
          "Unable to update email. Please try again later.",
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
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "Security policy failure: Password must be at least 6 characters.",
      );
      return;
    }

    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("token");
      const decoded = decodeToken(token);
      const teamId = decoded?.id || decoded?.userId;

      if (!teamId) {
        throw new Error("Identity lookup failed. Please log in again.");
      }

      await axios.put(
        `${BASE_URL}/${teamId}`,
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
      console.error("Password alteration rejected:", err);
      setPasswordError(
        err.response?.data?.message ||
          "Failed to process profile changes with the resource handler.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={36} />
        <p className="text-sm font-medium tracking-wide">
          Syncing emergency unit cluster profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="rounded-[2rem] bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 p-10 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.25),_transparent_40%)] pointer-events-none" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.35fr_0.85fr] items-center">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 font-semibold shadow-sm">
                <Shield size={16} /> Responder Settings
              </p>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                {teamProfile?.name
                  ? parseLocalizedText(teamProfile.name)
                  : "Tactical Response Unit"}
              </h1>
              <p className="max-w-2xl text-slate-200 text-sm leading-7">
                Update your responder credentials and contact information. Keep
                the team's email current for notifications and restore access
                securely with a password rotation.
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-white/10 border border-white/10 p-6 shadow-sm backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-200/80 font-semibold mb-3">
                Profile Summary
              </p>
              <div className="space-y-4 text-slate-100 text-sm">
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-300 font-semibold">
                    Agency Type
                  </p>
                  <p className="mt-2 text-base font-semibold">
                    {getAgencyTypeLabel()}
                  </p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-300 font-semibold">
                    Username
                  </p>
                  <p className="mt-2 text-base font-semibold">
                    {teamProfile?.username || "Not assigned"}
                  </p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-300 font-semibold">
                    Email
                  </p>
                  <p className="mt-2 text-base font-semibold break-words">
                    {teamProfile?.email || "No email on file"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {profileError && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm text-amber-800">
            <div className="flex items-center gap-3 font-semibold">
              <AlertCircle size={18} className="text-amber-600" />
              Identity Synchronization Interrupted
            </div>
            <p className="mt-3 text-sm text-amber-700">{profileError}</p>
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="rounded-[1.75rem] bg-white border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Contact Information
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Update the email used for notifications and account
                    recovery.
                  </p>
                </div>
                <RefreshCcw className="text-slate-400" size={20} />
              </div>

              <form onSubmit={handleEmailUpdate} className="mt-7 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      System Username
                    </label>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600">
                      {teamProfile?.username || "Not assigned"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Primary Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailSuccess(false);
                        setEmailError("");
                      }}
                      placeholder="name@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {emailError && (
                  <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{emailError}</span>
                  </div>
                )}

                {emailSuccess && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Email updated successfully.</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {emailLoading ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : null}
                    Save email
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-[1.75rem] bg-white border border-slate-200 p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2.5">
                  <Lock className="text-blue-600" size={20} />
                  Password Rotation
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Rotate the password guarding your team control panel.
                </p>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current Unit Password
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
                      placeholder="Enter team current password..."
                      required
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:bg-white focus:border-blue-500 transition-all font-medium"
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
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      New Password Key
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
                        placeholder="Minimum 6 characters"
                        required
                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:bg-white focus:border-blue-500 transition-all font-medium"
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
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Confirm New Password Key
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
                        placeholder="Verify choice..."
                        required
                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:bg-white focus:border-blue-500 transition-all font-medium"
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
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-600 text-sm font-medium">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>Team signature records successfully committed.</span>
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
                    className="w-full sm:w-auto bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:hover:bg-slate-900"
                  >
                    {passwordLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : null}
                    <span>Commit Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResponderTeamSettingsPage;
