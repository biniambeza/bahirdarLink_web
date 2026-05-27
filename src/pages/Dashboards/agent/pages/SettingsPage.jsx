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
  Briefcase,
  MapPin,
  User,
  ChevronRight,
  Fingerprint,
} from "lucide-react";

/* ─── HELPERS ────────────────────────────────────────────────── */
const decodeToken = (token) => {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
  } catch (error) {
    console.error("Token decoding failed:", error);
    return null;
  }
};

const parseEnglishText = (val) => {
  if (!val) return "—";
  let cur = val;
  while (typeof cur === "string") {
    const t = cur.trim();
    if (t.startsWith("{") && t.endsWith("}")) {
      try {
        cur = JSON.parse(t);
      } catch {
        break;
      }
    } else break;
  }
  if (typeof cur === "object" && cur !== null) {
    return cur.en || cur.name?.en || cur.name || "—";
  }
  return String(cur);
};

/* ─── UI SUB-COMPONENTS ──────────────────────────────────────── */
const Alert = ({ type, children }) => (
  <div style={type === "error" ? styles.alertError : styles.alertSuccess}>
    {type === "error" ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
    <span>{children}</span>
  </div>
);

const Label = ({ children }) => <div style={styles.label}>{children}</div>;

const InputWrap = ({ children }) => <div style={styles.inputWrap}>{children}</div>;

const EyeBtn = ({ show, onToggle }) => (
  <button type="button" onClick={onToggle} style={styles.eyeBtn}>
    {show ? <EyeOff size={15} /> : <Eye size={15} />}
  </button>
);

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
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

  // Pointed straight to production deployment
  const BASE_URL = "https://bahirlink-backend.onrender.com/api/agency";
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const getRequestConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  const fetchAgencyProfile = async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");
      const decoded = decodeToken(token);
      const agencyId = decoded?.agencyId || decoded?.id || decoded?.userId;
      
      if (!agencyId) throw new Error("Could not extract agency ID from authentication parameters.");
      
      const res = await axios.get(`${BASE_URL}/${agencyId}`, getRequestConfig());
      const data = res.data?.data || res.data;
      
      setAgencyProfile(data);
      setEmail(data?.email || "");
      setProfileError("");
    } catch (err) {
      setProfileError(
        err.response?.data?.error || err.response?.data?.message || err.message || "Failed to load agency profile parameters."
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
    const trimmed = email.trim();
    
    if (!trimmed) return setEmailError("Please provide a fallback notification address.");
    if (!isValidEmail(trimmed)) return setEmailError("Invalid email address syntax detected.");
    
    try {
      setEmailLoading(true);
      const token = localStorage.getItem("token");
      const agencyId = agencyProfile?.id || agencyProfile?._id || decodeToken(token)?.agencyId;
      
      await axios.put(`${BASE_URL}/${agencyId}`, { email: trimmed }, getRequestConfig());
      
      setAgencyProfile((p) => ({ ...p, email: trimmed }));
      setEmailSuccess(true);
    } catch (err) {
      setEmailError(err.response?.data?.message || err.response?.data?.error || "Unable to write configuration parameters back to node.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    
    if (newPassword !== confirmPassword) return setPasswordError("New passwords do not match.");
    if (newPassword.length < 6) return setPasswordError("Password configuration must meet standard requirements (Min. 6 chars).");
    
    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("token");
      const agencyId = agencyProfile?.id || agencyProfile?._id || decodeToken(token)?.agencyId;
      
      await axios.put(`${BASE_URL}/${agencyId}`, { oldPassword, password: newPassword }, getRequestConfig());
      
      setPasswordSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.response?.data?.error || "Verification mismatch or handshake failure.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const strength =
    newPassword.length === 0
      ? null
      : newPassword.length < 6
        ? { label: "Weak Profile", color: "#ef4444", w: "33%" }
        : newPassword.length < 10
          ? { label: "Medium Security", color: "#f59e0b", w: "66%" }
          : { label: "Industrial Safe", color: "#10b981", w: "100%" };

  if (profileLoading) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div style={styles.loaderContainer}>
          <div className="rts-spin-ring" />
          <p style={{ fontWeight: 600, letterSpacing: ".04em" }}>Synchronizing configuration parameters…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={styles.pageWrapper}>
        <div style={styles.pageContainer}>
          
          {/* ── HERO BANNER ── */}
          <div style={styles.heroBanner}>
            <div style={styles.heroCircleTop} />
            <div style={styles.heroCircleBottom} />

            <div style={styles.heroContent}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={styles.heroBadge}>
                  <Building2 size={12} /> Core Command Settings
                </div>
                <h1 style={styles.heroHeading}>
                  {parseEnglishText(agencyProfile?.name || "Administrative Portal")}
                </h1>
                <p style={styles.heroSubtext}>
                  Configure deployment metadata, update fallback notification routes, and manage administrative clearance parameters.
                </p>
              </div>

              <div style={styles.metaChipsGroup}>
                {[
                  {
                    icon: <Briefcase size={13} />,
                    label: "Classification",
                    value: parseEnglishText(agencyProfile?.agencyType?.name || agencyProfile?.type || "General Node"),
                  },
                  {
                    icon: <MapPin size={13} />,
                    label: "Jurisdiction Sector",
                    value: parseEnglishText(agencyProfile?.kebele?.name || agencyProfile?.kebele || "Global Bounds"),
                  },
                  {
                    icon: <User size={13} />,
                    label: "Node Identity",
                    value: agencyProfile?.username || "unassigned",
                  },
                  {
                    icon: <Mail size={13} />,
                    label: "Notification Path",
                    value: agencyProfile?.email || "No email on file",
                    mono: true,
                  },
                ].map(({ icon, label, value, mono }) => (
                  <div key={label} style={styles.metaChip}>
                    <span style={styles.metaChipIcon}>{icon}</span>
                    <div>
                      <div style={styles.metaChipLabel}>{label}</div>
                      <div style={{ ...styles.metaChipValue, fontFamily: mono ? "'DM Mono', monospace" : "inherit", fontSize: mono ? 11.5 : 13 }}>
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {profileError && <Alert type="error">{profileError}</Alert>}

          {/* ── TWO COLUMN SETTINGS GRID ── */}
          <div className="rts-grid" style={styles.settingsGrid}>
            
            {/* ── CONTACT PROFILE ── */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderIconContainer}>
                  <Mail size={17} />
                </div>
                <div>
                  <div style={styles.cardTitle}>Notification Channels</div>
                  <div style={styles.cardSubtitle}>Update administrative routing addresses.</div>
                </div>
              </div>

              <div style={{ padding: "22px 26px" }}>
                <form onSubmit={handleEmailUpdate} style={styles.formLayout}>
                  <div className="rts-row" style={styles.formGridRow}>
                    <div>
                      <Label>Node System ID</Label>
                      <div style={styles.disabledInputDisplay}>
                        <User size={13} style={{ color: "#cbd5e1", flexShrink: 0 }} />
                        {agencyProfile?.username || "unassigned"}
                      </div>
                    </div>
                    <div>
                      <Label>Operational Email</Label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailSuccess(false);
                          setEmailError("");
                        }}
                        placeholder="agency@municipal.gov"
                        className="rts-input"
                        style={styles.textInput}
                      />
                    </div>
                  </div>

                  {emailError && <Alert type="error">{emailError}</Alert>}
                  {emailSuccess && <Alert type="success">Fallback notification vector re-routed successfully.</Alert>}

                  <div style={styles.actionBtnContainer}>
                    <button type="submit" disabled={emailLoading} className="rts-btn">
                      {emailLoading && <Loader2 size={13} className="rts-spin" />}
                      Commit Changes <ChevronRight size={13} />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ── SECURITY PROFILE ── */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderIconContainer}>
                  <Fingerprint size={17} />
                </div>
                <div>
                  <div style={styles.cardTitle}>Credential Rotation</div>
                  <div style={styles.cardSubtitle}>Cycle secure authorization hashes immediately.</div>
                </div>
              </div>

              <div style={{ padding: "22px 26px" }}>
                <form onSubmit={handlePasswordUpdate} style={styles.formLayout}>
                  <div>
                    <Label>Active Authorization Password</Label>
                    <InputWrap>
                      <input
                        type={showOld ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter active security pass"
                        required
                        className="rts-input"
                        style={{ ...styles.textInput, paddingRight: 44 }}
                      />
                      <EyeBtn show={showOld} onToggle={() => setShowOld(!showOld)} />
                    </InputWrap>
                  </div>

                  <div className="rts-row" style={styles.formGridRow}>
                    <div>
                      <Label>Target Password</Label>
                      <InputWrap>
                        <input
                          type={showNew ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          required
                          className="rts-input"
                          style={{ ...styles.textInput, paddingRight: 44 }}
                        />
                        <EyeBtn show={showNew} onToggle={() => setShowNew(!showNew)} />
                      </InputWrap>
                    </div>
                    <div>
                      <Label>Confirm Target Verification</Label>
                      <InputWrap>
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat string alignment"
                          required
                          className="rts-input"
                          style={{ ...styles.textInput, paddingRight: 44 }}
                        />
                        <EyeBtn show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
                      </InputWrap>
                    </div>
                  </div>

                  {strength && (
                    <div style={styles.strengthRow}>
                      <div style={styles.strengthTrack}>
                        <div
                          style={{
                            height: "100%",
                            width: strength.w,
                            background: strength.color,
                            borderRadius: 100,
                            transition: "width .3s ease, background .3s ease",
                          }}
                        />
                      </div>
                      <span style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</span>
                    </div>
                  )}

                  {passwordError && <Alert type="error">{passwordError}</Alert>}
                  {passwordSuccess && <Alert type="success">Access sequence rotated successfully.</Alert>}

                  <div style={styles.actionBtnContainer}>
                    <button
                      type="submit"
                      disabled={passwordLoading || !oldPassword || !newPassword || !confirmPassword}
                      className="rts-btn"
                    >
                      {passwordLoading && <Loader2 size={13} className="rts-spin" />}
                      Execute Roll <ChevronRight size={13} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <p style={styles.footerNotice}>All structural parameters safely persist to main database layers instantly.</p>
        </div>
      </div>
    </>
  );
};

/* ─── CENTRALIZED ARCHITECTURE STYLES ─────────────────────────── */
const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background: "linear-gradient(155deg,#f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    color: "#0f172a",
    padding: "48px 24px 80px",
  },
  pageContainer: {
    maxWidth: 920,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  loaderContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justify() { return "center"; },
    justifyContent: "center",
    gap: 16,
    background: "#f8fafc",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    color: "#64748b",
    fontSize: 13,
  },
  heroBanner: {
    borderRadius: 24,
    background: "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%)",
    padding: "38px 40px",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 20px 40px -15px rgba(15,23,42,0.3)",
    border: "1px solid #334155",
  },
  heroCircleTop: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: "50%",
    background: "rgba(255,255,255,.03)",
    pointerEvents: "none",
  },
  heroCircleBottom: {
    position: "absolute",
    bottom: -40,
    left: 160,
    width: 160,
    height: 160,
    borderRadius: "50%",
    background: "rgba(255,255,255,.02)",
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 28,
    flexWrap: "wrap",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 8,
    padding: "5px 12px",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    color: "#38bdf8",
    marginBottom: 16,
  },
  heroHeading: {
    fontSize: "clamp(22px,3.5vw,30px)",
    fontWeight: 800,
    letterSpacing: "-.02em",
    lineHeight: 1.2,
    marginBottom: 10,
    color: "#f8fafc",
  },
  heroSubtext: {
    fontSize: 13,
    lineHeight: 1.65,
    color: "#94a3b8",
    maxWidth: 420,
    fontWeight: 400,
  },
  metaChipsGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 260,
    flex: "1 1 260px",
  },
  metaChip: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(15,23,42,0.4)",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: "10px 14px",
    backdropFilter: "blur(4px)",
  },
  metaChipIcon: {
    color: "#38bdf8",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
  },
  metaChipLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    color: "#64748b",
  },
  metaChipValue: {
    fontWeight: 600,
    color: "#e2e8f0",
    marginTop: 1,
    wordBreak: "break-all",
  },
  settingsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "20px 24px",
    borderBottom: "1px solid #f1f5f9",
    background: "#fafafa",
  },
  cardHeaderIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#f1f5f9",
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid #e2e8f0",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: "#64748b",
    marginTop: 1,
  },
  formLayout: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  formGridRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  textInput: {
    width: "100%",
    padding: "10px 14px",
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontSize: 13,
    fontWeight: 500,
    color: "#0f172a",
    outline: "none",
    transition: "all .15s ease",
  },
  disabledInputDisplay: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontSize: 13,
    fontWeight: 500,
    outline: "none",
    color: "#94a3b8",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    cursor: "default",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  actionBtnContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  alertError: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 12.5,
    fontWeight: 500,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#e11d48",
  },
  alertSuccess: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 12.5,
    fontWeight: 500,
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
  },
  label: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: ".06em",
    textTransform: "uppercase",
    color: "#475569",
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  eyeBtn: {
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
  },
  strengthRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "2px 0",
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    background: "#f1f5f9",
    borderRadius: 100,
    overflow: "hidden",
  },
  strengthLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: ".04em",
    textTransform: "uppercase",
    minWidth: 80,
    textAlign: "right",
  },
  footerNotice: {
    textAlign: "center",
    fontSize: 11,
    color: "#64748b",
    fontWeight: 500,
    marginTop: 8,
  },
};

/* ─── GLOBAL EMBEDDED SYSTEM SHEET ──────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.rts-spin-ring {
  width:32px; height:32px;
  border:2.5px solid #e2e8f0; border-top-color:#0f172a;
  border-radius:50%; animation:rts-spin .6s linear infinite;
}

.rts-spin { animation:rts-spin .6s linear infinite; }

@keyframes rts-spin { to { transform:rotate(360deg); } }

.rts-input:focus {
  border-color:#0f172a !important;
  box-shadow:0 0 0 3px rgba(15,23,42,0.08) !important;
}

.rts-btn {
  display:inline-flex; align-items:center; gap:6px;
  padding:10px 18px; border-radius:10px; border:1px solid #0f172a;
  background:#0f172a; color:#fff; font-family:'Plus Jakarta Sans',sans-serif;
  font-size:12.5px; font-weight:700; cursor:pointer;
  transition:all .12s ease;
}

.rts-btn:hover:not(:disabled) {
  background:#1e293b;
  border-color:#1e293b;
  transform:translateY(-0.5px);
}

.rts-btn:disabled {
  opacity:.35; cursor:not-allowed; transform:none;
}

@media (max-width:768px) {
  .rts-grid { grid-template-columns:1fr !important; }
  .rts-row  { grid-template-columns:1fr !important; }
}
`;

export default AgencySettingsPage;