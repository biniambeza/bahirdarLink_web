import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Shield,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Mail,
  User,
  Building2,
  ChevronRight,
  Fingerprint,
  Sparkles,
} from "lucide-react";

/* ─── helpers ───────────────────────────────────────────────── */
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

/* ─── sub-components ────────────────────────────────────────── */
const Alert = ({ type, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "11px 15px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 500,
      lineHeight: 1.5,
      background: type === "error" ? "#fff1f2" : "#f0fdf4",
      border: `1px solid ${type === "error" ? "#fecdd3" : "#bbf7d0"}`,
      color: type === "error" ? "#be123c" : "#15803d",
    }}
  >
    {type === "error" ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
    <span>{children}</span>
  </div>
);

const Label = ({ children }) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".07em",
      textTransform: "uppercase",
      color: "#64748b",
      marginBottom: 6,
    }}
  >
    {children}
  </div>
);

const InputWrap = ({ children }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
    {children}
  </div>
);

/* ─── main ──────────────────────────────────────────────────── */
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
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

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

  const fetchTeamProfile = async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");
      const decoded = decodeToken(token);
      const teamId = decoded?.id || decoded?.userId;
      if (!teamId) throw new Error("Could not extract team ID from token.");

      const res = await axios.get(`${BASE_URL}/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const teamData = res.data?.data || res.data;
      let detail = teamData;
      const agencyId =
        teamData?.agencyId || teamData?.agency?.id || teamData?.agency?._id;
      if (agencyId) {
        try {
          const ar = await axios.get(
            `http://localhost:5000/api/agency/${agencyId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          detail = { ...teamData, agency: ar.data?.data || ar.data };
        } catch {}
      }
      setTeamProfile(detail);
      setEmail(detail?.email || "");
      setProfileError("");
    } catch (err) {
      setProfileError(err.message || "Failed to retrieve team data.");
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
    const trimmed = email.trim();
    if (!trimmed) return setEmailError("Please enter an email address.");
    if (!isValidEmail(trimmed)) return setEmailError("Invalid email address.");
    try {
      setEmailLoading(true);
      const token = localStorage.getItem("token");
      const decoded = decodeToken(token);
      const teamId = decoded?.id || decoded?.userId;
      if (!teamId) throw new Error("Identity lookup failed.");
      await axios.put(
        `${BASE_URL}/${teamId}`,
        { email: trimmed },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setTeamProfile((p) => ({ ...p, email: trimmed }));
      setEmailSuccess(true);
    } catch (err) {
      setEmailError(err.response?.data?.message || "Unable to update email.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword)
      return setPasswordError("New passwords do not match.");
    if (newPassword.length < 6)
      return setPasswordError("Password must be at least 6 characters.");
    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("token");
      const decoded = decodeToken(token);
      const teamId = decoded?.id || decoded?.userId;
      if (!teamId) throw new Error("Identity lookup failed.");
      await axios.put(
        `${BASE_URL}/${teamId}`,
        { oldPassword, password: newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPasswordSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Failed to update password.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  /* strength calc */
  const strength =
    newPassword.length === 0
      ? null
      : newPassword.length < 6
        ? { label: "Weak", color: "#f87171", w: "30%" }
        : newPassword.length < 10
          ? { label: "Fair", color: "#fbbf24", w: "60%" }
          : { label: "Strong", color: "#34d399", w: "100%" };

  const initials = (
    teamProfile?.name ? parseLocalizedText(teamProfile.name) : "TU"
  )
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* input base style */
  const inp = (extra = {}) => ({
    width: "100%",
    padding: "11px 14px",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 13.5,
    fontWeight: 500,
    color: "#0f172a",
    outline: "none",
    transition: "border-color .18s, box-shadow .18s",
    ...extra,
  });

  /* ── loader ── */
  if (profileLoading)
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            background: "linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%)",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            color: "#64748b",
            fontSize: 14,
          }}
        >
          <div className="rts-spin-ring" />
          <p style={{ fontWeight: 600, letterSpacing: ".04em" }}>
            Loading profile…
          </p>
        </div>
      </>
    );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(155deg,#eff6ff 0%,#f8fafc 55%,#f1f5f9 100%)",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          color: "#0f172a",
          padding: "48px 24px 80px",
        }}
      >
        <div
          style={{
            maxWidth: 860,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {/* ── HERO CARD ── */}
          <div
            style={{
              borderRadius: 28,
              background:
                "linear-gradient(135deg,#1d4ed8 0%,#2563eb 45%,#1a56c4 100%)",
              padding: "40px 44px",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              boxShadow:
                "0 20px 60px rgba(37,99,235,.28), 0 4px 16px rgba(0,0,0,.06)",
            }}
          >
            {/* decorative blobs */}
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 240,
                height: 240,
                borderRadius: "50%",
                background: "rgba(255,255,255,.07)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -40,
                left: 160,
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "rgba(255,255,255,.05)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 28,
                flexWrap: "wrap",
              }}
            >
              {/* left */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background: "rgba(255,255,255,.15)",
                    border: "1px solid rgba(255,255,255,.2)",
                    borderRadius: 100,
                    padding: "5px 14px",
                    backdropFilter: "blur(6px)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.9)",
                    marginBottom: 18,
                  }}
                >
                  <Shield size={12} /> Responder Settings
                </div>
                <h1
                  style={{
                    fontSize: "clamp(24px,4vw,34px)",
                    fontWeight: 800,
                    letterSpacing: "-.025em",
                    lineHeight: 1.15,
                    marginBottom: 12,
                  }}
                >
                  {teamProfile?.name
                    ? parseLocalizedText(teamProfile.name)
                    : "Tactical Response Unit"}
                </h1>
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,.72)",
                    maxWidth: 400,
                    fontWeight: 400,
                  }}
                >
                  Manage credentials and contact details for your responder
                  unit.
                </p>
              </div>

              {/* right — profile chips */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minWidth: 220,
                }}
              >
                {[
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
                ].map(({ icon, label, value, mono }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      background: "rgba(255,255,255,.12)",
                      border: "1px solid rgba(255,255,255,.17)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span
                      style={{ color: "rgba(255,255,255,.65)", flexShrink: 0 }}
                    >
                      {icon}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: ".09em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,.55)",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: mono ? 11.5 : 13,
                          fontWeight: 700,
                          fontFamily: mono ? "'DM Mono',monospace" : "inherit",
                          color: "#fff",
                          marginTop: 2,
                          wordBreak: "break-all",
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* profile error */}
          {profileError && <Alert type="error">{profileError}</Alert>}

          {/* ── TWO SECTION CARDS ── */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
            className="rts-grid"
          >
            {/* ── CONTACT CARD ── */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 22,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,.05)",
              }}
            >
              {/* card header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  padding: "22px 26px 20px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Mail size={17} />
                </div>
                <div>
                  <div
                    style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}
                  >
                    Contact Information
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    Update your notification email.
                  </div>
                </div>
              </div>

              {/* card body */}
              <div style={{ padding: "22px 26px" }}>
                <form
                  onSubmit={handleEmailUpdate}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}
                    className="rts-row"
                  >
                    {/* username (readonly) */}
                    <div>
                      <Label>System Username</Label>
                      <div
                        style={{
                          ...inp(),
                          color: "#94a3b8",
                          background: "#f1f5f9",
                          cursor: "default",
                        }}
                      >
                        {teamProfile?.username || "Not assigned"}
                      </div>
                    </div>
                    {/* email */}
                    <div>
                      <Label>Primary Email</Label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailSuccess(false);
                          setEmailError("");
                        }}
                        placeholder="name@example.com"
                        className="rts-input"
                        style={inp()}
                      />
                    </div>
                  </div>

                  {emailError && <Alert type="error">{emailError}</Alert>}
                  {emailSuccess && (
                    <Alert type="success">Email updated successfully.</Alert>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      disabled={emailLoading}
                      className="rts-btn"
                    >
                      {emailLoading && (
                        <Loader2 size={13} className="rts-spin" />
                      )}
                      Save Email <ChevronRight size={13} />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ── PASSWORD CARD ── */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 22,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,.05)",
              }}
            >
              {/* card header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  padding: "22px 26px 20px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Fingerprint size={17} />
                </div>
                <div>
                  <div
                    style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}
                  >
                    Password Rotation
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    Secure your team control panel.
                  </div>
                </div>
              </div>

              {/* card body */}
              <div style={{ padding: "22px 26px" }}>
                <form
                  onSubmit={handlePasswordUpdate}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {/* current password */}
                  <div>
                    <Label>Current Password</Label>
                    <InputWrap>
                      <input
                        type={showOld ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                        className="rts-input"
                        style={inp({ paddingRight: 44 })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOld(!showOld)}
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          height: "100%",
                          padding: "0 13px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </InputWrap>
                  </div>

                  {/* new / confirm */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                    className="rts-row"
                  >
                    <div>
                      <Label>New Password</Label>
                      <InputWrap>
                        <input
                          type={showNew ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 chars"
                          required
                          className="rts-input"
                          style={inp({ paddingRight: 44 })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            height: "100%",
                            padding: "0 13px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </InputWrap>
                    </div>
                    <div>
                      <Label>Confirm Password</Label>
                      <InputWrap>
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          required
                          className="rts-input"
                          style={inp({ paddingRight: 44 })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            height: "100%",
                            padding: "0 13px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {showConfirm ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </InputWrap>
                    </div>
                  </div>

                  {/* strength bar */}
                  {strength && (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 4,
                          background: "#f1f5f9",
                          borderRadius: 100,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: strength.w,
                            background: strength.color,
                            borderRadius: 100,
                            transition: "width .35s, background .35s",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: strength.color,
                          letterSpacing: ".06em",
                          textTransform: "uppercase",
                          minWidth: 42,
                        }}
                      >
                        {strength.label}
                      </span>
                    </div>
                  )}

                  {passwordError && <Alert type="error">{passwordError}</Alert>}
                  {passwordSuccess && (
                    <Alert type="success">Password updated successfully.</Alert>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      paddingTop: 2,
                    }}
                  >
                    <button
                      type="submit"
                      disabled={
                        passwordLoading ||
                        !oldPassword ||
                        !newPassword ||
                        !confirmPassword
                      }
                      className="rts-btn"
                    >
                      {passwordLoading && (
                        <Loader2 size={13} className="rts-spin" />
                      )}
                      Update Password <ChevronRight size={13} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* ── footer note ── */}
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 500,
            }}
          >
            Changes are saved immediately to your account.
          </p>
        </div>
      </div>
    </>
  );
};

/* ─── global CSS (minimal) ──────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

.rts-spin-ring {
  width: 38px; height: 38px;
  border: 3px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: rts-spin .75s linear infinite;
}

.rts-spin { animation: rts-spin .7s linear infinite; }

@keyframes rts-spin { to { transform: rotate(360deg); } }

.rts-input:focus {
  border-color: #60a5fa !important;
  background: #fff !important;
  box-shadow: 0 0 0 3px rgba(96,165,250,.18) !important;
}

.rts-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37,99,235,.32);
  transition: transform .16s, box-shadow .16s, opacity .16s;
}

.rts-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(37,99,235,.38);
}

.rts-btn:disabled {
  opacity: .4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 700px) {
  .rts-grid { grid-template-columns: 1fr !important; }
  .rts-row  { grid-template-columns: 1fr !important; }
}
`;

export default ResponderTeamSettingsPage;
