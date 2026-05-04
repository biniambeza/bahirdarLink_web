import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  MapPin, FileText, Activity, AlertTriangle,
  Info, Navigation, Shield, Camera, Download,
  Phone, User, Calendar, Tag, Layers, Eye,
  Image as ImageIcon, Hash, Crosshair, Map, X,
  GitMerge, CheckCircle2,
} from "lucide-react";

const API_BASE = "http://localhost:5000";
const getToken = () => localStorage.getItem("token");

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  white: "#FFFFFF", surface1: "#F4F7FB", surface2: "#EBF1FA",
  blue900:"#0A1F44", blue800:"#0D2D6B", blue700:"#1140A0",
  blue600:"#1A52C4", blue500:"#2563EB", blue400:"#4A80F0",
  blue300:"#7BA7F5", blue200:"#BAD1FB", blue100:"#DBE9FD", blue50:"#EEF4FF",
  ink0:"#0B1628", ink1:"#1E3251", ink2:"#4A607F", ink3:"#7A92B0", ink4:"#A8BDD8",
  border0:"#E4EBF5", border1:"#C8D8EE",
  green600:"#059669", green500:"#10B981", green100:"#D1FAE5", green50:"#ECFDF5",
  amber600:"#D97706", amber500:"#F59E0B", amber100:"#FEF3C7", amber50:"#FFFBEB",
  red600:"#DC2626",   red500:"#EF4444",   red100:"#FEE2E2",   red50:"#FFF5F5",
  purple600:"#7C3AED", purple100:"#EDE9FE",
};

// ─── Location parser ──────────────────────────────────────────────────────────
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

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  reported:    { label:"Reported",    color:T.ink3,      bg:T.surface2,   border:T.border1,    dot:T.ink4,       pulse:false },
  assigned:    { label:"Assigned",    color:T.blue600,   bg:T.blue50,     border:T.blue200,    dot:T.blue500,    pulse:true  },
  in_progress: { label:"In Progress", color:T.amber600,  bg:T.amber50,    border:T.amber100,   dot:T.amber500,   pulse:true  },
  resolved:    { label:"Resolved",    color:T.green600,  bg:T.green50,    border:T.green100,   dot:T.green500,   pulse:false },
  pending:     { label:"Pending",     color:T.amber600,  bg:T.amber50,    border:T.amber100,   dot:T.amber500,   pulse:true  },
  active:      { label:"Active",      color:T.blue600,   bg:T.blue50,     border:T.blue200,    dot:T.blue500,    pulse:true  },
  dispatched:  { label:"Dispatched",  color:T.purple600, bg:T.purple100,  border:T.purple100,  dot:T.purple600,  pulse:true  },
  cancelled:   { label:"Cancelled",   color:T.red600,    bg:T.red50,      border:T.red100,     dot:T.red500,     pulse:false },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.pending;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      padding:"5px 14px 5px 10px", borderRadius:999,
      background:s.bg, color:s.color,
      fontSize:12, fontWeight:700, letterSpacing:".05em",
      border:`1.5px solid ${s.border}`,
    }}>
      <span style={{
        width:8, height:8, borderRadius:"50%",
        background:s.dot, flexShrink:0,
        animation: s.pulse ? "dotPulse 2s ease-in-out infinite" : "none",
      }}/>
      {s.label}
    </span>
  );
}

function MediaViewer({ mediaUrl, token }) {
  const [state, setState] = useState({ url:null, type:null, loading:false, error:null });
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!mediaUrl) return;
    let cancelled = false;
    (async () => {
      setState(p => ({ ...p, loading:true, error:null }));
      try {
        const full = mediaUrl.startsWith("http") ? mediaUrl : `${API_BASE}/${mediaUrl.replace(/^\//, "")}`;
        const res = await axios.get(full, {
          responseType:"blob",
          headers: token ? { Authorization:`Bearer ${token}` } : {},
        });
        if (cancelled) return;
        setState({ url:URL.createObjectURL(res.data), type:res.headers["content-type"]||"", loading:false, error:null });
      } catch {
        if (!cancelled) setState(p => ({ ...p, loading:false, error:"Media unavailable" }));
      }
    })();
    return () => { cancelled = true; };
  }, [mediaUrl, token]);

  if (!mediaUrl) return null;
  const isImage = state.type?.startsWith("image");
  const isVideo = state.type?.startsWith("video");

  return (
    <>
      <div style={{
        borderRadius:16, overflow:"hidden", border:`1.5px solid ${T.border0}`,
        background:T.surface1, minHeight:200,
        display:"flex", alignItems:"center", justifyContent:"center", position:"relative",
      }}>
        {state.loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:40 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", border:`3px solid ${T.blue100}`, borderTopColor:T.blue500, animation:"spin .75s linear infinite" }}/>
            <span style={{ color:T.ink3, fontSize:13, fontWeight:500 }}>Loading media…</span>
          </div>
        )}
        {state.error && (
          <div style={{ color:T.ink4, fontSize:13, padding:40, textAlign:"center" }}>
            <ImageIcon size={32} style={{ opacity:.3, display:"block", margin:"0 auto 10px" }}/>
            <p style={{ margin:0, fontWeight:600 }}>{state.error}</p>
          </div>
        )}
        {!state.loading && !state.error && state.url && isImage && (
          <>
            <img src={state.url} alt="Evidence" onClick={() => setLightbox(true)}
              style={{ width:"100%", maxHeight:320, objectFit:"cover", display:"block", cursor:"zoom-in" }}/>
            <button onClick={() => setLightbox(true)} style={{
              position:"absolute", bottom:14, right:14,
              background:"rgba(255,255,255,.92)", backdropFilter:"blur(8px)",
              border:`1.5px solid ${T.border0}`, borderRadius:10,
              padding:"7px 14px", display:"flex", alignItems:"center", gap:6,
              fontSize:12, color:T.blue600, cursor:"pointer", fontWeight:700,
            }}>
              <Eye size={13}/> View Full
            </button>
          </>
        )}
        {!state.loading && !state.error && state.url && isVideo && (
          <video src={state.url} controls style={{ width:"100%", maxHeight:320, display:"block" }}/>
        )}
        {!state.loading && !state.error && state.url && !isImage && !isVideo && (
          <a href={state.url} download style={{ color:T.blue500, fontSize:14, padding:40, display:"flex", alignItems:"center", gap:8, fontWeight:700 }}>
            <Download size={18}/> Download Attachment
          </a>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setLightbox(false)}
            style={{
              position:"fixed", inset:0, background:"rgba(10,20,50,.92)",
              zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", cursor:"zoom-out",
            }}
          >
            <img src={state.url} alt="" style={{ maxWidth:"95vw", maxHeight:"95vh", objectFit:"contain", borderRadius:14 }}/>
            <button onClick={() => setLightbox(false)} style={{
              position:"absolute", top:20, right:20,
              background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)",
              borderRadius:12, padding:12, cursor:"pointer", color:"#fff",
            }}>
              <X size={18}/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MapPreview({ lat, lng }) {
  if (lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng))) return null;
  const pad = 0.005;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=16`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`;
  return (
    <div>
      <div style={{ borderRadius:16, overflow:"hidden", border:`1.5px solid ${T.border0}`, position:"relative", height:200, background:T.surface1 }}>
        <iframe
          title="Location Map"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-pad},${lat-pad},${lng+pad},${lat+pad}&layer=mapnik&marker=${lat},${lng}`}
          style={{ width:"100%", height:"100%", border:"none", display:"block" }}
          loading="lazy"
        />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"linear-gradient(to top,rgba(255,255,255,.95),transparent)", pointerEvents:"none" }}/>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:12 }}>
        <div style={{ flex:1, background:T.blue50, border:`1.5px solid ${T.blue100}`, borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:T.blue100, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Crosshair size={15} color={T.blue600}/>
          </div>
          <div>
            <div style={{ fontSize:9, fontWeight:800, color:T.blue400, letterSpacing:".12em", textTransform:"uppercase", marginBottom:3 }}>GPS Coordinates</div>
            <div style={{ fontSize:12, fontWeight:700, color:T.blue800, fontFamily:"'Courier New',monospace" }}>
              {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
            </div>
          </div>
        </div>
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          gap:5, padding:"12px 18px", flexShrink:0,
          background:T.blue600, borderRadius:14, color:T.white, textDecoration:"none",
          fontSize:10, fontWeight:800, letterSpacing:".08em", textTransform:"uppercase", transition:"all .18s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = T.blue700; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = T.blue600; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Navigation size={16}/> Maps
        </a>
        <a href={osmUrl} target="_blank" rel="noopener noreferrer" style={{
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          gap:5, padding:"12px 16px", flexShrink:0,
          background:T.white, borderRadius:14, border:`1.5px solid ${T.border0}`,
          color:T.ink2, textDecoration:"none",
          fontSize:10, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", transition:"all .18s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue200; e.currentTarget.style.color = T.blue600; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border0; e.currentTarget.style.color = T.ink2; }}
        >
          <Map size={16}/> OSM
        </a>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono, last, accent }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={{
      display:"flex", gap:14, padding:"14px 0",
      borderBottom: last ? "none" : `1px solid ${T.surface2}`,
      alignItems:"flex-start",
    }}>
      <div style={{
        width:36, height:36, borderRadius:10, flexShrink:0,
        background: accent ? T.blue50 : T.surface1,
        border:`1.5px solid ${accent ? T.blue100 : T.border0}`,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <Icon size={14} color={accent ? T.blue600 : T.ink3}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:0, fontSize:10, color:T.ink4, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase" }}>
          {label}
        </p>
        <p style={{
          margin:"4px 0 0", fontSize:14, color:T.ink0, fontWeight:500,
          fontFamily: mono ? "'Courier New',monospace" : "inherit",
          wordBreak:"break-word", lineHeight:1.6,
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionHead({ label, icon: Icon }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"24px 0 12px" }}>
      {Icon && (
        <div style={{
          width:24, height:24, borderRadius:7, flexShrink:0,
          background:T.blue50, border:`1px solid ${T.blue100}`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <Icon size={12} color={T.blue600}/>
        </div>
      )}
      <span style={{ fontSize:11, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:T.blue700 }}>
        {label}
      </span>
      <div style={{ flex:1, height:1, background:`linear-gradient(to right,${T.blue100},transparent)` }}/>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background:T.white, borderRadius:16, border:`1.5px solid ${T.border0}`,
      padding:"4px 20px", ...style,
    }}>
      {children}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div style={{ padding:"24px 0", display:"flex", flexDirection:"column", gap:14 }}>
      {[160, 90, 56, 56, 56, 200].map((h, i) => (
        <div key={i} style={{ height:h, borderRadius:16, background:"#EEF4FF", animation:"shimmer 1.5s ease infinite" }}/>
      ))}
    </div>
  );
}

// ─── IncidentDetailPanel ──────────────────────────────────────────────────────
// Props:
//   incident   – already-loaded incident object (from dashboard row click)
//   incidentId – fallback: fetch by ID if no incident object
//   onClose    – called when X is clicked (for use inside SlidePanel)
//   panelMode  – true = compact padding, no sticky topbar (rendered inside SlidePanel)
// ─────────────────────────────────────────────────────────────────────────────
const IncidentDetailPanel = ({ incident: incidentProp, incidentId, onClose, panelMode = false }) => {
  const token = getToken();

  const [emergency,    setEmergency]    = useState(incidentProp || null);
  const [fetchLoading, setFetchLoading] = useState(!incidentProp);
  const [fetchError,   setFetchError]   = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const idToFetch = incidentId || incidentProp?._id || incidentProp?.id;

  // Sync if a new incident is passed in from outside (e.g. different row clicked)
  useEffect(() => {
    if (incidentProp) {
      setEmergency(incidentProp);
      setFetchLoading(false);
      setFetchError(null);
    }
  }, [incidentProp]);

  // Fetch by ID if no object was provided
  useEffect(() => {
    if (incidentProp || !idToFetch) return;
    let cancelled = false;
    (async () => {
      setFetchLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE}/api/emergencies/${idToFetch}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!cancelled) {
          setEmergency(data.data || data);
          setFetchError(null);
        }
      } catch {
        if (!cancelled) setFetchError("Could not load incident. Please try again.");
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [idToFetch]);

  const handleRefresh = () => {
    setEmergency(null);
    setFetchLoading(true);
    setFetchError(null);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const res = await axios({
        url: `${API_BASE}/api/finalReport/download/${idToFetch}`,
        method: "GET", responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `Report_${idToFetch}.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const e = emergency;
  const { lat, lng } = e ? parseLocation(e) : {};
  const status = e?.status;

  return (
    <div style={{
      fontFamily: "'Sora','Helvetica Neue',sans-serif",
      background: "transparent",
      minHeight: "100%",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes spin     { to { transform:rotate(360deg); } }
        @keyframes shimmer  { 0%,100%{opacity:.7} 50%{opacity:.35} }
        @keyframes dotPulse {
          0%  { box-shadow:0 0 0 0   rgba(37,99,235,.5); }
          70% { box-shadow:0 0 0 6px rgba(37,99,235,0);  }
          100%{ box-shadow:0 0 0 0   rgba(37,99,235,0);  }
        }
        @keyframes panelFadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:none; }
        }
        .pdf-btn-panel:hover  { opacity:.9 !important; transform:translateY(-1px) !important; }
      `}</style>

      {/* ── PANEL HEADER ── */}
      {!panelMode && (
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "rgba(240,246,255,.97)", backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${T.border0}`,
          padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 60,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {e && <StatusBadge status={status}/>}
            {e && (
              <span style={{ fontFamily:"'Courier New',monospace", fontSize:11, color:T.ink4 }}>
                #{String(e._id || e.id || "").slice(-8).toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={handleRefresh} style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"7px 13px",
              background:T.white, border:`1.5px solid ${T.border0}`,
              borderRadius:10, fontSize:11, color:T.blue500,
              cursor:"pointer", fontWeight:700,
            }}>
              <span style={{ display:"inline-block", animation: fetchLoading ? "spin 1s linear infinite" : "none" }}>↻</span>
              Refresh
            </button>
            {onClose && (
              <button onClick={onClose} style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"7px 13px",
                background:T.white, border:`1.5px solid ${T.border0}`,
                borderRadius:10, fontSize:11, color:T.ink2,
                cursor:"pointer", fontWeight:700,
              }}>
                <X size={13}/> Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div style={{ padding: panelMode ? "0 28px 60px" : "28px 24px 60px" }}>

        {fetchLoading && <PanelSkeleton/>}

        {fetchError && !fetchLoading && (
          <div style={{
            marginTop: 32, textAlign:"center",
            background:T.white, borderRadius:20, padding:"40px 28px",
            border:`1.5px solid ${T.border0}`,
          }}>
            <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
            <p style={{ fontSize:14, fontWeight:700, color:T.ink0, marginBottom:8 }}>{fetchError}</p>
            <button onClick={handleRefresh} style={{
              marginTop:6, padding:"9px 22px",
              background:T.blue600, border:"none", borderRadius:10,
              color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer",
            }}>
              Try Again
            </button>
          </div>
        )}

        {!fetchLoading && !fetchError && e && (
          <div style={{ animation:"panelFadeUp .28s ease both" }}>

            {/* ── HERO CARD ── */}
            <div style={{
              borderRadius:20, overflow:"hidden",
              border:`1.5px solid ${T.blue200}`,
              background:`linear-gradient(140deg,${T.blue600} 0%,${T.blue900} 100%)`,
              padding:"24px 24px 22px",
              position:"relative",
            }}>
              {/* Orbs */}
              <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,.05)", pointerEvents:"none" }}/>
              <div style={{ position:"absolute", bottom:-30, right:50, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,.03)", pointerEvents:"none" }}/>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18, position:"relative" }}>
                <div style={{
                  width:46, height:46, borderRadius:13,
                  background:"rgba(255,255,255,.15)", border:"1.5px solid rgba(255,255,255,.25)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <AlertTriangle size={22} color="#fff"/>
                </div>
                <div style={{
                  background:"rgba(0,0,0,.25)", borderRadius:9, padding:"5px 11px",
                  fontFamily:"'Courier New',monospace", fontSize:10, color:"rgba(255,255,255,.6)",
                  border:"1px solid rgba(255,255,255,.1)",
                }}>
                  #{String(e._id || e.id || "").slice(-12).toUpperCase()}
                </div>
              </div>

              <h2 style={{ margin:"0 0 6px", fontSize:22, fontWeight:800, color:"#fff", letterSpacing:"-.4px", position:"relative" }}>
                {e.kebele?.name || "Unknown Location"}
              </h2>
              <p style={{ margin:0, fontSize:13, color:"rgba(255,255,255,.6)", display:"flex", alignItems:"center", gap:6, position:"relative" }}>
                <MapPin size={12} color="rgba(255,255,255,.45)"/>
                {e.subdivision || e.address || "No subdivision specified"}
              </p>

              {e.mergedCount > 1 && (
                <div style={{
                  marginTop:14, display:"inline-flex", alignItems:"center", gap:7,
                  background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.25)",
                  borderRadius:8, padding:"5px 12px",
                  fontSize:11, fontWeight:700, color:"#fff", position:"relative",
                }}>
                  <GitMerge size={11}/> {e.mergedCount} incidents merged
                </div>
              )}

              <div style={{
                marginTop:16, paddingTop:14, borderTop:"1px solid rgba(255,255,255,.12)",
                display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative",
              }}>
                {e.createdAt && (
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <Calendar size={11} color="rgba(255,255,255,.4)"/>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,.5)", fontFamily:"'Courier New',monospace" }}>
                      {new Date(e.createdAt).toLocaleString()}
                    </span>
                  </div>
                )}
                <StatusBadge status={status}/>
              </div>
            </div>

            {/* ── MEDIA EVIDENCE ── */}
            {(e.media || e.mediaUrl || e.mediaPath) && (
              <>
                <SectionHead label="Media Evidence" icon={Camera}/>
                <MediaViewer mediaUrl={e.media || e.mediaUrl || e.mediaPath} token={token}/>
              </>
            )}

            {/* ── NARRATIVE ── */}
            {e.description && (
              <>
                <SectionHead label="Incident Narrative" icon={FileText}/>
                <div style={{
                  background:T.blue50, borderRadius:14, padding:"16px 20px",
                  border:`1.5px solid ${T.blue100}`,
                  borderLeft:`4px solid ${T.blue500}`,
                }}>
                  <p style={{ margin:0, fontSize:13.5, color:T.ink1, lineHeight:1.9, fontStyle:"italic" }}>
                    "{e.description}"
                  </p>
                </div>
              </>
            )}

            {/* ── INCIDENT DETAILS ── */}
            <SectionHead label="Incident Details" icon={Info}/>
            <Card>
              <InfoRow icon={Hash}     label="Incident ID"  value={String(e._id || e.id || "").slice(-12).toUpperCase()} mono accent/>
              <InfoRow icon={Tag}      label="Category"     value={e.category?.name || e.categoryName} accent/>
              <InfoRow icon={Layers}   label="Type"         value={e.emergencyType?.name}/>
              <InfoRow icon={Activity} label="Status"       value={status?.replace(/_/g," ")}/>
              <InfoRow icon={Calendar} label="Reported At"  value={e.createdAt ? new Date(e.createdAt).toLocaleString() : null}/>
              <InfoRow icon={Calendar} label="Last Updated" value={e.updatedAt ? new Date(e.updatedAt).toLocaleString() : null} last/>
            </Card>

            {/* ── LOCATION ── */}
            <SectionHead label="Location" icon={MapPin}/>
            <Card style={{ marginBottom:14 }}>
              <InfoRow icon={MapPin} label="Kebele"            value={e.kebele?.name} accent/>
              <InfoRow icon={MapPin} label="Subdivision"       value={e.subdivision}/>
              <InfoRow icon={MapPin} label="Specific Location" value={e.specificLocation || e.address} last/>
            </Card>
            <MapPreview lat={lat} lng={lng}/>

            {/* ── REPORTER ── */}
            {(e.user || e.guest || e.reportedBy) && (
              <>
                <SectionHead label="Reporter" icon={User}/>
                <Card>
                  <InfoRow icon={User}  label="Name"  value={(e.user || e.guest || e.reportedBy)?.name} accent/>
                  <InfoRow icon={Phone} label="Phone" value={(e.user || e.guest || e.reportedBy)?.phone} last/>
                </Card>
              </>
            )}

            {/* ── PDF — resolved only ── */}
            {status === "resolved" && (
              <>
                <SectionHead label="Official Record" icon={Shield}/>
                <div style={{
                  background:T.green50, borderRadius:18, border:`1.5px solid ${T.green100}`,
                  padding:"20px",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:T.green100, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <CheckCircle2 size={16} color={T.green600}/>
                    </div>
                    <div>
                      <p style={{ margin:0, fontSize:12, fontWeight:800, color:T.green600 }}>Case Finalized</p>
                      <p style={{ margin:0, fontSize:11, color:T.green500 }}>Official report is ready to download</p>
                    </div>
                  </div>
                  <button
                    className="pdf-btn-panel"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    style={{
                      width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                      padding:"13px 0",
                      background: isDownloading ? T.green100 : T.green600,
                      border:"none", borderRadius:12,
                      color: isDownloading ? T.green600 : T.white,
                      fontSize:12, fontWeight:800, letterSpacing:".06em",
                      cursor: isDownloading ? "not-allowed" : "pointer",
                      transition:"all .2s",
                    }}
                  >
                    {isDownloading
                      ? <><div style={{ width:14, height:14, borderRadius:"50%", border:`2px solid ${T.green100}`, borderTopColor:T.green600, animation:"spin .7s linear infinite" }}/> Generating…</>
                      : <><Download size={15}/> Download Official PDF</>
                    }
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentDetailPanel;


/* ─────────────────────────────────────────────────────────────────────────────
   USAGE EXAMPLES
   ─────────────────────────────────────────────────────────────────────────────

   1. Inside the existing SlidePanel in DashboardMain — replace the
      <IncidentDetailPage incidentProp={incident} panelMode /> line with:

        import IncidentDetailPanel from "./IncidentDetailPanel";

        // Inside SlidePanel render:
        {incident && (
          <div style={{ flex: 1 }}>
            <IncidentDetailPanel incident={incident} panelMode />
          </div>
        )}


   2. Standalone drawer (self-managed open/close):

        const [selected, setSelected] = useState(null);

        // In your incident list:
        <div onClick={() => setSelected(row)}>…</div>

        // Drawer:
        <SlidePanel incident={selected} onClose={() => setSelected(null)}>
          <IncidentDetailPanel
            incident={selected}
            onClose={() => setSelected(null)}
            panelMode
          />
        </SlidePanel>


   3. Fetch by ID only (no pre-loaded object):

        <IncidentDetailPanel incidentId="64abc123def456" />

   ───────────────────────────────────────────────────────────────────────────── */