import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin, FileText, Activity, CheckCircle2, AlertTriangle,
  Navigation, Info, Camera, Phone, User, Calendar, Tag,
  Layers, Eye, Image as ImageIcon, Hash, Crosshair, Map,
  Download, X, GitMerge, Radio,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

// ─── Design Tokens (matches EmergencyDetailDrawer) ────────────────────────────
const T = {
  white:    "#FFFFFF",
  surface0: "#FFFFFF",
  surface1: "#F4F7FB",
  surface2: "#EBF1FA",
  surface3: "#DDE8F7",

  blue900: "#0A1F44",
  blue800: "#0D2D6B",
  blue700: "#1140A0",
  blue600: "#1A52C4",
  blue500: "#2563EB",
  blue400: "#4A80F0",
  blue300: "#7BA7F5",
  blue200: "#BAD1FB",
  blue100: "#DBE9FD",
  blue50:  "#EEF4FF",

  ink0: "#0B1628",
  ink1: "#1E3251",
  ink2: "#4A607F",
  ink3: "#7A92B0",
  ink4: "#A8BDD8",

  border0: "#E4EBF5",
  border1: "#C8D8EE",
  border2: "#9DB8DE",

  green600: "#059669",
  green500: "#10B981",
  green100: "#D1FAE5",
  green50:  "#ECFDF5",
  amber600: "#D97706",
  amber500: "#F59E0B",
  amber100: "#FEF3C7",
  amber50:  "#FFFBEB",
  red600:   "#DC2626",
  red500:   "#EF4444",
  red100:   "#FEE2E2",
  red50:    "#FFF5F5",
  purple600:"#7C3AED",
  purple100:"#EDE9FE",
};

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  reported:    { label: "Reported",    color: T.ink3,      bg: T.surface2,  border: T.border1,   dot: T.ink4,      pulse: false },
  assigned:    { label: "Assigned",    color: T.blue600,   bg: T.blue50,    border: T.blue200,   dot: T.blue500,   pulse: true  },
  in_progress: { label: "In Progress", color: T.amber600,  bg: T.amber50,   border: T.amber100,  dot: T.amber500,  pulse: true  },
  resolved:    { label: "Resolved",    color: T.green600,  bg: T.green50,   border: T.green100,  dot: T.green500,  pulse: false },
  pending:     { label: "Pending",     color: T.amber600,  bg: T.amber50,   border: T.amber100,  dot: T.amber500,  pulse: true  },
  active:      { label: "Active",      color: T.blue600,   bg: T.blue50,    border: T.blue200,   dot: T.blue500,   pulse: true  },
  dispatched:  { label: "Dispatched",  color: T.purple600, bg: T.purple100, border: T.purple100, dot: T.purple600, pulse: true  },
  escalated:   { label: "Escalated",   color: T.red600,    bg: T.red50,     border: T.red100,    dot: T.red500,    pulse: true  },
  cancelled:   { label: "Cancelled",   color: T.red600,    bg: T.red50,     border: T.red100,    dot: T.red500,    pulse: false },
};

// ─── Location Parser ───────────────────────────────────────────────────────────
function parseLocation(e) {
  if (e.latitude != null && e.longitude != null) {
    const lat = parseFloat(e.latitude), lng = parseFloat(e.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (typeof e.location === "string" && e.location.includes(",")) {
    const [a, b] = e.location.split(",");
    const lat = parseFloat(a?.trim()), lng = parseFloat(b?.trim());
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (Array.isArray(e.location?.coordinates) && e.location.coordinates.length === 2) {
    const lng = parseFloat(e.location.coordinates[0]);
    const lat = parseFloat(e.location.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (e.location?.lat != null) {
    const lat = parseFloat(e.location.lat), lng = parseFloat(e.location.lng);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (e.location?.latitude != null) {
    const lat = parseFloat(e.location.latitude), lng = parseFloat(e.location.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return { lat: null, lng: null };
}

// ─── StatusBadge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const key = (status || "reported").toLowerCase().replace(/\s+/g, "_");
  const s = STATUS_CFG[key] || STATUS_CFG.reported;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px 4px 8px", borderRadius: 999,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, letterSpacing: ".05em",
      border: `1.5px solid ${s.border}`,
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: s.dot, flexShrink: 0,
        animation: s.pulse ? "dotPulse 2s ease-in-out infinite" : "none",
      }} />
      {s.label}
    </span>
  );
}

// ─── Media Viewer ──────────────────────────────────────────────────────────────
function MediaViewer({ mediaUrl }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [state, setState] = useState({ url: null, type: null, loading: false, error: null });
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!mediaUrl) return;
    let cancelled = false;
    (async () => {
      setState(p => ({ ...p, loading: true, error: null }));
      try {
        const full = mediaUrl.startsWith("http") ? mediaUrl : `${API_BASE}/${mediaUrl.replace(/^\//, "")}`;
        const res = await axios.get(full, {
          responseType: "blob",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (cancelled) return;
        setState({ url: URL.createObjectURL(res.data), type: res.headers["content-type"] || "", loading: false, error: null });
      } catch {
        if (!cancelled) setState(p => ({ ...p, loading: false, error: "Media unavailable" }));
      }
    })();
    return () => { cancelled = true; };
  }, [mediaUrl]);

  if (!mediaUrl) return null;
  const isImage = state.type?.startsWith("image");
  const isVideo = state.type?.startsWith("video");

  return (
    <>
      <div style={{
        borderRadius: 14, overflow: "hidden", border: `1.5px solid ${T.border0}`,
        background: T.surface1, minHeight: 160,
        display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        boxShadow: "0 2px 12px rgba(37,99,235,.06)",
      }}>
        {state.loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 32 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", border: `3px solid ${T.blue100}`, borderTopColor: T.blue500, animation: "spin .75s linear infinite" }} />
            <span style={{ color: T.ink3, fontSize: 12, fontWeight: 500 }}>Loading media…</span>
          </div>
        )}
        {state.error && (
          <div style={{ color: T.ink4, fontSize: 13, padding: 32, textAlign: "center" }}>
            <ImageIcon size={28} style={{ marginBottom: 10, opacity: .3, display: "block", margin: "0 auto 10px" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>{state.error}</p>
          </div>
        )}
        {!state.loading && !state.error && state.url && isImage && (
          <>
            <img src={state.url} alt="Evidence" onClick={() => setLightbox(true)}
              style={{ width: "100%", maxHeight: 290, objectFit: "cover", display: "block", cursor: "zoom-in" }} />
            <button onClick={() => setLightbox(true)} style={{
              position: "absolute", bottom: 12, right: 12,
              background: "rgba(255,255,255,.92)", backdropFilter: "blur(8px)",
              border: `1.5px solid ${T.border0}`, borderRadius: 9,
              padding: "6px 12px", display: "flex", alignItems: "center", gap: 5,
              fontSize: 11, color: T.blue600, cursor: "pointer", fontWeight: 700,
              boxShadow: "0 2px 12px rgba(0,0,0,.08)",
            }}>
              <Eye size={12} /> View Full
            </button>
          </>
        )}
        {!state.loading && !state.error && state.url && isVideo && (
          <video src={state.url} controls style={{ width: "100%", maxHeight: 290, display: "block" }} />
        )}
        {!state.loading && !state.error && state.url && !isImage && !isVideo && (
          <a href={state.url} download style={{ color: T.blue500, fontSize: 13, padding: 32, display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
            <Download size={16} /> Download Attachment
          </a>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(false)} style={{
          position: "fixed", inset: 0, background: "rgba(10,20,50,.92)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out",
        }}>
          <img src={state.url} alt="" style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain", borderRadius: 12 }} />
          <button onClick={() => setLightbox(false)} style={{
            position: "absolute", top: 20, right: 20,
            background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)",
            borderRadius: 10, padding: 10, cursor: "pointer", color: "#fff", backdropFilter: "blur(8px)",
          }}>
            <X size={17} />
          </button>
        </div>
      )}
    </>
  );
}

// ─── Map Preview ───────────────────────────────────────────────────────────────
function MapPreview({ lat, lng }) {
  if (lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng))) return null;
  const pad = 0.005;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=16`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`;

  return (
    <div>
      <div style={{
        borderRadius: 14, overflow: "hidden", border: `1.5px solid ${T.border0}`,
        position: "relative", height: 190, background: T.surface1,
        boxShadow: "0 2px 16px rgba(37,99,235,.07)",
      }}>
        <iframe
          title="Location Map"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - pad},${lat - pad},${lng + pad},${lat + pad}&layer=mapnik&marker=${lat},${lng}`}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          loading="lazy"
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 56, background: "linear-gradient(to top,rgba(255,255,255,.95),transparent)", pointerEvents: "none" }} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <div style={{
          flex: 1, background: T.blue50, border: `1.5px solid ${T.blue100}`,
          borderRadius: 12, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: T.blue100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Crosshair size={13} color={T.blue600} />
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: T.blue400, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 2 }}>GPS Coordinates</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: T.blue800, fontFamily: "'Courier New',monospace" }}>
              {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
            </div>
          </div>
        </div>

        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 4, padding: "10px 16px", flexShrink: 0,
          background: T.blue600, borderRadius: 12, color: T.white, textDecoration: "none",
          fontSize: 9, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase",
          boxShadow: `0 4px 14px ${T.blue500}40`, transition: "all .18s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = T.blue700; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = T.blue600; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Navigation size={15} /> Maps
        </a>

        <a href={osmUrl} target="_blank" rel="noopener noreferrer" style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 4, padding: "10px 14px", flexShrink: 0,
          background: T.white, borderRadius: 12, border: `1.5px solid ${T.border0}`,
          color: T.ink2, textDecoration: "none",
          fontSize: 9, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase",
          transition: "all .18s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue200; e.currentTarget.style.color = T.blue600; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border0; e.currentTarget.style.color = T.ink2; }}
        >
          <Map size={15} /> OSM
        </a>
      </div>
    </div>
  );
}

// ─── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, mono, last, accent }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={{
      display: "flex", gap: 12, padding: "12px 0",
      borderBottom: last ? "none" : `1px solid ${T.surface2}`,
      alignItems: "flex-start",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: accent ? T.blue50 : T.surface1,
        border: `1.5px solid ${accent ? T.blue100 : T.border0}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={13} color={accent ? T.blue600 : T.ink3} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 10, color: T.ink4, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
          {label}
        </p>
        <p style={{
          margin: "3px 0 0", fontSize: 13, color: T.ink0, fontWeight: 500,
          fontFamily: mono ? "'Courier New',monospace" : "inherit",
          wordBreak: "break-word", lineHeight: 1.55,
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Section Head ──────────────────────────────────────────────────────────────
function SectionHead({ label, icon: Icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "22px 0 12px" }}>
      {Icon && (
        <div style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          background: T.blue50, border: `1px solid ${T.blue100}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={11} color={T.blue600} />
        </div>
      )}
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: T.blue700 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right,${T.blue100},transparent)` }} />
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.white, borderRadius: 14, border: `1.5px solid ${T.border0}`,
      padding: "4px 16px", boxShadow: "0 1px 6px rgba(37,99,235,.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// IncidentDetailPage — read-only details panel, designed for SlidePanel usage
// Props:
//   incidentProp  — the emergency object passed from DashboardMain
//   panelMode     — boolean, true when rendered inside a SlidePanel (no top chrome)
// ═══════════════════════════════════════════════════════════════════════════════
const IncidentDetailPage = ({ incidentProp, panelMode = false }) => {
  const e = incidentProp;

  if (!e) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: T.ink4, fontSize: 14 }}>
        No incident selected.
      </div>
    );
  }

  const { lat, lng } = parseLocation(e);
  const status = (e.status || "reported").toLowerCase().replace(/\s+/g, "_");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes dotPulse    { 0%,100%{box-shadow:0 0 0 0 currentColor;opacity:1} 70%{box-shadow:0 0 0 5px transparent;opacity:.7} }
        @keyframes slideInUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        ::-webkit-scrollbar        { width: 4px; }
        ::-webkit-scrollbar-track  { background: transparent; }
        ::-webkit-scrollbar-thumb  { background: #C8D8EE; border-radius: 4px; }
      `}</style>

      <div style={{
        fontFamily: "'Sora','Helvetica Neue',sans-serif",
        padding: panelMode ? "20px 24px 48px" : "28px 28px 64px",
        animation: "slideInUp .32s cubic-bezier(.22,.68,0,1.2) both",
      }}>

        {/* ── Top stripe accent (panel mode only) ── */}
        {panelMode && (
          <div style={{
            height: 3, borderRadius: 2, marginBottom: 20,
            background: `linear-gradient(to right,${T.blue500},${T.blue300},${T.blue600})`,
          }} />
        )}

        {/* ── Hero card ── */}
        <div style={{
          borderRadius: 18, overflow: "hidden",
          border: `1.5px solid ${T.blue200}`,
          background: `linear-gradient(140deg,${T.blue600} 0%,${T.blue800} 100%)`,
          padding: "22px 22px 20px",
          position: "relative",
          boxShadow: `0 8px 32px ${T.blue500}30`,
        }}>
          {/* decorative circles */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -30, right: 40, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 13,
              background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AlertTriangle size={22} color="#fff" />
            </div>
            <StatusBadge status={status} />
          </div>

          <h2 style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-.4px" }}>
            {e.kebele?.name || e.kebele || "Unknown Location"}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,.65)", display: "flex", alignItems: "center", gap: 5 }}>
            <MapPin size={12} color="rgba(255,255,255,.5)" />
            {e.subdivision || e.address || "No subdivision specified"}
          </p>

          {/* Emergency type pill */}
          {(e.emergencyType?.name || e.type) && (
            <div style={{
              marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)",
              borderRadius: 8, padding: "5px 11px",
              fontSize: 11, fontWeight: 700, color: "#fff",
            }}>
              <Radio size={11} /> {e.emergencyType?.name || e.type}
            </div>
          )}

          {/* Merged indicator */}
          {e.mergedCount > 1 && (
            <div style={{
              marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
              borderRadius: 8, padding: "5px 11px",
              fontSize: 11, fontWeight: 700, color: "#fff", marginLeft: 8,
            }}>
              <GitMerge size={11} /> {e.mergedCount} incidents merged
            </div>
          )}
        </div>

        {/* ── Media Evidence ── */}
        {(e.media || e.mediaUrl || e.mediaPath) && (
          <>
            <SectionHead label="Media Evidence" icon={Camera} />
            <MediaViewer mediaUrl={e.media || e.mediaUrl || e.mediaPath} />
          </>
        )}

        {/* ── Incident Narrative ── */}
        {e.description && (
          <>
            <SectionHead label="Incident Narrative" icon={FileText} />
            <div style={{
              background: T.blue50, borderRadius: 12, padding: "15px 18px",
              border: `1.5px solid ${T.blue100}`, borderLeft: `4px solid ${T.blue500}`,
            }}>
              <p style={{ margin: 0, fontSize: 13, color: T.ink1, lineHeight: 1.8, fontStyle: "italic" }}>
                "{e.description}"
              </p>
            </div>
          </>
        )}

        {/* ── Incident Details ── */}
        <SectionHead label="Incident Details" icon={Info} />
        <Card>
          <InfoRow icon={Hash}     label="Incident ID"  value={String(e._id || e.id || "").slice(-12).toUpperCase()} mono accent />
          <InfoRow icon={Tag}      label="Category"     value={e.category?.name || e.categoryName || e.category} accent />
          <InfoRow icon={Layers}   label="Type"         value={e.emergencyType?.name || e.type} />
          <InfoRow icon={Activity} label="Status"       value={status.replace(/_/g, " ")} />
          <InfoRow icon={Calendar} label="Reported At"  value={e.createdAt ? new Date(e.createdAt).toLocaleString() : null} />
          <InfoRow icon={Calendar} label="Last Updated" value={e.updatedAt ? new Date(e.updatedAt).toLocaleString() : null} last />
        </Card>

        {/* ── Location ── */}
        <SectionHead label="Location" icon={MapPin} />
        <Card style={{ marginBottom: 12 }}>
          <InfoRow icon={MapPin} label="Kebele"            value={e.kebele?.name || e.kebele} accent />
          <InfoRow icon={MapPin} label="Subdivision"       value={e.subdivision} />
          <InfoRow icon={MapPin} label="Specific Location" value={e.specificLocation || e.address} last />
        </Card>
        <MapPreview lat={lat} lng={lng} />

        {/* ── Reporter ── */}
        {(e.user || e.guest || e.reportedBy) && (
          <>
            <SectionHead label="Reporter" icon={User} />
            <Card>
              <InfoRow icon={User}  label="Name"  value={(e.user || e.guest || e.reportedBy)?.name} accent />
              <InfoRow icon={Phone} label="Phone" value={(e.user || e.guest || e.reportedBy)?.phone} last />
            </Card>
          </>
        )}

        {/* ── Resolved notice ── */}
        {(status === "resolved") && (
          <>
            <SectionHead label="Case Status" icon={CheckCircle2} />
            <div style={{
              background: T.green50, borderRadius: 16, border: `1.5px solid ${T.green100}`,
              padding: "18px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.green100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CheckCircle2 size={18} color={T.green600} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.green600 }}>Case Finalized & Closed</p>
                <p style={{ margin: 0, fontSize: 11, color: T.green500, marginTop: 2 }}>
                  This incident has been successfully resolved.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default IncidentDetailPage;