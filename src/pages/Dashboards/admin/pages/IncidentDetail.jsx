import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Info,
  Camera,
  Phone,
  User,
  Calendar,
  Tag,
  Layers,
  Eye,
  Image as ImageIcon,
  Hash,
  Crosshair,
  Map,
  X,
  GitMerge,
  Radio,
} from "lucide-react";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://bahirlink-backend-1.onrender.com";

// ─── Design Tokens ────────────────────────────────────────────────────────────
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

// ─── Helper: Smart Localization Parser ────────────────────────────────────────
const renderEnglish = (val) => {
  if (!val) return "";
  if (typeof val === "object") {
    return val.en || val.name?.en || val.label?.en || val.name || "";
  }
  if (
    typeof val === "string" &&
    (val.includes('{"en":') || val.includes('{"am":'))
  ) {
    try {
      const parsed = JSON.parse(val);
      return parsed.en || "";
    } catch {
      return val;
    }
  }
  return String(val);
};

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
  escalated: {
    label: "Escalated",
    color: T.red600,
    bg: T.red50,
    border: T.red100,
    dot: T.red500,
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

// ─── Location Parser ───────────────────────────────────────────────────────────
function parseLocation(e) {
  if (e.latitude != null && e.longitude != null) {
    const lat = parseFloat(e.latitude),
      lng = parseFloat(e.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (typeof e.location === "string" && e.location.includes(",")) {
    const [a, b] = e.location.split(",");
    const lat = parseFloat(a?.trim()),
      lng = parseFloat(b?.trim());
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (
    Array.isArray(e.location?.coordinates) &&
    e.location.coordinates.length === 2
  ) {
    const lng = parseFloat(e.location.coordinates[0]);
    const lat = parseFloat(e.location.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return { lat: null, lng: null };
}

// ─── Shared Components ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const key = (status || "reported").toLowerCase().replace(/\s+/g, "_");
  const s = STATUS_CFG[key] || STATUS_CFG.reported;
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

function MediaViewer({ mediaUrl }) {
  const token = localStorage.getItem("token");
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
        if (!cancelled)
          setState({
            url: URL.createObjectURL(res.data),
            type: res.headers["content-type"],
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
  }, [mediaUrl, token]);

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
        }}
      >
        {state.loading && (
          <div style={{ color: T.ink3, fontSize: 12 }}>Loading...</div>
        )}
        {!state.loading && state.url && isImage && (
          <img
            src={state.url}
            alt="Evidence"
            onClick={() => setLightbox(true)}
            style={{
              width: "100%",
              maxHeight: 290,
              objectFit: "cover",
              cursor: "zoom-in",
            }}
          />
        )}
        {!state.loading && state.url && isVideo && (
          <video
            src={state.url}
            controls
            style={{ width: "100%", maxHeight: 290 }}
          />
        )}
      </div>
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,20,50,.92)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
        </div>
      )}
    </>
  );
}

function MapPreview({ lat, lng }) {
  if (lat == null || lng == null) return null;
  const pad = 0.005;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=16`;
  return (
    <div>
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: `1.5px solid ${T.border0}`,
          height: 190,
          background: T.surface1,
        }}
      >
        <iframe
          title="Location"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - pad},${lat - pad},${lng + pad},${lat + pad}&layer=mapnik&marker=${lat},${lng}`}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginTop: 10,
          padding: "10px",
          background: T.blue600,
          borderRadius: 12,
          color: "#fff",
          textDecoration: "none",
          fontSize: 11,
          fontWeight: 800,
        }}
      >
        <Navigation size={14} /> Open Google Maps
      </a>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono, last, accent }) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 0",
        borderBottom: last ? "none" : `1px solid ${T.surface2}`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: accent ? T.blue50 : T.surface1,
          border: `1.5px solid ${accent ? T.blue100 : T.border0}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={13} color={accent ? T.blue600 : T.ink3} />
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: 10,
            color: T.ink4,
            fontWeight: 700,
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
            fontFamily: mono ? "monospace" : "inherit",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

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
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: T.blue50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={11} color={T.blue600} />
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
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
          background: `linear-gradient(to right,${T.blue100},transparent)`,
        }}
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const IncidentDetailPage = ({ incidentProp, panelMode = false }) => {
  const e = incidentProp;
  if (!e)
    return (
      <div style={{ padding: 40, textAlign: "center", color: T.ink4 }}>
        No incident selected.
      </div>
    );

  const { lat, lng } = parseLocation(e);
  const status = (e.status || "reported").toLowerCase().replace(/\s+/g, "_");

  return (
    <div
      style={{
        fontFamily: "'Sora', sans-serif",
        padding: panelMode ? "20px 24px 48px" : "28px 28px 64px",
      }}
    >
      <style>{`@keyframes dotPulse { 0%,100%{box-shadow:0 0 0 0 currentColor;opacity:1} 70%{box-shadow:0 0 0 5px transparent;opacity:.7} }`}</style>

      {/* Hero card */}
      <div
        style={{
          borderRadius: 18,
          background: `linear-gradient(140deg,${T.blue600},${T.blue800})`,
          padding: "22px",
          color: "#fff",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <AlertTriangle size={24} />
          <StatusBadge status={status} />
        </div>
        <h2 style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 800 }}>
          {renderEnglish(e.kebele)}
        </h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
          <MapPin size={12} /> {renderEnglish(e.subdivision)}
        </p>
        {e.mergedCount > 1 && (
          <div
            style={{
              marginTop: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "5px 11px",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <GitMerge size={11} /> {e.mergedCount} incidents merged
          </div>
        )}
      </div>

      {/* Narrative */}
      {e.description && (
        <>
          <SectionHead label="Incident Narrative" icon={FileText} />
          <div
            style={{
              background: T.blue50,
              borderRadius: 12,
              padding: "15px",
              borderLeft: `4px solid ${T.blue500}`,
              fontStyle: "italic",
              fontSize: 13,
            }}
          >
            "{e.description}"
          </div>
        </>
      )}

      {/* Media */}
      {(e.media || e.mediaUrl) && (
        <>
          <SectionHead label="Media Evidence" icon={Camera} />
          <MediaViewer mediaUrl={e.media || e.mediaUrl} />
        </>
      )}

      {/* Details */}
      <SectionHead label="Incident Details" icon={Info} />
      <div
        style={{
          background: "#fff",
          border: `1.5px solid ${T.border0}`,
          borderRadius: 14,
          padding: "0 16px",
        }}
      >
        <InfoRow
          icon={Hash}
          label="Incident ID"
          value={String(e.id || e._id)}
          mono
          accent
        />
        <InfoRow
          icon={Tag}
          label="Category"
          value={renderEnglish(e.category)}
          accent
        />
        <InfoRow
          icon={Activity}
          label="Status"
          value={status.replace(/_/g, " ")}
        />
        <InfoRow
          icon={Calendar}
          label="Reported At"
          value={e.createdAt ? new Date(e.createdAt).toLocaleString() : null}
          last
        />
      </div>

      {/* Location */}
      <SectionHead label="Location" icon={MapPin} />
      <div
        style={{
          background: "#fff",
          border: `1.5px solid ${T.border0}`,
          borderRadius: 14,
          padding: "0 16px",
          marginBottom: 12,
        }}
      >
        <InfoRow
          icon={MapPin}
          label="Kebele"
          value={renderEnglish(e.kebele)}
          accent
        />
        <InfoRow
          icon={MapPin}
          label="Subdivision"
          value={renderEnglish(e.subdivision)}
          last
        />
      </div>
      <MapPreview lat={lat} lng={lng} />

      {/* Reporter */}
      {(e.user || e.guest) && (
        <>
          <SectionHead label="Reporter" icon={User} />
          <div
            style={{
              background: "#fff",
              border: `1.5px solid ${T.border0}`,
              borderRadius: 14,
              padding: "0 16px",
            }}
          >
            <InfoRow
              icon={User}
              label="Name"
              value={renderEnglish((e.user || e.guest)?.name)}
              accent
            />
            <InfoRow
              icon={Phone}
              label="Phone"
              value={(e.user || e.guest)?.phone}
              last
            />
          </div>
        </>
      )}
    </div>
  );
};

export default IncidentDetailPage;
