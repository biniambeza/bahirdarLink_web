import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  X,
  MapPin,
  FileText,
  Activity,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Navigation,
  Shield,
  Info,
  ChevronRight,
  Users,
  Camera,
  Gavel,
  Home,
  Plus,
  Trash2,
  Download,
  Phone,
  User,
  Calendar,
  Tag,
  Layers,
  GitMerge,
  Eye,
  Image as ImageIcon,
  Hash,
  Crosshair,
  Map,
  Zap,
  Radio,
} from "lucide-react";
import ChatTab from "./ChatTab";

const API_BASE = "https://bahirlink-backend-1.onrender.com";

// Helper to extract language string (defaults to English)
const getLangStr = (val) => {
  if (!val) return "";
  if (typeof val === "string") {
    // Check if it's a JSON string that needs parsing
    if (val.trim().startsWith("{") && val.includes('"en"')) {
      try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === "object") {
          return parsed.en || parsed.am || val;
        }
      } catch (e) {
        // If parsing fails, return the original string
        return val;
      }
    }
    return val;
  }
  // It's an object
  if (typeof val === "object" && val !== null) {
    return val.en || val.am || "";
  }
  return String(val);
};

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  white: "#FFFFFF",
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
  blue50: "#EEF4FF",

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
  green50: "#ECFDF5",
  amber600: "#D97706",
  amber500: "#F59E0B",
  amber100: "#FEF3C7",
  amber50: "#FFFBEB",
  red600: "#DC2626",
  red500: "#EF4444",
  red100: "#FEE2E2",
  red50: "#FFF5F5",
  purple600: "#7C3AED",
  purple100: "#EDE9FE",
};

// ─── Location Parser — ALL storage formats ─────────────────────────────────────
function parseLocation(e) {
  // 1. Flat top-level: { latitude, longitude }
  if (e.latitude != null && e.longitude != null) {
    const lat = parseFloat(e.latitude),
      lng = parseFloat(e.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  // 2. String "lat,lng" — guest users e.g. "10.21435,37.2363"
  if (typeof e.location === "string" && e.location.includes(",")) {
    const [a, b] = e.location.split(",");
    const lat = parseFloat(a?.trim()),
      lng = parseFloat(b?.trim());
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  // 3. GeoJSON { coordinates: [lng, lat] } — registered users (lon-first!)
  if (
    Array.isArray(e.location?.coordinates) &&
    e.location.coordinates.length === 2
  ) {
    const lng = parseFloat(e.location.coordinates[0]);
    const lat = parseFloat(e.location.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  // 4. Location object { lat, lng } or { latitude, longitude }
  if (e.location?.lat != null) {
    const lat = parseFloat(e.location.lat),
      lng = parseFloat(e.location.lng);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (e.location?.latitude != null) {
    const lat = parseFloat(e.location.latitude),
      lng = parseFloat(e.location.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return { lat: null, lng: null };
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  reported: {
    label: "Reported",
    color: T.ink3,
    bg: T.surface2,
    border: T.border1,
    dot: T.ink4,
    pulse: false,
  },
  assigned: {
    label: "Assigned",
    color: T.blue600,
    bg: T.blue50,
    border: T.blue200,
    dot: T.blue500,
    pulse: true,
  },
  in_progress: {
    label: "In Progress",
    color: T.amber600,
    bg: T.amber50,
    border: T.amber100,
    dot: T.amber500,
    pulse: true,
  },
  resolved: {
    label: "Resolved",
    color: T.green600,
    bg: T.green50,
    border: T.green100,
    dot: T.green500,
    pulse: false,
  },
  pending: {
    label: "Pending",
    color: T.amber600,
    bg: T.amber50,
    border: T.amber100,
    dot: T.amber500,
    pulse: true,
  },
  active: {
    label: "Active",
    color: T.blue600,
    bg: T.blue50,
    border: T.blue200,
    dot: T.blue500,
    pulse: true,
  },
  dispatched: {
    label: "Dispatched",
    color: T.purple600,
    bg: T.purple100,
    border: T.purple100,
    dot: T.purple600,
    pulse: true,
  },
  cancelled: {
    label: "Cancelled",
    color: T.red600,
    bg: T.red50,
    border: T.red100,
    dot: T.red500,
    pulse: false,
  },
};

// ─── StatusBadge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px 4px 8px",
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".05em",
        border: `1.5px solid ${s.border}`,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
          animation: s.pulse ? "dotPulse 2s ease-in-out infinite" : "none",
        }}
      />
      {s.label}
    </span>
  );
}

// ─── Media Viewer ─────────────────────────────────────────────────────────────
function MediaViewer({ mediaUrl, token }) {
  const [state, setState] = useState({
    url: null,
    type: null,
    loading: false,
    error: null,
  });
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!mediaUrl) return;
    let cancelled = false;
    (async () => {
      setState((p) => ({ ...p, loading: true, error: null }));
      try {
        const full = mediaUrl.startsWith("http")
          ? mediaUrl
          : `${API_BASE}/${mediaUrl.replace(/^\//, "")}`;
        const res = await axios.get(full, {
          responseType: "blob",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (cancelled) return;
        setState({
          url: URL.createObjectURL(res.data),
          type: res.headers["content-type"] || "",
          loading: false,
          error: null,
        });
      } catch {
        if (!cancelled)
          setState((p) => ({
            ...p,
            loading: false,
            error: "Media unavailable",
          }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mediaUrl]);

  if (!mediaUrl) return null;
  const isImage = state.type?.startsWith("image");
  const isVideo = state.type?.startsWith("video");

  return (
    <>
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: `1.5px solid ${T.border0}`,
          background: T.surface1,
          minHeight: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxShadow: "0 2px 12px rgba(37,99,235,.06)",
        }}
      >
        {state.loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              padding: 32,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: `3px solid ${T.blue100}`,
                borderTopColor: T.blue500,
                animation: "spin .75s linear infinite",
              }}
            />
            <span style={{ color: T.ink3, fontSize: 12, fontWeight: 500 }}>
              Loading media…
            </span>
          </div>
        )}
        {state.error && (
          <div
            style={{
              color: T.ink4,
              fontSize: 13,
              padding: 32,
              textAlign: "center",
            }}
          >
            <ImageIcon
              size={28}
              style={{
                marginBottom: 10,
                opacity: 0.3,
                display: "block",
                margin: "0 auto 10px",
              }}
            />
            <p style={{ margin: 0, fontWeight: 600 }}>{state.error}</p>
          </div>
        )}
        {!state.loading && !state.error && state.url && isImage && (
          <>
            <img
              src={state.url}
              alt="Evidence"
              onClick={() => setLightbox(true)}
              style={{
                width: "100%",
                maxHeight: 290,
                objectFit: "cover",
                display: "block",
                cursor: "zoom-in",
              }}
            />
            <button
              onClick={() => setLightbox(true)}
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                background: "rgba(255,255,255,.92)",
                backdropFilter: "blur(8px)",
                border: `1.5px solid ${T.border0}`,
                borderRadius: 9,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: T.blue600,
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: "0 2px 12px rgba(0,0,0,.08)",
              }}
            >
              <Eye size={12} /> View Full
            </button>
          </>
        )}
        {!state.loading && !state.error && state.url && isVideo && (
          <video
            src={state.url}
            controls
            style={{ width: "100%", maxHeight: 290, display: "block" }}
          />
        )}
        {!state.loading &&
          !state.error &&
          state.url &&
          !isImage &&
          !isVideo && (
            <a
              href={state.url}
              download
              style={{
                color: T.blue500,
                fontSize: 13,
                padding: 32,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 700,
              }}
            >
              <Download size={16} /> Download Attachment
            </a>
          )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10,20,50,.92)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "zoom-out",
            }}
          >
            <img
              src={state.url}
              alt=""
              style={{
                maxWidth: "95vw",
                maxHeight: "95vh",
                objectFit: "contain",
                borderRadius: 12,
              }}
            />
            <button
              onClick={() => setLightbox(false)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "rgba(255,255,255,.1)",
                border: "1px solid rgba(255,255,255,.2)",
                borderRadius: 10,
                padding: 10,
                cursor: "pointer",
                color: "#fff",
                backdropFilter: "blur(8px)",
              }}
            >
              <X size={17} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Map Preview ───────────────────────────────────────────────────────────────
function MapPreview({ lat, lng }) {
  if (lat === null || lat === undefined || lng === null || lng === undefined)
    return null;
  if (isNaN(Number(lat)) || isNaN(Number(lng))) return null;
  const pad = 0.005;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=16`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`;

  return (
    <div>
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: `1.5px solid ${T.border0}`,
          position: "relative",
          height: 190,
          background: T.surface1,
          boxShadow: "0 2px 16px rgba(37,99,235,.07)",
        }}
      >
        <iframe
          title="Location Map"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - pad},${lat - pad},${lng + pad},${lat + pad}&layer=mapnik&marker=${lat},${lng}`}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
          loading="lazy"
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            background:
              "linear-gradient(to top, rgba(255,255,255,.95), transparent)",
            pointerEvents: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <div
          style={{
            flex: 1,
            background: T.blue50,
            border: `1.5px solid ${T.blue100}`,
            borderRadius: 12,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              flexShrink: 0,
              background: T.blue100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Crosshair size={13} color={T.blue600} />
          </div>
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: T.blue400,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              GPS Coordinates
            </div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: T.blue800,
                fontFamily: "'Courier New', monospace",
              }}
            >
              {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
            </div>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "10px 16px",
            flexShrink: 0,
            background: T.blue600,
            borderRadius: 12,
            color: T.white,
            textDecoration: "none",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            boxShadow: `0 4px 14px ${T.blue500}40`,
            transition: "all .18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.blue700;
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = T.blue600;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <Navigation size={15} /> Maps
        </a>

        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "10px 14px",
            flexShrink: 0,
            background: T.white,
            borderRadius: 12,
            border: `1.5px solid ${T.border0}`,
            color: T.ink2,
            textDecoration: "none",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            transition: "all .18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = T.blue200;
            e.currentTarget.style.color = T.blue600;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = T.border0;
            e.currentTarget.style.color = T.ink2;
          }}
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
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 0",
        borderBottom: last ? "none" : `1px solid ${T.surface2}`,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          flexShrink: 0,
          background: accent ? T.blue50 : T.surface1,
          border: `1.5px solid ${accent ? T.blue100 : T.border0}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={13} color={accent ? T.blue600 : T.ink3} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 10,
            color: T.ink4,
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: 13,
            color: T.ink0,
            fontWeight: 500,
            fontFamily: mono ? "'Courier New', monospace" : "inherit",
            wordBreak: "break-word",
            lineHeight: 1.55,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHead({ label, icon: Icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: "22px 0 12px",
      }}
    >
      {Icon && (
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            flexShrink: 0,
            background: T.blue50,
            border: `1px solid ${T.blue100}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={11} color={T.blue600} />
        </div>
      )}
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: T.blue700,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: `linear-gradient(to right, ${T.blue100}, transparent)`,
        }}
      />
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: T.white,
        borderRadius: 14,
        border: `1.5px solid ${T.border0}`,
        padding: "4px 16px",
        boxShadow: "0 1px 6px rgba(37,99,235,.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const resolveCategoryName = (e) =>
  getLangStr(e.serviceCategory?.name) ||
  getLangStr(e.category?.name) ||
  getLangStr(e.categoryName) ||
  getLangStr(e.serviceCategoryName) ||
  getLangStr(e.category) ||
  "General";

const resolveIncidentType = (e) =>
  getLangStr(e.serviceType?.name) ||
  getLangStr(e.serviceType) ||
  getLangStr(e.emergencyType?.name) ||
  getLangStr(e.emergencyType) ||
  getLangStr(e.type) ||
  "General";

const resolveReporter = (e) =>
  e.user || e.guest || e.reportedBy || e.reporter || null;

const resolveMediaUrl = (e) => {
  const media =
    e.media || e.mediaUrl || e.mediaPath || e.attachment || e.file || null;
  if (Array.isArray(media)) return media[0]?.url || media[0] || null;
  return media || null;
};

// ─── Details Tab ──────────────────────────────────────────────────────────────
function DetailsTab({
  emergency: e,
  localStatus,
  onDownloadPDF,
  isDownloading,
  token,
  isService,
}) {
  const { lat, lng } = parseLocation(e);

  return (
    <div style={{ padding: "20px 20px 48px" }}>
      {/* Hero */}
      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          border: `1.5px solid ${T.blue200}`,
          background: `linear-gradient(140deg, ${T.blue600} 0%, ${T.blue800} 100%)`,
          padding: "22px 22px 20px",
          position: "relative",
          boxShadow: `0 8px 32px ${T.blue500}30`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,.06)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            right: 40,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "rgba(255,255,255,.04)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: "rgba(255,255,255,.15)",
              border: "1.5px solid rgba(255,255,255,.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={22} color="#fff" />
          </div>
          <StatusBadge status={localStatus} />
        </div>

        <h2
          style={{
            margin: "0 0 5px",
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-.4px",
          }}
        >
          {getLangStr(e.kebele?.name) || "Unknown Location"}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "rgba(255,255,255,.65)",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <MapPin size={12} color="rgba(255,255,255,.5)" />
          {getLangStr(e.subdivision) ||
            getLangStr(e.address) ||
            getLangStr(e.specificLocation) ||
            "No subdivision specified"}
        </p>

        {e.mergedCount > 1 && (
          <div
            style={{
              marginTop: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,.15)",
              border: "1px solid rgba(255,255,255,.25)",
              borderRadius: 8,
              padding: "5px 11px",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            <GitMerge size={11} /> {e.mergedCount} incidents merged
          </div>
        )}
      </div>

      {/* Media */}
      {resolveMediaUrl(e) && (
        <>
          <SectionHead label="Media Evidence" icon={Camera} />
          <MediaViewer mediaUrl={resolveMediaUrl(e)} token={token} />
        </>
      )}

      {/* Narrative */}
      {e.description && (
        <>
          <SectionHead
            label={isService ? "Service Narrative" : "Incident Narrative"}
            icon={FileText}
          />
          <div
            style={{
              background: T.blue50,
              borderRadius: 12,
              padding: "15px 18px",
              border: `1.5px solid ${T.blue100}`,
              borderLeft: `4px solid ${T.blue500}`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: T.ink1,
                lineHeight: 1.8,
                fontStyle: "italic",
              }}
            >
              "{getLangStr(e.description)}"
            </p>
          </div>
        </>
      )}

      {/* Details */}
      <SectionHead
        label={isService ? "Service Details" : "Incident Details"}
        icon={Info}
      />
      <Card>
        <InfoRow
          icon={Hash}
          label={isService ? "Service ID" : "Incident ID"}
          value={String(e._id || e.id || "")
            .slice(-12)
            .toUpperCase()}
          mono
          accent
        />
        <InfoRow
          icon={Tag}
          label="Category"
          value={resolveCategoryName(e)}
          accent
        />
        <InfoRow icon={Layers} label="Type" value={resolveIncidentType(e)} />
        <InfoRow
          icon={Activity}
          label="Status"
          value={localStatus?.replace(/_/g, " ")}
        />
        <InfoRow
          icon={Calendar}
          label="Reported At"
          value={e.createdAt ? new Date(e.createdAt).toLocaleString() : null}
        />
        <InfoRow
          icon={Calendar}
          label="Last Updated"
          value={e.updatedAt ? new Date(e.updatedAt).toLocaleString() : null}
          last
        />
      </Card>

      {/* Location */}
      <SectionHead label="Location" icon={MapPin} />
      <Card style={{ marginBottom: 12 }}>
        <InfoRow
          icon={MapPin}
          label="Kebele"
          value={getLangStr(e.kebele?.name)}
          accent
        />
        <InfoRow
          icon={MapPin}
          label="Subdivision"
          value={getLangStr(e.subdivision)}
        />
        <InfoRow
          icon={MapPin}
          label="Specific Location"
          value={getLangStr(e.specificLocation) || getLangStr(e.address)}
          last
        />
      </Card>
      <MapPreview lat={lat} lng={lng} />

      {/* Reporter */}
      {resolveReporter(e) && (
        <>
          <SectionHead label="Reporter" icon={User} />
          <Card>
            <InfoRow
              icon={User}
              label="Name"
              value={getLangStr(resolveReporter(e)?.name)}
              accent
            />
            <InfoRow
              icon={Phone}
              label="Phone"
              value={resolveReporter(e)?.phone}
              last
            />
          </Card>
        </>
      )}

      {/* PDF record */}
      {localStatus === "resolved" && !isService && (
        <>
          <SectionHead label="Official Record" icon={Shield} />
          <div
            style={{
              background: T.green50,
              borderRadius: 16,
              border: `1.5px solid ${T.green100}`,
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: T.green100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={15} color={T.green600} />
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 800,
                    color: T.green600,
                  }}
                >
                  Case Finalized
                </p>
                <p style={{ margin: 0, fontSize: 11, color: T.green500 }}>
                  Official report is ready to download
                </p>
              </div>
            </div>
            <button
              onClick={onDownloadPDF}
              disabled={isDownloading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "13px 0",
                background: isDownloading ? T.green100 : T.green600,
                border: "none",
                borderRadius: 11,
                color: isDownloading ? T.green600 : T.white,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".06em",
                cursor: isDownloading ? "not-allowed" : "pointer",
                transition: "all .2s",
                boxShadow: isDownloading
                  ? "none"
                  : `0 4px 14px ${T.green500}40`,
              }}
            >
              {isDownloading ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: `2px solid ${T.green100}`,
                      borderTopColor: T.green600,
                      animation: "spin .7s linear infinite",
                    }}
                  />{" "}
                  Generating…
                </>
              ) : (
                <>
                  <Download size={14} /> Download Official PDF
                </>
              )}
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dotPulse {
          0%   { box-shadow: 0 0 0 0 currentColor; opacity:1; }
          70%  { box-shadow: 0 0 0 5px transparent; opacity:.7; }
          100% { box-shadow: 0 0 0 0 transparent; opacity:1; }
        }
      `}</style>
    </div>
  );
}

// ─── Actions Tab ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  {
    value: "reported",
    label: "Reported",
    icon: Radio,
    color: T.ink3,
    bg: T.surface1,
  },
  {
    value: "assigned",
    label: "Assigned",
    icon: Shield,
    color: T.blue600,
    bg: T.blue50,
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: Zap,
    color: T.amber600,
    bg: T.amber50,
  },
  {
    value: "resolved",
    label: "Resolved",
    icon: CheckCircle2,
    color: T.green600,
    bg: T.green50,
  },
];

function ActionsTab({ currentStatus, onUpdateStatus, isService }) {
  const fileInputRef = useRef(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [reportData, setReportData] = useState({
    incidentSummary: "",
    injuredCount: 0,
    deceasedCount: 0,
    witnesses: [""],
    suspects: [""],
    propertyDamage: "",
    propertyDamageValue: 0,
    media: [],
  });
  const isResolved = currentStatus === "resolved";

  const addRow = (f) => setReportData((p) => ({ ...p, [f]: [...p[f], ""] }));
  const removeRow = (f, i) => {
    const a = reportData[f].filter((_, j) => j !== i);
    setReportData((p) => ({ ...p, [f]: a.length ? a : [""] }));
  };
  const dynChange = (f, i, v) => {
    const a = [...reportData[f]];
    a[i] = v;
    setReportData((p) => ({ ...p, [f]: a }));
  };
  const handleFiles = (ev) => {
    setReportData((p) => ({
      ...p,
      media: [...p.media, ...Array.from(ev.target.files)],
    }));
    ev.target.value = "";
  };
  const removeFile = (i) =>
    setReportData((p) => ({ ...p, media: p.media.filter((_, j) => j !== i) }));

  const inputBase = {
    width: "100%",
    background: T.white,
    border: `1.5px solid ${T.border0}`,
    borderRadius: 10,
    padding: "10px 12px 10px 38px",
    fontSize: 13,
    color: T.ink0,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color .15s, box-shadow .15s",
  };
  const labelBase = {
    display: "block",
    marginBottom: 6,
    fontSize: 10,
    fontWeight: 800,
    color: T.ink3,
    letterSpacing: ".1em",
    textTransform: "uppercase",
  };
  const iconPos = {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  };
  const onFocus = (e) => {
    e.target.style.borderColor = T.blue300;
    e.target.style.boxShadow = `0 0 0 3px ${T.blue100}`;
  };
  const onBlur = (e) => {
    e.target.style.borderColor = T.border0;
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={{ padding: "20px 20px 48px" }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
          padding: "14px 16px",
          borderRadius: 13,
          background: T.blue50,
          border: `1.5px solid ${T.blue100}`,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: T.blue100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ClipboardList size={16} color={T.blue600} />
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 800,
              color: T.blue800,
            }}
          >
            Status Management
          </p>
          <p style={{ margin: 0, fontSize: 11, color: T.blue400 }}>
            Update the operational status of this
            {isService ? " service assignment" : " emergency"}
          </p>
        </div>
      </div>

      {/* Status options */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 22,
        }}
      >
        {STATUS_OPTIONS.map((opt) => {
          const isCurrent = currentStatus === opt.value;
          return (
            <button
              key={opt.value}
              disabled={isCurrent || isResolved}
              onClick={() =>
                opt.value === "resolved"
                  ? setIsFinalizing(true)
                  : onUpdateStatus(opt.value)
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderRadius: 13,
                border: isCurrent
                  ? `2px solid ${opt.color}44`
                  : `1.5px solid ${T.border0}`,
                background: isCurrent ? opt.bg : T.white,
                cursor: isCurrent || isResolved ? "not-allowed" : "pointer",
                opacity: isResolved && !isCurrent ? 0.3 : 1,
                transition: "all .16s",
                fontFamily: "inherit",
                boxShadow: isCurrent
                  ? `0 2px 12px ${opt.color}18`
                  : "0 1px 4px rgba(0,0,0,.04)",
              }}
              onMouseEnter={(e) => {
                if (!isCurrent && !isResolved) {
                  e.currentTarget.style.borderColor = opt.color + "55";
                  e.currentTarget.style.background = opt.bg;
                  e.currentTarget.style.boxShadow = `0 3px 14px ${opt.color}12`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.borderColor = T.border0;
                  e.currentTarget.style.background = T.white;
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: isCurrent ? `${opt.color}18` : T.surface1,
                    border: `1.5px solid ${isCurrent ? opt.color + "33" : T.border0}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <opt.icon size={17} color={isCurrent ? opt.color : T.ink3} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <span
                    style={{
                      display: "block",
                      fontWeight: 700,
                      fontSize: 14,
                      color: isCurrent ? opt.color : T.ink0,
                    }}
                  >
                    {opt.label}
                  </span>
                  {isCurrent && (
                    <span
                      style={{ fontSize: 11, color: opt.color, opacity: 0.7 }}
                    >
                      Currently active
                    </span>
                  )}
                </div>
              </div>
              {isCurrent ? (
                <CheckCircle2 size={18} color={opt.color} />
              ) : (
                <ChevronRight size={16} color={T.ink4} />
              )}
            </button>
          );
        })}
      </div>

      {isResolved && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            background: T.green50,
            borderRadius: 12,
            border: `1.5px solid ${T.green100}`,
          }}
        >
          <CheckCircle2 size={18} color={T.green600} />
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              color: T.green600,
            }}
          >
            Case Finalized & Closed
          </p>
        </div>
      )}

      {/* Finalization form */}
      <AnimatePresence>
        {isFinalizing && !isResolved && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            style={{
              paddingTop: 22,
              borderTop: `1.5px solid ${T.border0}`,
              marginTop: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 15px",
                marginBottom: 20,
                background: T.amber50,
                borderRadius: 11,
                border: `1.5px solid ${T.amber100}`,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: T.amber100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertTriangle size={13} color={T.amber600} />
              </div>
              <span
                style={{ fontSize: 11, fontWeight: 700, color: T.amber600 }}
              >
                Incident report required before closing this case
              </span>
            </div>

            {/* Counts */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {[
                {
                  field: "injuredCount",
                  label: "Injured",
                  Icon: Users,
                  color: T.amber600,
                },
                {
                  field: "deceasedCount",
                  label: "Deceased",
                  Icon: AlertTriangle,
                  color: T.red600,
                },
              ].map(({ field, label, Icon, color }) => (
                <div key={field}>
                  <label style={labelBase}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <Icon size={13} color={color} style={iconPos} />
                    <input
                      type="number"
                      min="0"
                      value={reportData[field]}
                      onChange={(ev) =>
                        setReportData((p) => ({
                          ...p,
                          [field]: parseInt(ev.target.value) || 0,
                        }))
                      }
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Property damage */}
            <div
              style={{
                background: T.surface1,
                borderRadius: 13,
                padding: 14,
                border: `1.5px solid ${T.border0}`,
                marginBottom: 16,
              }}
            >
              <label style={labelBase}>Property Damage Description</label>
              <div style={{ position: "relative", marginBottom: 10 }}>
                <Home
                  size={13}
                  color={T.ink4}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: 13,
                    pointerEvents: "none",
                  }}
                />
                <textarea
                  placeholder="Describe any property damage…"
                  value={reportData.propertyDamage}
                  onChange={(ev) =>
                    setReportData((p) => ({
                      ...p,
                      propertyDamage: ev.target.value,
                    }))
                  }
                  style={{
                    ...inputBase,
                    paddingTop: 11,
                    height: 80,
                    resize: "none",
                  }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <label style={labelBase}>Estimated Value (ETB)</label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    ...iconPos,
                    left: 10,
                    fontSize: 9,
                    fontWeight: 800,
                    color: T.ink4,
                  }}
                >
                  ETB
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={reportData.propertyDamageValue}
                  onChange={(ev) =>
                    setReportData((p) => ({
                      ...p,
                      propertyDamageValue: parseFloat(ev.target.value) || 0,
                    }))
                  }
                  style={{ ...inputBase, paddingLeft: 44 }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </div>

            {/* Witnesses & Suspects */}
            {[
              {
                field: "witnesses",
                label: "Witnesses",
                addLabel: "Add Witness",
                Icon: Users,
                placeholder: "Witness name",
              },
              {
                field: "suspects",
                label: "Suspects",
                addLabel: "Add Suspect",
                Icon: Gavel,
                placeholder: "Suspect details",
              },
            ].map(({ field, label, addLabel, Icon, placeholder }) => (
              <div key={field} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <label style={labelBase}>{label}</label>
                  <button
                    onClick={() => addRow(field)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: T.blue50,
                      border: `1.5px solid ${T.blue100}`,
                      borderRadius: 7,
                      padding: "4px 10px",
                      color: T.blue600,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = T.blue100;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = T.blue50;
                    }}
                  >
                    <Plus size={11} /> {addLabel}
                  </button>
                </div>
                {reportData[field].map((val, idx) => (
                  <div
                    key={idx}
                    style={{ display: "flex", gap: 6, marginBottom: 6 }}
                  >
                    <div style={{ flex: 1, position: "relative" }}>
                      <Icon size={13} color={T.ink4} style={iconPos} />
                      <input
                        type="text"
                        placeholder={`${placeholder} ${idx + 1}`}
                        value={val}
                        onChange={(ev) =>
                          dynChange(field, idx, ev.target.value)
                        }
                        style={inputBase}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    </div>
                    {reportData[field].length > 1 && (
                      <button
                        onClick={() => removeRow(field, idx)}
                        style={{
                          background: "none",
                          border: "none",
                          color: T.ink4,
                          cursor: "pointer",
                          padding: "0 4px",
                          transition: "color .15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = T.red500)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = T.ink4)
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Summary */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelBase}>
                Incident Summary <span style={{ color: T.red500 }}>*</span>
              </label>
              <textarea
                placeholder="Provide a detailed incident summary…"
                value={reportData.incidentSummary}
                onChange={(ev) =>
                  setReportData((p) => ({
                    ...p,
                    incidentSummary: ev.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  height: 100,
                  background: T.white,
                  border: `1.5px solid ${T.border0}`,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 13,
                  color: T.ink0,
                  outline: "none",
                  resize: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  lineHeight: 1.65,
                  transition: "border-color .15s, box-shadow .15s",
                }}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Media */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelBase}>Media Evidence</label>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  border: `2px dashed ${T.blue200}`,
                  borderRadius: 12,
                  background: T.blue50,
                  color: T.blue400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.blue400;
                  e.currentTarget.style.color = T.blue600;
                  e.currentTarget.style.background = T.blue100;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.blue200;
                  e.currentTarget.style.color = T.blue400;
                  e.currentTarget.style.background = T.blue50;
                }}
              >
                <Camera size={15} />
                {reportData.media.length > 0
                  ? `${reportData.media.length} file(s) — click to add more`
                  : "Attach Scene Photos / Evidence"}
              </button>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFiles}
              />
              {reportData.media.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  {reportData.media.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: T.surface1,
                        borderRadius: 9,
                        border: `1px solid ${T.border0}`,
                        fontSize: 12,
                        color: T.ink2,
                      }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "82%",
                        }}
                      >
                        {f.name}
                      </span>
                      <button
                        onClick={() => removeFile(i)}
                        style={{
                          background: "none",
                          border: "none",
                          color: T.ink4,
                          cursor: "pointer",
                          padding: 0,
                          transition: "color .15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = T.red500)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = T.ink4)
                        }
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={() =>
                onUpdateStatus("resolved", {
                  ...reportData,
                  witnesses: reportData.witnesses.filter((w) => w.trim()),
                  suspects: reportData.suspects.filter((s) => s.trim()),
                })
              }
              disabled={!reportData.incidentSummary.trim()}
              style={{
                width: "100%",
                padding: "15px 0",
                background: reportData.incidentSummary.trim()
                  ? `linear-gradient(135deg, ${T.blue600}, ${T.blue700})`
                  : T.surface2,
                border: "none",
                borderRadius: 13,
                color: reportData.incidentSummary.trim() ? T.white : T.ink4,
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: ".04em",
                cursor: reportData.incidentSummary.trim()
                  ? "pointer"
                  : "not-allowed",
                transition: "all .2s",
                fontFamily: "inherit",
                boxShadow: reportData.incidentSummary.trim()
                  ? `0 6px 20px ${T.blue500}35`
                  : "none",
              }}
            >
              Finalize & Close Case
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "details", icon: Activity, label: "Details" },
  { id: "action", icon: ClipboardList, label: "Actions" },
  { id: "chat", icon: MessageSquare, label: "Chat" },
];

// ─── Main Drawer ──────────────────────────────────────────────────────────────
const EmergencyDetailDrawer = ({
  isOpen,
  onClose,
  emergency,
  onRefresh,
  isService = false,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [localStatus, setLocalStatus] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const apiPath = isService ? "service" : "emergencies";

  // Filter tabs based on service type - hide chat for service reports
  const availableTabs = TABS.filter((tab) => !(isService && tab.id === "chat"));

  const prevIdRef = useRef(null);

  useEffect(() => {
    if (!emergency) return;
    const id = emergency._id || emergency.id;
    if (id !== prevIdRef.current) {
      prevIdRef.current = id;
      setLocalStatus(emergency.status);
      setActiveTab("details");
    }
  }, [emergency]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const id = emergency?._id || emergency?.id;
      const res = await axios({
        url: `${API_BASE}/api/finalReport/download/${id}`,
        method: "GET",
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `Report_${id}.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpdateStatus = async (newStatus, reportPayload = null) => {
    try {
      const id = emergency?._id || emergency?.id;
      if (!token || !id) return;

      if (newStatus === "resolved" && reportPayload && !isService) {
        const fd = new FormData();
        fd.append("incidentSummary", reportPayload.incidentSummary);
        fd.append("injuredCount", reportPayload.injuredCount);
        fd.append("deceasedCount", reportPayload.deceasedCount);
        fd.append("propertyDamage", reportPayload.propertyDamage);
        fd.append("propertyDamageValue", reportPayload.propertyDamageValue);
        reportPayload.witnesses.forEach((w) => fd.append("witnesses[]", w));
        reportPayload.suspects.forEach((s) => fd.append("suspects[]", s));
        // ✅ FIX: only append actual File objects, not empty array
        if (reportPayload.media && reportPayload.media.length > 0) {
          reportPayload.media.forEach((f) => fd.append("media", f));
        }

        await axios.post(`${API_BASE}/api/finalReport/${id}`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            // ✅ FIX: do NOT set Content-Type manually — let browser set it with boundary
          },
        });
        // ✅ Service already sets status to resolved, skip the PATCH
        setLocalStatus(newStatus);
        onRefresh?.();
        setActiveTab("details");
        return; // ← exit early, no PATCH needed
      }

      // Non-resolved status changes
      await axios.patch(
        `${API_BASE}/api/${apiPath}/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setLocalStatus(newStatus);
      onRefresh?.();
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || "Server Error"}`);
    }
  };

  if (!emergency) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10,31,68,.3)",
              zIndex: 70,
              backdropFilter: "blur(5px)",
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(520px, 100vw)",
              background: T.surface1,
              zIndex: 80,
              display: "flex",
              flexDirection: "column",
              boxShadow:
                "-6px 0 40px rgba(10,31,68,.12), -1px 0 0 rgba(37,99,235,.08)",
              fontFamily: "'Sora','Helvetica Neue',sans-serif",
            }}
          >
            {/* Top stripe */}
            <div
              style={{
                height: 3,
                flexShrink: 0,
                background: `linear-gradient(to right, ${T.blue500}, ${T.blue300}, ${T.blue600})`,
              }}
            />

            {/* Header */}
            <div
              style={{
                padding: "0 18px",
                borderBottom: `1.5px solid ${T.border0}`,
                background: T.white,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 62,
                boxShadow: "0 1px 0 rgba(37,99,235,.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background:
                      localStatus === "resolved" ? T.green500 : T.red500,
                    boxShadow:
                      localStatus === "resolved"
                        ? `0 0 0 3px ${T.green100}`
                        : `0 0 0 3px ${T.red100}`,
                    animation:
                      localStatus === "resolved"
                        ? "none"
                        : "headerPulse 2s ease-in-out infinite",
                  }}
                />
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 800,
                      color: T.ink0,
                      letterSpacing: "-.2px",
                    }}
                  >
                    {isService ? "Service Detail" : "Emergency Detail"}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 10,
                      color: T.ink4,
                      letterSpacing: ".1em",
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    #
                    {String(emergency._id || emergency.id || "")
                      .slice(-10)
                      .toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: `1.5px solid ${T.border0}`,
                  background: T.surface1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.ink3,
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = T.surface2;
                  e.currentTarget.style.borderColor = T.border1;
                  e.currentTarget.style.color = T.ink1;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = T.surface1;
                  e.currentTarget.style.borderColor = T.border0;
                  e.currentTarget.style.color = T.ink3;
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: `1.5px solid ${T.border0}`,
                background: T.white,
                flexShrink: 0,
              }}
            >
              {availableTabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      padding: "14px 0",
                      background: active ? T.blue50 : "transparent",
                      border: "none",
                      borderBottom: active
                        ? `2.5px solid ${T.blue500}`
                        : "2.5px solid transparent",
                      color: active ? T.blue600 : T.ink4,
                      fontSize: 11,
                      fontWeight: active ? 800 : 600,
                      letterSpacing: ".07em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all .15s",
                      fontFamily: "inherit",
                    }}
                  >
                    <tab.icon size={13} /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                background: T.surface1,
                scrollbarWidth: "thin",
                scrollbarColor: `${T.border1} transparent`,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.13 }}
                >
                  {activeTab === "details" && (
                    <DetailsTab
                      emergency={emergency}
                      localStatus={localStatus}
                      onDownloadPDF={handleDownloadPDF}
                      isDownloading={isDownloading}
                      token={token}
                      isService={isService}
                    />
                  )}
                  {activeTab === "action" && (
                    <ActionsTab
                      currentStatus={localStatus}
                      onUpdateStatus={handleUpdateStatus}
                      isService={isService}
                    />
                  )}
                  {activeTab === "chat" && !isService && (
                    <ChatTab
                      emergencyId={emergency._id || emergency.id}
                      token={token}
                      apiBaseUrl={API_BASE}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes headerPulse {
              0%,100% { box-shadow: 0 0 0 3px #FEE2E2; }
              50%     { box-shadow: 0 0 0 7px #FFF5F5; }
            }
            @keyframes dotPulse {
              0%   { box-shadow: 0 0 0 0 rgba(37,99,235,.5); }
              70%  { box-shadow: 0 0 0 6px rgba(37,99,235,0); }
              100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
            }
            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #C8D8EE; border-radius: 4px; }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmergencyDetailDrawer;
