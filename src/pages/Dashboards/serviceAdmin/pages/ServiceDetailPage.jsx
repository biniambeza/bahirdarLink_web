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
  Briefcase,
  Mail,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

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

// ─── Helper: Localized Value Picker ───────────────────────────────────────────
const localize = (val) => {
  if (!val) return "";
  // Since backend now localizes based on ?lang= or sends clean objects:
  if (typeof val === "object") {
    return val.en || val.name || "";
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
  if (e?.location?.latitude != null && e?.location?.longitude != null) {
    return {
      lat: parseFloat(e.location.latitude),
      lng: parseFloat(e.location.longitude),
    };
  }
  return { lat: null, lng: null };
}

// ─── Shared Components ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const key = (status || "pending").toLowerCase().replace(/\s+/g, "_");
  const s = STATUS_CFG[key] || STATUS_CFG.pending;
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
        {!state.loading && state.url && state.type?.startsWith("image") && (
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
        {!state.loading && state.url && state.type?.startsWith("video") && (
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
        href={`https://www.google.com/maps?q=${lat},${lng}&z=16`}
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
const ServiceDetailPage = ({ incidentProp, panelMode = false }) => {
  const e = incidentProp;
  if (!e)
    return (
      <div style={{ padding: 40, textAlign: "center", color: T.ink4 }}>
        No service record selected.
      </div>
    );

  const { lat, lng } = parseLocation(e);
  const status = (e.status || "pending").toLowerCase().replace(/\s+/g, "_");

  return (
    <div
      style={{
        fontFamily: "'Sora', sans-serif",
        padding: panelMode ? "20px 24px 48px" : "28px 28px 64px",
      }}
    >
      <style>{`@keyframes dotPulse { 0%,100%{box-shadow:0 0 0 0 currentColor;opacity:1} 70%{box-shadow:0 0 0 5px transparent;opacity:.7} }`}</style>

      {/* Hero Card */}
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
          <Briefcase size={24} />
          <StatusBadge status={status} />
        </div>
        <h2 style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 800 }}>
          {localize(e.serviceType?.name)}
        </h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
          <Tag size={12} style={{ display: "inline", marginRight: 4 }} />{" "}
          {localize(e.serviceCategory?.name)}
        </p>
      </div>

      {/* Narrative */}
      {e.description && (
        <>
          <SectionHead label="Service Description" icon={FileText} />
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
            "{localize(e.description)}"
          </div>
        </>
      )}

      {/* Media Evidence */}
      {e.mediaUrl && (
        <>
          <SectionHead label="Media Evidence" icon={Camera} />
          <MediaViewer mediaUrl={e.mediaUrl} />
        </>
      )}

      {/* Details */}
      <SectionHead label="Request Info" icon={Info} />
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
          label="Request ID"
          value={String(e.id)}
          mono
          accent
        />
        <InfoRow
          icon={Activity}
          label="Current Status"
          value={status.replace(/_/g, " ")}
        />
        <InfoRow
          icon={Calendar}
          label="Created Date"
          value={e.createdAt ? new Date(e.createdAt).toLocaleString() : null}
          last
        />
      </div>

      {/* Location */}
      <SectionHead label="Location Details" icon={MapPin} />
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
          label="Subdivision"
          value={localize(e.subdivision)}
          accent
        />
        <InfoRow icon={MapPin} label="Street" value={localize(e.street)} last />
      </div>
      <MapPreview lat={lat} lng={lng} />

      {/* Citizen / Reporter */}
      {e.citizen && (
        <>
          <SectionHead label="Applicant Information" icon={User} />
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
              value={e.citizen.fullName}
              accent
            />
            <InfoRow icon={Mail} label="Email" value={e.citizen.email} last />
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceDetailPage;
