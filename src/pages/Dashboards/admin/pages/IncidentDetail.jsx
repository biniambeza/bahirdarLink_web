import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { formatDistanceToNow, format, differenceInMinutes } from "date-fns";
import {
  X, Flame, Droplets, Skull, Ambulance, Radio,
  MapPin, Clock, User, Tag, AlertTriangle, CheckCircle,
  Activity, ChevronRight, Shield, Navigation, Phone,
  FileText, RefreshCw, ExternalLink, Zap,
  Users, Hash, Calendar, Info, Camera,
  AlertCircle, TrendingUp, Map as MapIcon,
} from "lucide-react";

const API = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── CATEGORY META ────────────────────────────────────────────────────────────
const CAT_META = {
  fire:    { icon: Flame,     color: "#F97316", bg: "#FFF4ED", grad: "linear-gradient(135deg,#FF6B35 0%,#F97316 50%,#FB923C 100%)" },
  crime:   { icon: Skull,     color: "#6366F1", bg: "#EEEEFF", grad: "linear-gradient(135deg,#4F46E5 0%,#6366F1 50%,#818CF8 100%)" },
  medical: { icon: Ambulance, color: "#EF4444", bg: "#FFF0F0", grad: "linear-gradient(135deg,#DC2626 0%,#EF4444 50%,#F87171 100%)" },
  flood:   { icon: Droplets,  color: "#06B6D4", bg: "#E8FFFE", grad: "linear-gradient(135deg,#0891B2 0%,#06B6D4 50%,#22D3EE 100%)" },
  default: { icon: Radio,     color: "#64748B", bg: "#F1F5F9", grad: "linear-gradient(135deg,#475569 0%,#64748B 50%,#94A3B8 100%)" },
};

const STATUS_META = {
  pending:    { label: "Pending",    color: "#F59E0B", bg: "#FFFBEB", border: "#FCD34D", dot: "#F59E0B" },
  active:     { label: "Active",     color: "#F59E0B", bg: "#FFFBEB", border: "#FCD34D", dot: "#F59E0B" },
  responding: { label: "Responding", color: "#3B82F6", bg: "#EFF6FF", border: "#93C5FD", dot: "#3B82F6" },
  resolved:   { label: "Resolved",   color: "#10B981", bg: "#ECFDF5", border: "#6EE7B7", dot: "#10B981" },
  escalated:  { label: "Escalated",  color: "#EF4444", bg: "#FEF2F2", border: "#FCA5A5", dot: "#EF4444" },
};

function getCatKey(e) {
  const raw = (e.category?.name || e.category || "").toLowerCase().trim();
  return ["fire","crime","medical","flood"].includes(raw) ? raw : "default";
}
function getStatusKey(e) {
  return (e.status || "pending").toLowerCase();
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function buildMapsUrl(incident) {
  const lat =
    incident.latitude ?? incident.lat ??
    incident.coordinates?.lat ?? incident.coordinates?.latitude ??
    incident.location?.lat ?? incident.location?.latitude ??
    incident.geoLocation?.coordinates?.[1] ?? null;
  const lng =
    incident.longitude ?? incident.lng ??
    incident.coordinates?.lng ?? incident.coordinates?.longitude ??
    incident.location?.lng ?? incident.location?.longitude ??
    incident.geoLocation?.coordinates?.[0] ?? null;

  if (lat != null && lng != null) {
    return `https://www.google.com/maps?q=${lat},${lng}&z=15`;
  }
  const addr =
    incident.address ||
    incident.kebele?.name ||
    (typeof incident.kebele === "string" ? incident.kebele : null);
  if (addr) return `https://www.google.com/maps/search/${encodeURIComponent(addr)}`;
  return null;
}

function getCoords(incident) {
  const lat =
    incident.latitude ?? incident.lat ??
    incident.coordinates?.lat ?? incident.coordinates?.latitude ??
    incident.location?.lat ?? incident.location?.latitude ??
    incident.geoLocation?.coordinates?.[1] ?? null;
  const lng =
    incident.longitude ?? incident.lng ??
    incident.coordinates?.lng ?? incident.coordinates?.longitude ??
    incident.location?.lng ?? incident.location?.longitude ??
    incident.geoLocation?.coordinates?.[0] ?? null;
  return { lat, lng };
}

function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:5000/${path.replace(/^\/?/, "")}`;
}

function collectMediaFiles(incident) {
  const files = [];
  const push = (v, label) => {
    if (!v) return;
    if (Array.isArray(v)) v.forEach((f, i) => push(f, `${label} ${i + 1}`));
    else if (typeof v === "string") files.push({ url: mediaUrl(v), label });
    else if (v.url || v.path || v.filename)
      files.push({ url: mediaUrl(v.url || v.path || v.filename), label: v.label || label });
  };
  push(incident.media,       "Media");
  push(incident.mediaFiles,  "File");
  push(incident.images,      "Image");
  push(incident.attachments, "Attachment");
  push(incident.photo,       "Photo");
  return files;
}

// ─── SMALL UI PIECES ──────────────────────────────────────────────────────────
const Shimmer = ({ h = 16, r = 8 }) => (
  <div style={{
    height: h,
    background: "linear-gradient(90deg,#EEF2FF 25%,#E0E8FF 50%,#EEF2FF 75%)",
    backgroundSize: "200% 100%",
    borderRadius: r,
    animation: "shimmerSlide 1.4s ease-in-out infinite",
  }} />
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: "#94A3B8",
    fontFamily: "'DM Mono', monospace", marginBottom: 10, marginTop: 4,
    display: "flex", alignItems: "center", gap: 6,
  }}>
    <div style={{ flex: 1, height: 1, background: "#EEF2FF" }} />
    {children}
    <div style={{ flex: 1, height: 1, background: "#EEF2FF" }} />
  </div>
);

const InfoRow = ({ icon: Icon, label, value, accent, mono, onClick }) => (
  <div
    onClick={onClick}
    className={onClick ? "info-row-click" : ""}
    style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "11px 14px", background: "#F8FAFF",
      borderRadius: 10, border: "1px solid #E8EFFE",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.15s",
    }}
  >
    <div style={{
      width: 28, height: 28, borderRadius: 8,
      background: `${accent || "#3B82F6"}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, marginTop: 1,
    }}>
      <Icon size={13} color={accent || "#3B82F6"} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, color: "#94A3B8", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace", marginBottom: 3 }}>{label}</div>
      <div style={{
        fontSize: 12, fontWeight: 600, color: onClick ? "#3B82F6" : "#0F172A",
        fontFamily: mono ? "'DM Mono', monospace" : "'Syne', sans-serif",
        wordBreak: "break-word", lineHeight: 1.4,
      }}>{value || "—"}</div>
    </div>
    {onClick && <ExternalLink size={12} color="#CBD5E1" style={{ flexShrink: 0, marginTop: 9 }} />}
  </div>
);

// ─── TIMELINE STEP ────────────────────────────────────────────────────────────
const TimelineStep = ({ label, sublabel, time, done, active, color, last }) => (
  <div style={{ display: "flex", gap: 14 }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: done ? color : active ? "#fff" : "#F1F5F9",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `2.5px solid ${done || active ? color : "#E2E8F0"}`,
        boxShadow: active ? `0 0 0 5px ${color}18, 0 2px 8px ${color}30`
                 : done   ? `0 2px 8px ${color}30`
                 : "none",
        transition: "all 0.4s", zIndex: 1,
      }}>
        {done   ? <CheckCircle size={14} color="#fff" strokeWidth={2.5} />
        : active ? <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
        :           <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#CBD5E1" }} />}
      </div>
      {!last && (
        <div style={{
          width: 2, flex: 1, minHeight: 24,
          background: done ? `linear-gradient(180deg,${color},${color}88)` : "#E2E8F0",
          marginTop: 3, transition: "all 0.4s",
        }} />
      )}
    </div>
    <div style={{ paddingBottom: last ? 0 : 22, paddingTop: 4 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: done || active ? "#0F172A" : "#CBD5E1" }}>{label}</div>
      {sublabel && <div style={{ fontSize: 9, color: done || active ? color : "#CBD5E1", fontWeight: 600, marginTop: 1 }}>{sublabel}</div>}
      {time && <div style={{ fontSize: 9, color: "#94A3B8", fontFamily: "'DM Mono', monospace", marginTop: 3 }}>{time}</div>}
    </div>
  </div>
);

// ─── MEDIA GALLERY ────────────────────────────────────────────────────────────
const MediaGallery = ({ files }) => {
  const [active, setActive] = useState(0);
  if (!files.length) return null;
  const cur = files[active];
  const isVideo = cur.url && /\.(mp4|mov|webm|ogg)$/i.test(cur.url);

  return (
    <div>
      <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #DBEAFE", background: "#000", position: "relative" }}>
        {isVideo
          ? <video src={cur.url} controls style={{ width: "100%", maxHeight: 280, display: "block" }} />
          : <img
              src={cur.url} alt={cur.label}
              style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }}
              onError={e => { e.target.style.display = "none"; }}
            />
        }
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
          borderRadius: 6, padding: "3px 9px",
          fontSize: 9, color: "#fff", fontFamily: "'DM Mono', monospace",
        }}>
          {cur.label} · {active + 1}/{files.length}
        </div>
      </div>
      {files.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {files.map((f, i) => (
            <div key={i} onClick={() => setActive(i)} style={{
              width: 52, height: 52, borderRadius: 8, overflow: "hidden",
              cursor: "pointer",
              border: `2px solid ${i === active ? "#3B82F6" : "#E2E8F0"}`,
              background: "#F0F5FF", transition: "border-color 0.15s",
            }}>
              <img src={f.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── MAP PREVIEW ─────────────────────────────────────────────────────────────
const MapPreview = ({ incident, catColor }) => {
  const mapsUrl = buildMapsUrl(incident);
  const { lat, lng } = getCoords(incident);
  const hasCoords = lat != null && lng != null;

  const osmUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`
    : null;

  const addr =
    incident.address ||
    incident.kebele?.name ||
    (typeof incident.kebele === "string" ? incident.kebele : null);

  if (!mapsUrl) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "#94A3B8" }}>
      <MapIcon size={28} color="#E2E8F0" style={{ marginBottom: 8 }} />
      <div style={{ fontSize: 12 }}>No location data available</div>
    </div>
  );

  return (
    <div>
      {/* Map thumbnail */}
      <div
        onClick={() => window.open(mapsUrl, "_blank", "noopener")}
        style={{
          borderRadius: 16, overflow: "hidden",
          border: `2px solid ${catColor}33`,
          cursor: "pointer", height: 180, position: "relative",
          background: "#E8F0FE",
        }}
        className="map-wrap"
      >
        {osmUrl
          ? <iframe src={osmUrl} style={{ width: "100%", height: "100%", border: "none", pointerEvents: "none" }} title="map" />
          : <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <MapIcon size={28} color={catColor} />
              <span style={{ fontSize: 11, color: "#64748B" }}>{addr}</span>
            </div>
        }
        {/* Hover CTA */}
        <div className="map-cta" style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0)", transition: "background 0.2s",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: catColor, color: "#fff",
            padding: "11px 22px", borderRadius: 10, fontWeight: 700,
            fontSize: 11, fontFamily: "'DM Mono', monospace",
            boxShadow: `0 4px 20px ${catColor}50`,
            letterSpacing: "0.1em",
          }}>
            <Navigation size={14} /> OPEN IN GOOGLE MAPS
          </div>
        </div>
      </div>

      {/* Coords + address chips */}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {hasCoords && (
          <div style={{ flex: 1, padding: "9px 12px", background: "#F0F5FF", borderRadius: 10, border: "1px solid #E2EEFF" }}>
            <div style={{ fontSize: 8, color: "#94A3B8", fontFamily: "'DM Mono', monospace", marginBottom: 3 }}>COORDINATES</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0F172A", fontFamily: "'DM Mono', monospace" }}>
              {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
            </div>
          </div>
        )}
        {addr && (
          <div style={{ flex: 1, padding: "9px 12px", background: "#F0F5FF", borderRadius: 10, border: "1px solid #E2EEFF" }}>
            <div style={{ fontSize: 8, color: "#94A3B8", fontFamily: "'DM Mono', monospace", marginBottom: 3 }}>ADDRESS</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0F172A" }}>{addr}</div>
          </div>
        )}
      </div>

      {/* Full-width CTA button */}
      <button
        onClick={() => window.open(mapsUrl, "_blank", "noopener")}
        style={{
          marginTop: 12, width: "100%", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8, padding: "13px 0",
          background: catColor, color: "#fff", border: "none",
          borderRadius: 12, cursor: "pointer",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
          fontFamily: "'DM Mono', monospace",
          boxShadow: `0 4px 20px ${catColor}40`,
          transition: "opacity 0.15s",
        }}
      >
        <Navigation size={14} /> NAVIGATE IN GOOGLE MAPS
      </button>
    </div>
  );
};

// ─── CASE CARD ────────────────────────────────────────────────────────────────
const CaseCard = ({ c, catColor }) => {
  const cMedia = collectMediaFiles(c);
  return (
    <div style={{ background: "#FAFBFF", borderRadius: 12, border: "1.5px solid #E2EEFF", overflow: "hidden", marginBottom: 10 }}>
      {cMedia[0] && (
        <img src={cMedia[0].url} alt="case" style={{ width: "100%", height: 110, objectFit: "cover" }}
          onError={e => { e.target.parentElement.removeChild(e.target); }} />
      )}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", flex: 1, marginRight: 8 }}>
            {c.title || c.caseType || c.type || `Case #${(c.id || c._id || "").toString().slice(-6)}`}
          </span>
          <span style={{
            fontSize: 8, fontWeight: 700, padding: "3px 8px", borderRadius: 5,
            background: ["closed","resolved"].includes(c.status) ? "#ECFDF5" : "#EFF6FF",
            color:      ["closed","resolved"].includes(c.status) ? "#10B981" : "#3B82F6",
            fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", flexShrink: 0,
          }}>{(c.status || "open").toUpperCase()}</span>
        </div>
        {c.description && <div style={{ fontSize: 10, color: "#64748B", marginBottom: 8, lineHeight: 1.55 }}>{c.description}</div>}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {(c.assignedTeam?.name || c.responderTeam?.name) && (
            <span style={{ fontSize: 9, color: catColor, fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: 4 }}>
              <Shield size={9} /> {c.assignedTeam?.name || c.responderTeam?.name}
            </span>
          )}
          {c.createdAt && (
            <span style={{ fontSize: 9, color: "#94A3B8", fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={9} /> {format(new Date(c.createdAt), "MMM d, HH:mm")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN ────────────────────────────────────────────────────────────────────
const IncidentDetail = ({ incident: init, onClose }) => {
  const [incident,     setIncident]     = useState(init);
  const [cases,        setCases]        = useState([]);
  const [loadingFull,  setLoadingFull]  = useState(false);
  const [loadingCases, setLoadingCases] = useState(false);
  const [activeTab,    setActiveTab]    = useState("overview");
  const [notice,       setNotice]       = useState(null);

  const fetchFull = useCallback(async () => {
    if (!init) return;
    const id = init.id || init._id;
    if (!id) return;
    setLoadingFull(true);
    try {
      const { data } = await axios.get(`${API}/emergencies/${id}`, { headers: authHeaders() });
      const full = data.data || data.emergency || data;
      if (full && (full.id || full._id)) setIncident(full);
    } catch {
      setNotice("Could not fetch full record — showing summary.");
    } finally {
      setLoadingFull(false);
    }
  }, [init]);

  const fetchCases = useCallback(async () => {
    if (!init) return;
    const id = (init.id || init._id || "").toString();
    setLoadingCases(true);
    try {
      const { data } = await axios.get(`${API}/cases`, { headers: authHeaders() });
      const list = Array.isArray(data) ? data : (data.data || data.cases || []);
      setCases(list.filter(c =>
        c.emergencyId?.toString() === id ||
        c.emergency?._id?.toString() === id ||
        c.emergency?.id?.toString() === id
      ));
    } catch {
      setCases([]);
    } finally {
      setLoadingCases(false);
    }
  }, [init]);

  useEffect(() => {
    if (!init) return;
    setIncident(init);
    setActiveTab("overview");
    setNotice(null);
    fetchFull();
    fetchCases();
  }, [init]);

  if (!incident) return null;

  const catKey  = getCatKey(incident);
  const cat     = CAT_META[catKey];
  const stKey   = getStatusKey(incident);
  const st      = STATUS_META[stKey] || STATUS_META.pending;
  const CatIcon = cat.icon;

  const incidentId = (incident.id || incident._id || "").toString();
  const type       = incident.emergencyType?.name || (typeof incident.emergencyType === "string" ? incident.emergencyType : null) || incident.type || "Emergency";
  const catName    = incident.category?.name || (typeof incident.category === "string" ? incident.category : null) || catKey;
  const loc        = incident.kebele?.name || (typeof incident.kebele === "string" ? incident.kebele : null) || incident.address || (typeof incident.location === "string" ? incident.location : null) || "Unknown location";
  const reporter   = incident.reporterName || incident.reporter?.name || incident.reportedBy?.name || "Anonymous";
  const phone      = incident.reporterPhone || incident.phone || incident.contactPhone || incident.reporter?.phone;
  const desc       = incident.description || incident.details || incident.notes;
  const mediaFiles = collectMediaFiles(incident);
  const mapsUrl    = buildMapsUrl(incident);

  const handleTime = incident.createdAt && incident.resolvedAt
    ? differenceInMinutes(new Date(incident.resolvedAt), new Date(incident.createdAt))
    : null;

  const statusOrder = ["pending","active","responding","resolved","escalated"];
  const currentIdx  = statusOrder.indexOf(stKey);
  const statusSteps = [
    { keys: ["pending","active"], label: "Reported",   sublabel: "Incident submitted",  timeField: "createdAt"    },
    { keys: ["responding"],       label: "Responding", sublabel: "Team dispatched",      timeField: "respondingAt" },
    { keys: ["resolved"],         label: "Resolved",   sublabel: "Incident closed",      timeField: "resolvedAt"   },
  ];

  const tabs = [
    { key: "overview",  label: "OVERVIEW",  Icon: Info     },
    { key: "location",  label: "LOCATION",  Icon: MapPin   },
    { key: "media",     label: `MEDIA${mediaFiles.length ? ` (${mediaFiles.length})` : ""}`, Icon: Camera },
    { key: "cases",     label: `CASES${cases.length ? ` (${cases.length})` : ""}`,           Icon: FileText },
    { key: "timeline",  label: "TIMELINE",  Icon: Activity },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes slideIn      { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeIn       { from{opacity:0} to{opacity:1} }
        @keyframes shimmerSlide { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin         { to{transform:rotate(360deg)} }
        .info-row-click:hover   { background:#EFF6FF !important; border-color:#93C5FD !important; }
        .map-wrap:hover .map-cta{ background:rgba(0,0,0,0.22) !important; }
        .detail-tab-btn:hover   { color:#2563EB !important; }
        .close-x:hover          { background:rgba(0,0,0,0.12) !important; }
      `}</style>

      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:"fixed", inset:0,
        background:"rgba(15,23,42,0.52)",
        backdropFilter:"blur(6px)",
        zIndex:1000, animation:"fadeIn 0.22s ease",
      }} />

      {/* Panel */}
      <div style={{
        position:"fixed", top:0, right:0, bottom:0,
        width:500, maxWidth:"100vw",
        background:"#fff", zIndex:1001,
        display:"flex", flexDirection:"column",
        boxShadow:"-12px 0 80px rgba(59,130,246,0.2)",
        animation:"slideIn 0.36s cubic-bezier(0.34,1.35,0.64,1)",
        fontFamily:"'Syne', sans-serif",
      }}>

        {/* ── HERO ── */}
        <div style={{ background: cat.grad, flexShrink:0, position:"relative", overflow:"hidden" }}>
          {/* Noise */}
          <div style={{ position:"absolute", inset:0, background:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E\")", opacity:0.45, mixBlendMode:"overlay" }} />

          <div style={{ padding:"22px 22px 18px", position:"relative" }}>
            {/* Top row */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{
                  width:52, height:52, borderRadius:16,
                  background:"rgba(255,255,255,0.22)",
                  backdropFilter:"blur(10px)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  border:"1.5px solid rgba(255,255,255,0.38)",
                  boxShadow:"0 4px 20px rgba(0,0,0,0.18)",
                }}>
                  <CatIcon size={24} color="#fff" strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,0.7)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.18em", marginBottom:3 }}>
                    #{incidentId.slice(-8).toUpperCase()}
                  </div>
                  {loadingFull && (
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.65)", fontFamily:"'DM Mono', monospace", display:"flex", alignItems:"center", gap:5 }}>
                      <RefreshCw size={9} style={{ animation:"spin 1s linear infinite" }} /> LOADING DETAILS…
                    </div>
                  )}
                </div>
              </div>
              <button className="close-x" onClick={onClose} style={{
                width:34, height:34, borderRadius:10,
                background:"rgba(255,255,255,0.2)",
                backdropFilter:"blur(8px)",
                border:"1px solid rgba(255,255,255,0.32)",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", transition:"all 0.15s",
              }}>
                <X size={16} color="#fff" />
              </button>
            </div>

            <h2 style={{ fontSize:21, fontWeight:800, color:"#fff", margin:"0 0 7px", lineHeight:1.2, letterSpacing:"-0.02em" }}>
              {type}
            </h2>

            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14, flexWrap:"wrap" }}>
              <MapPin size={12} color="rgba(255,255,255,0.82)" />
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.88)", fontFamily:"'DM Mono', monospace" }}>{loc}</span>
              {mapsUrl && (
                <button onClick={() => window.open(mapsUrl,"_blank","noopener")} style={{
                  display:"flex", alignItems:"center", gap:4,
                  background:"rgba(255,255,255,0.22)", border:"none",
                  borderRadius:5, padding:"2px 8px", cursor:"pointer",
                  fontSize:9, color:"#fff", fontFamily:"'DM Mono', monospace",
                  fontWeight:700, letterSpacing:"0.1em",
                }}>
                  <Navigation size={9} /> MAP
                </button>
              )}
            </div>

            {/* Status pills */}
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:14 }}>
              <span style={{
                fontSize:9, fontWeight:700, padding:"5px 11px", borderRadius:7,
                background:"rgba(255,255,255,0.2)", color:"#fff",
                border:"1px solid rgba(255,255,255,0.35)",
                letterSpacing:"0.12em", fontFamily:"'DM Mono', monospace",
                display:"flex", alignItems:"center", gap:5,
              }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:st.dot, boxShadow:`0 0 0 3px ${st.dot}44` }} />
                {st.label.toUpperCase()}
              </span>
              <span style={{ fontSize:9, fontWeight:700, padding:"5px 11px", borderRadius:7, background:"rgba(255,255,255,0.18)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", letterSpacing:"0.12em", fontFamily:"'DM Mono', monospace" }}>
                {catName.toUpperCase()}
              </span>
              {incident.severity && <span style={{ fontSize:9, fontWeight:700, padding:"5px 11px", borderRadius:7, background:"rgba(255,255,255,0.18)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", letterSpacing:"0.12em", fontFamily:"'DM Mono', monospace" }}>SEV {incident.severity}</span>}
              {incident.priority && <span style={{ fontSize:9, fontWeight:700, padding:"5px 11px", borderRadius:7, background:"rgba(255,255,255,0.18)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", letterSpacing:"0.12em", fontFamily:"'DM Mono', monospace" }}>P{incident.priority}</span>}
            </div>

            {/* Stats strip */}
            <div style={{ display:"flex", background:"rgba(0,0,0,0.15)", borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,0.12)" }}>
              {[
                { label:"REPORTED", val: incident.createdAt ? formatDistanceToNow(new Date(incident.createdAt), { addSuffix:true }) : "—" },
                { label:"CASES",    val: loadingCases ? "…" : (cases.length || "0") },
                { label:"HANDLE",   val: handleTime != null ? `${handleTime}m` : "—" },
              ].map((s, i) => (
                <div key={i} style={{ flex:1, padding:"9px 10px", textAlign:"center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>{s.val}</div>
                  <div style={{ fontSize:8, color:"rgba(255,255,255,0.58)", fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display:"flex", borderBottom:"2px solid #EEF2FF", background:"#FAFBFF", flexShrink:0, overflowX:"auto" }}>
          {tabs.map(({ key, label, Icon }) => (
            <button key={key} className="detail-tab-btn" onClick={() => setActiveTab(key)} style={{
              flex:"0 0 auto", padding:"11px 13px", border:"none", cursor:"pointer",
              fontSize:8, fontWeight:700, letterSpacing:"0.12em",
              fontFamily:"'DM Mono', monospace", background:"transparent",
              color: activeTab === key ? cat.color : "#94A3B8",
              borderBottom: `2.5px solid ${activeTab === key ? cat.color : "transparent"}`,
              marginBottom:-2, transition:"all 0.15s",
              display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap",
            }}>
              <Icon size={10} /> {label}
            </button>
          ))}
        </div>

        {/* Notice */}
        {notice && (
          <div style={{ padding:"7px 16px", background:"#FFFBEB", borderBottom:"1px solid #FCD34D", display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
            <AlertCircle size={12} color="#F59E0B" />
            <span style={{ fontSize:10, color:"#92400E", fontFamily:"'DM Mono', monospace" }}>{notice}</span>
          </div>
        )}

        {/* ── BODY ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 22px" }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {loadingFull ? (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[1,2,3,4,5].map(i => <Shimmer key={i} h={56} r={10} />)}
                </div>
              ) : (<>
                <SectionLabel>INCIDENT INFO</SectionLabel>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <InfoRow icon={Hash}       label="ID"          value={incidentId.slice(-10).toUpperCase()} accent={cat.color} mono />
                  <InfoRow icon={Calendar}   label="DATE"        value={incident.createdAt ? format(new Date(incident.createdAt), "MMM d, yyyy") : "—"} accent={cat.color} />
                  <InfoRow icon={Clock}      label="TIME"        value={incident.createdAt ? format(new Date(incident.createdAt), "HH:mm:ss") : "—"} accent={cat.color} mono />
                  <InfoRow icon={Tag}        label="CATEGORY"    value={catName} accent={cat.color} />
                  <InfoRow icon={Zap}        label="TYPE"        value={type} accent={cat.color} />
                  <InfoRow icon={TrendingUp} label="PRIORITY"    value={incident.priority || incident.severity || "Normal"} accent={cat.color} />
                </div>

                <SectionLabel>REPORTER</SectionLabel>
                <InfoRow icon={User}  label="NAME"    value={reporter} accent="#6366F1" />
                {phone && <InfoRow icon={Phone} label="PHONE" value={phone} accent="#10B981" mono onClick={() => window.open(`tel:${phone}`, "_self")} />}
                {incident.reporterEmail && <InfoRow icon={User} label="EMAIL" value={incident.reporterEmail} accent="#10B981" />}

                {desc && (<>
                  <SectionLabel>DESCRIPTION</SectionLabel>
                  <div style={{ fontSize:12, color:"#334155", lineHeight:1.75, padding:"14px 16px", background:"#F8FAFF", borderRadius:12, border:"1px solid #E2EEFF" }}>
                    {desc}
                  </div>
                </>)}

                {(incident.assignedTeam || incident.responderTeam) && (<>
                  <SectionLabel>ASSIGNED TEAM</SectionLabel>
                  <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:"#EFF6FF", borderRadius:12, border:"1px solid #DBEAFE" }}>
                    <div style={{ width:40, height:40, borderRadius:11, background:"#3B82F620", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Shield size={18} color="#3B82F6" />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#1E40AF" }}>
                        {(incident.assignedTeam || incident.responderTeam)?.name || "Response Team"}
                      </div>
                      <div style={{ fontSize:9, color:"#60A5FA", fontFamily:"'DM Mono', monospace", marginTop:2 }}>
                        {(incident.assignedTeam || incident.responderTeam)?.type || "Responder Unit"}
                      </div>
                    </div>
                    <Users size={16} color="#93C5FD" />
                  </div>
                </>)}

                {/* Extra Ethiopian admin fields */}
                {[
                  { label:"WOREDA",   val: incident.woreda?.name   || (typeof incident.woreda   === "string" ? incident.woreda   : null) },
                  { label:"ZONE",     val: incident.zone?.name     || (typeof incident.zone     === "string" ? incident.zone     : null) },
                  { label:"SUB-CITY", val: incident.subCity?.name  || (typeof incident.subCity  === "string" ? incident.subCity  : null) },
                ].filter(r => r.val).length > 0 && (<>
                  <SectionLabel>ADMIN DIVISION</SectionLabel>
                  {[
                    { label:"KEBELE",   val: incident.kebele?.name   || (typeof incident.kebele   === "string" ? incident.kebele   : null) },
                    { label:"WOREDA",   val: incident.woreda?.name   || (typeof incident.woreda   === "string" ? incident.woreda   : null) },
                    { label:"ZONE",     val: incident.zone?.name     || (typeof incident.zone     === "string" ? incident.zone     : null) },
                    { label:"SUB-CITY", val: incident.subCity?.name  || (typeof incident.subCity  === "string" ? incident.subCity  : null) },
                    { label:"CITY",     val: incident.city?.name     || (typeof incident.city     === "string" ? incident.city     : null) },
                  ].filter(r => r.val).map((r, i) => (
                    <InfoRow key={i} icon={MapPin} label={r.label} value={r.val} accent="#6366F1" />
                  ))}
                </>)}
              </>)}
            </div>
          )}

          {/* LOCATION */}
          {activeTab === "location" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <SectionLabel>LOCATION MAP</SectionLabel>
              <MapPreview incident={incident} catColor={cat.color} />

              <SectionLabel>FULL ADDRESS</SectionLabel>
              {[
                { label:"KEBELE",   val: incident.kebele?.name   || (typeof incident.kebele   === "string" ? incident.kebele   : null) },
                { label:"WOREDA",   val: incident.woreda?.name   || (typeof incident.woreda   === "string" ? incident.woreda   : null) },
                { label:"ZONE",     val: incident.zone?.name     || (typeof incident.zone     === "string" ? incident.zone     : null) },
                { label:"SUB-CITY", val: incident.subCity?.name  || (typeof incident.subCity  === "string" ? incident.subCity  : null) },
                { label:"CITY",     val: incident.city?.name     || (typeof incident.city     === "string" ? incident.city     : null) },
                { label:"ADDRESS",  val: incident.address },
              ].filter(r => r.val).map((r, i) => (
                <InfoRow key={i} icon={MapPin} label={r.label} value={r.val} accent={cat.color} />
              ))}
            </div>
          )}

          {/* MEDIA */}
          {activeTab === "media" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <SectionLabel>ATTACHED MEDIA</SectionLabel>
              {loadingFull
                ? <Shimmer h={200} r={14} />
                : mediaFiles.length === 0
                  ? (
                    <div style={{ textAlign:"center", padding:"50px 0", color:"#94A3B8" }}>
                      <Camera size={32} color="#E2E8F0" style={{ marginBottom:12 }} />
                      <div style={{ fontSize:12 }}>No media attached to this incident</div>
                      <div style={{ fontSize:10, marginTop:4, fontFamily:"'DM Mono', monospace" }}>Media can be added via /api/cases</div>
                    </div>
                  )
                  : <MediaGallery files={mediaFiles} />
              }
            </div>
          )}

          {/* CASES */}
          {activeTab === "cases" && (
            <div>
              <SectionLabel>LINKED CASES ({cases.length})</SectionLabel>
              {loadingCases
                ? <div style={{ display:"flex", flexDirection:"column", gap:10 }}>{[1,2,3].map(i => <Shimmer key={i} h={90} r={12} />)}</div>
                : cases.length === 0
                  ? (
                    <div style={{ textAlign:"center", padding:"50px 0", color:"#94A3B8" }}>
                      <AlertTriangle size={28} color="#E2E8F0" style={{ marginBottom:12 }} />
                      <div style={{ fontSize:12 }}>No cases linked to this incident</div>
                      <div style={{ fontSize:10, marginTop:4, fontFamily:"'DM Mono', monospace" }}>POST /api/cases with emergencyId</div>
                    </div>
                  )
                  : cases.map((c, i) => <CaseCard key={c.id || c._id || i} c={c} catColor={cat.color} />)
              }
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === "timeline" && (
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              <SectionLabel>STATUS PROGRESSION</SectionLabel>
              <div style={{ marginTop:8, display:"flex", flexDirection:"column" }}>
                {statusSteps.map((step, i) => {
                  const maxIdx  = Math.max(...step.keys.map(k => statusOrder.indexOf(k)));
                  const isDone  = currentIdx > maxIdx;
                  const isActive = step.keys.includes(stKey);
                  const timeVal = incident[step.timeField];
                  return (
                    <TimelineStep key={step.timeField}
                      label={step.label} sublabel={step.sublabel}
                      time={timeVal ? format(new Date(timeVal), "MMM d, yyyy · HH:mm") : isActive ? "In progress…" : "Awaiting…"}
                      done={isDone} active={isActive && !isDone}
                      color={cat.color}
                      last={i === statusSteps.length - 1 && stKey !== "escalated"}
                    />
                  );
                })}
                {stKey === "escalated" && (
                  <TimelineStep label="Escalated" sublabel="Requires higher authority"
                    time={incident.escalatedAt ? format(new Date(incident.escalatedAt), "MMM d, yyyy · HH:mm") : "Now"}
                    done={false} active={true} color="#EF4444" last={true}
                  />
                )}
              </div>

              {/* Duration card */}
              <div style={{ marginTop:24, padding:"16px", background:"linear-gradient(135deg,#F0F5FF,#EFF6FF)", borderRadius:14, border:"1px solid #DBEAFE" }}>
                <div style={{ fontSize:9, color:"#3B82F6", fontFamily:"'DM Mono', monospace", letterSpacing:"0.12em", marginBottom:12 }}>TIMING SUMMARY</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:16, fontWeight:800, color:cat.color, letterSpacing:"-0.03em" }}>
                      {incident.createdAt ? formatDistanceToNow(new Date(incident.createdAt)) : "—"}
                    </div>
                    <div style={{ fontSize:8, color:"#94A3B8", fontFamily:"'DM Mono', monospace", marginTop:3 }}>AGE</div>
                  </div>
                  <div style={{ textAlign:"center", borderLeft:"1px solid #DBEAFE", borderRight:"1px solid #DBEAFE" }}>
                    <div style={{ fontSize:16, fontWeight:800, color:"#10B981", letterSpacing:"-0.03em" }}>
                      {handleTime != null ? `${handleTime}m` : "—"}
                    </div>
                    <div style={{ fontSize:8, color:"#94A3B8", fontFamily:"'DM Mono', monospace", marginTop:3 }}>HANDLE</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:16, fontWeight:800, color:"#6366F1", letterSpacing:"-0.03em" }}>{cases.length}</div>
                    <div style={{ fontSize:8, color:"#94A3B8", fontFamily:"'DM Mono', monospace", marginTop:3 }}>CASES</div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:6 }}>
                <SectionLabel>TIMESTAMPS</SectionLabel>
                {[
                  { label:"Created",    val: incident.createdAt },
                  { label:"Updated",    val: incident.updatedAt },
                  { label:"Responding", val: incident.respondingAt },
                  { label:"Resolved",   val: incident.resolvedAt },
                  { label:"Escalated",  val: incident.escalatedAt },
                ].filter(t => t.val).map((t, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", background:"#F8FAFF", borderRadius:9, border:"1px solid #EEF2FF" }}>
                    <span style={{ fontSize:10, color:"#64748B", display:"flex", alignItems:"center", gap:6 }}>
                      <Clock size={10} color="#94A3B8" /> {t.label}
                    </span>
                    <span style={{ fontSize:10, fontWeight:600, color:"#0F172A", fontFamily:"'DM Mono', monospace" }}>
                      {format(new Date(t.val), "MMM d, yyyy · HH:mm:ss")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default IncidentDetail;