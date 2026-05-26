import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { formatDistanceToNow, format, subDays, subMonths } from "date-fns";
import {
  Flame,
  Droplets,
  Skull,
  Ambulance,
  Radio,
  Search,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Shield,
  Users,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ServiceDetailPage from "./ServiceDetailPage";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");
const authHdrs = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const DEFAULT_PALETTE = [
  "#F97316",
  "#6366F1",
  "#EF4444",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#84CC16",
  "#DC2626",
];
const FORCED_COLORS = {
  fire: "#F97316",
  crime: "#6366F1",
  medical: "#EF4444",
  flood: "#06B6D4",
  environment: "#10B981",
  hazmat: "#F59E0B",
  accident: "#3B82F6",
  other: "#94A3B8",
};
const ICON_MAP = {
  fire: Flame,
  crime: Skull,
  medical: Ambulance,
  flood: Droplets,
};
const TEAM_COLORS = [
  "#F97316",
  "#EF4444",
  "#6366F1",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
];

const STATUS_META = {
  reported: {
    label: "Reported",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  in_progress: {
    label: "In Progress",
    color: "#3B82F6",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  resolved: {
    label: "Resolved",
    color: "#10B981",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  escalated: {
    label: "Escalated",
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
  pending: {
    label: "Reported",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  active: {
    label: "Reported",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  responding: {
    label: "In Progress",
    color: "#3B82F6",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
};

// ─── CORE EN EXTRACTOR ───────────────────────────────────────────────────────
const toEn = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return String(value);
  if (typeof value.en === "string") return value.en;
  if (value.name !== undefined) return toEn(value.name);
  const first = Object.values(value).find((v) => typeof v === "string");
  return first || "";
};

const getCatName = (catOrName) => {
  if (!catOrName) return "Other";
  const raw = catOrName?.name !== undefined ? catOrName.name : catOrName;
  return toEn(raw) || "Other";
};

const getCatKey = (e) => {
  const src =
    e.category?.name !== undefined ? e.category : e.category || "other";
  const name = getCatName(src);
  return name.toLowerCase().trim().replace(/\s+/g, "_");
};

const getStatusKey = (e) => {
  const r = (e.status || "reported").toLowerCase().replace(/\s+/g, "_");
  if (r === "active" || r === "pending") return "reported";
  if (r === "responding") return "in_progress";
  return r;
};

const isResolved = (e) => getStatusKey(e) === "resolved";
const getInitials = (n = "") =>
  n
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "??";

// ─── CHART BUILDERS ──────────────────────────────────────────────────────────
function buildTimeline(services, range) {
  const now = new Date();
  if (range === "daily") {
    return Array.from({ length: 12 }, (_, i) => {
      const h = i * 2;
      const label = `${String(h).padStart(2, "0")}:00`;
      const count = services.filter((e) => {
        const d = new Date(e.createdAt);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate() &&
          d.getHours() >= h &&
          d.getHours() < h + 2
        );
      }).length;
      return { label, count };
    });
  }
  if (range === "weekly") {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(now, 6 - i);
      const label = format(day, "EEE");
      const count = services.filter(
        (e) =>
          format(new Date(e.createdAt), "yyyy-MM-dd") ===
          format(day, "yyyy-MM-dd"),
      ).length;
      return { label, count };
    });
  }
  return Array.from({ length: 12 }, (_, i) => {
    const month = subMonths(now, 11 - i);
    const label = format(month, "MMM");
    const count = services.filter((e) => {
      const d = new Date(e.createdAt);
      return (
        d.getFullYear() === month.getFullYear() &&
        d.getMonth() === month.getMonth()
      );
    }).length;
    return { label, count };
  });
}

function buildCategoryPie(services, catColorMap) {
  const counts = {};
  services.forEach((e) => {
    const k = getCatKey(e);
    counts[k] = (counts[k] || 0) + 1;
  });
  return Object.entries(counts).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
    value,
    color: catColorMap[key] || "#94A3B8",
    key,
  }));
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
const BlueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #DBEAFE",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 8px 32px rgba(59,130,246,0.15)",
        fontSize: 12,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <p style={{ color: "#1E40AF", fontWeight: 700, marginBottom: 4 }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#3B82F6", fontWeight: 600 }}>
          {p.name || "Count"}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── KPI CARD ────────────────────────────────────────────────────────────────
const KPICard = ({
  label,
  value,
  sub,
  trend,
  trendUp,
  accent,
  icon: Icon,
  delay = 0,
  loading,
}) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 20,
      padding: "22px 24px",
      border: `1px solid ${accent}22`,
      boxShadow: `0 1px 0 0 ${accent}40, 0 8px 40px rgba(59,130,246,0.06)`,
      animation: "kpiIn 0.55s cubic-bezier(.22,.68,0,1.2) both",
      animationDelay: `${delay}ms`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -30,
        right: -30,
        width: 110,
        height: 110,
        background: `radial-gradient(circle,${accent}20 0%,transparent 70%)`,
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg,${accent}40,transparent)`,
        borderRadius: "0 0 20px 20px",
      }}
    />
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".08em",
          color: "#94A3B8",
          fontFamily: "'Inter', sans-serif",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          background: `${accent}14`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 0 4px ${accent}0A`,
        }}
      >
        <Icon size={17} color={accent} strokeWidth={2.2} />
      </div>
    </div>
    <div
      style={{
        fontSize: 36,
        fontWeight: 700,
        color: "#0F172A",
        letterSpacing: "-.03em",
        lineHeight: 1,
        marginBottom: 10,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {loading ? (
        <span style={{ fontSize: 20, color: "#CBD5E1" }}>—</span>
      ) : (
        value
      )}
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 10.5,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          background: trendUp ? "#FEF2F2" : "#ECFDF5",
          color: trendUp ? "#EF4444" : "#10B981",
          padding: "2px 8px",
          borderRadius: 6,
          fontWeight: 600,
        }}
      >
        {trendUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />} {trend}
      </span>
      <span style={{ color: "#94A3B8" }}>{sub}</span>
    </div>
  </div>
);

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
const SectionHeader = ({ title, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 3,
          height: 18,
          background: "linear-gradient(180deg,#3B82F6,#1D4ED8)",
          borderRadius: 2,
        }}
      />
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: ".06em",
          color: "#0F172A",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
    </div>
    {sub && (
      <p
        style={{
          fontSize: 10,
          color: "#94A3B8",
          marginTop: 3,
          marginLeft: 11,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: ".02em",
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

// ─── SKELETON ────────────────────────────────────────────────────────────────
const Sk = ({ h = 16, w = "100%", r = 8 }) => (
  <div
    style={{
      height: h,
      width: w,
      background: "#EEF4FF",
      borderRadius: r,
      animation: "shimmer 1.5s ease infinite",
    }}
  />
);

// ─── ERROR BANNER ────────────────────────────────────────────────────────────
const ErrorBanner = ({ msg, onRetry }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 16px",
      background: "#FEF2F2",
      border: "1px solid #FCA5A5",
      borderRadius: 12,
      marginBottom: 16,
    }}
  >
    <AlertCircle size={14} color="#EF4444" />
    <span
      style={{
        fontSize: 12,
        color: "#B91C1C",
        flex: 1,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {msg}
    </span>
    <button
      onClick={onRetry}
      style={{
        fontSize: 11,
        color: "#3B82F6",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      Retry
    </button>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const [services, setServices] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("weekly");
  const [loading, setLoading] = useState({
    services: true,
    agencies: true,
    teams: true,
  });
  const [errors, setErrors] = useState({});
  const [lastSync, setLastSync] = useState(null);
  const [selected, setSelected] = useState(null);

  // ── CATEGORY COLOR MAP ────────────────────────────────────────────────────
  const catColorMap = useMemo(() => {
    const map = { ...FORCED_COLORS };
    return map;
  }, []);

  // ── FETCHERS ──────────────────────────────────────────────────────────────
  const fetchServices = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/service/all`, {
        headers: authHdrs(),
      });
      if (data.success) setServices(data.data || []);
      setErrors((p) => ({ ...p, services: null }));
    } catch {
      setErrors((p) => ({ ...p, services: "Failed to load services." }));
    } finally {
      setLoading((p) => ({ ...p, services: false }));
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/responderTeam`, {
        headers: authHdrs(),
      });
      setTeams(Array.isArray(data) ? data : data.data || data.teams || []);
      setErrors((p) => ({ ...p, teams: null }));
    } catch {
      setErrors((p) => ({ ...p, teams: "Failed to load teams." }));
    } finally {
      setLoading((p) => ({ ...p, teams: false }));
    }
  }, []);

  const fetchAgencies = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/agency`, {
        headers: authHdrs(),
      });
      setAgencies(
        Array.isArray(data) ? data : data.data || data.agencies || [],
      );
      setErrors((p) => ({ ...p, agencies: null }));
    } catch {
      setErrors((p) => ({ ...p, agencies: "Failed to load agencies." }));
    } finally {
      setLoading((p) => ({ ...p, agencies: false }));
    }
  }, []);

  const fetchAll = useCallback(() => {
    setLastSync(new Date());
    fetchServices();
    fetchTeams();
    fetchAgencies();
  }, [fetchServices, fetchTeams, fetchAgencies]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      @keyframes kpiIn   { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:none} }
      @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
      @keyframes shimmer { 0%,100%{opacity:.7} 50%{opacity:.35} }
      @keyframes spin    { to{transform:rotate(360deg)} }
      .inc-row:hover     { background:#EFF6FF !important; border-color:#93C5FD !important; transform:translateX(4px) !important; box-shadow:0 4px 16px rgba(59,130,246,.1) !important; }
      .agency-row:hover  { background:#EFF6FF !important; border-color:#BFDBFE !important; }
      .range-btn:hover   { background:#EFF6FF !important; color:#2563EB !important; }
      .s-input:focus     { border-color:#93C5FD !important; box-shadow:0 0 0 3px rgba(59,130,246,.12) !important; outline:none !important; }
      .rfrsh-btn:hover   { background:#EFF6FF !important; color:#1D4ED8 !important; }
      .cat-pill:hover    { transform:scale(1.04) !important; }
    `;
    document.head.appendChild(style);
    fetchAll();
    const id = setInterval(fetchAll, 15000);
    return () => {
      clearInterval(id);
      document.head.removeChild(style);
    };
  }, [fetchAll]);

  // ── DERIVED ───────────────────────────────────────────────────────────────
  const isLoadingAny = Object.values(loading).some(Boolean);

  const stats = useMemo(() => {
    const total = services.length;
    const resolved = services.filter(isResolved).length;
    const resRate = total ? ((resolved / total) * 100).toFixed(1) : "0.0";
    return { total, resolved, resRate };
  }, [services]);

  const chartData = useMemo(
    () => buildTimeline(services, range),
    [services, range],
  );

  const agencyRows = useMemo(
    () =>
      agencies.slice(0, 8).map((a, i) => {
        const name = toEn(a.name) || "Unknown Agency";
        const role =
          toEn(a.agencyType?.name) || toEn(a.type) || "Response Agency";
        return {
          initials: getInitials(name),
          name,
          role,
          active: i % 4 !== 2,
          color: TEAM_COLORS[i % TEAM_COLORS.length],
        };
      }),
    [agencies],
  );

  const teamRows = useMemo(
    () =>
      teams.slice(0, 8).map((t, i) => ({
        name: toEn(t.name) || "Unknown Team",
        deployed: t.crew?.length ?? t.crewCount ?? t.activeCount ?? 0,
        total:
          t.capacity ??
          t.maxCrew ??
          Math.max(t.crew?.length ?? 0, t.crewCount ?? 0, 6),
        color: TEAM_COLORS[i % TEAM_COLORS.length],
      })),
    [teams],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = services
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);
    if (!q) return list;
    return list.filter((r) => {
      const typeStr =
        toEn(r.emergencyType?.name) || toEn(r.emergencyType) || "";
      const catStr = getCatName(r.category);
      const locStr = toEn(r.kebele?.name) || toEn(r.kebele) || r.location || "";
      const repStr = r.reporterName || "";
      return `${typeStr} ${catStr} ${locStr} ${repStr}`
        .toLowerCase()
        .includes(q);
    });
  }, [services, search]);

  const getCatMeta = (e) => {
    const key = getCatKey(e);
    const color = catColorMap[key] || "#64748B";
    return { color, bg: color + "20", Icon: ICON_MAP[key] || Radio };
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  const SlidePanel = ({ service, onClose }) => {
    const isOpen = !!service;
    useEffect(() => {
      document.body.style.overflow = isOpen ? "hidden" : "";
      return () => {
        document.body.style.overflow = "";
      };
    }, [isOpen]);

    return (
      <>
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,31,68,0.45)",
            backdropFilter: "blur(3px)",
            zIndex: 90,
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? "auto" : "none",
            transition: "opacity 0.35s cubic-bezier(.4,0,.2,1)",
          }}
        />
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "50%",
            minWidth: 480,
            background:
              "linear-gradient(160deg,#f0f6ff 0%,#e8f0fe 50%,#f4f8ff 100%)",
            zIndex: 100,
            boxShadow: "-8px 0 48px rgba(10,31,68,0.18)",
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.38s cubic-bezier(.4,0,.2,1)",
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "sticky",
              top: 12,
              left: 16,
              zIndex: 10,
              alignSelf: "flex-start",
              marginLeft: 16,
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(10px)",
              border: "1.5px solid #E4EBF5",
              borderRadius: 11,
              fontSize: 12,
              fontWeight: 600,
              color: "#2563EB",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 2px 12px rgba(37,99,235,0.1)",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#DBEAFE";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.92)";
            }}
          >
            <X size={13} /> Close Panel
          </button>
          {service && (
            <div style={{ flex: 1 }}>
              <ServiceDetailPage serviceProp={service} panelMode />
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <SlidePanel service={selected} onClose={() => setSelected(null)} />
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          background:
            "linear-gradient(160deg,#f0f6ff 0%,#e8f0fe 50%,#f4f8ff 100%)",
          minHeight: "100vh",
          padding: "28px 32px",
          color: "#0F172A",
        }}
      >
        <style>{`
        @keyframes kpiIn   { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:none} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%,100%{opacity:.7} 50%{opacity:.35} }
      `}</style>

        {/* Error banners */}
        {errors.services && (
          <ErrorBanner msg={errors.services} onRetry={fetchServices} />
        )}

        {/* ── TOP BAR ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: ".14em",
                color: "#3B82F6",
                fontFamily: "'Inter', sans-serif",
                marginBottom: 4,
                textTransform: "uppercase",
              }}
            >
              ● Live Dashboard
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#0C1A3E",
                letterSpacing: "-.02em",
                lineHeight: 1,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Service Control Center
            </h1>
            <p
              style={{
                fontSize: 12,
                color: "#94A3B8",
                marginTop: 4,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {lastSync
                ? `Last synced ${format(lastSync, "HH:mm:ss")}`
                : "Loading…"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="rfrsh-btn"
              onClick={fetchAll}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "#fff",
                border: "1.5px solid #DBEAFE",
                borderRadius: 11,
                fontSize: 11,
                color: "#3B82F6",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                transition: "all .15s",
                boxShadow: "0 2px 10px rgba(59,130,246,.08)",
              }}
            >
              <RefreshCw
                size={11}
                style={{
                  animation: isLoadingAny ? "spin 1s linear infinite" : "none",
                }}
              />
              REFRESH
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <KPICard
            label="TOTAL SERVICES"
            value={stats.total}
            sub="in database"
            trend={`${stats.total} total`}
            trendUp={false}
            accent="#3B82F6"
            icon={Activity}
            delay={0}
            loading={loading.services}
          />
          <KPICard
            label="RESOLVED"
            value={stats.resolved}
            sub="successfully closed"
            trend={`${stats.resRate}% rate`}
            trendUp={false}
            accent="#10B981"
            icon={CheckCircle2}
            delay={80}
            loading={loading.services}
          />
          <KPICard
            label="SERVICES"
            value={services.length}
            sub="tracked"
            trend={`Current`}
            trendUp={false}
            accent="#F97316"
            icon={Users}
            delay={160}
            loading={loading.services}
          />
        </div>

        {/* ── ROW 2: TIMELINE ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.7fr 1fr",
            gap: 18,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: "26px 28px",
              border: "1px solid #DBEAFE",
              boxShadow:
                "0 4px 32px rgba(59,130,246,0.07),0 1px 4px rgba(59,130,246,.04)",
              animation: "fadeUp .5s .1s ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 22,
              }}
            >
              <SectionHeader
                title="Service Timeline"
                sub="Computed from real records"
              />
              <div
                style={{
                  display: "flex",
                  background: "#F0F6FF",
                  borderRadius: 11,
                  padding: 3,
                  gap: 2,
                }}
              >
                {["daily", "weekly", "monthly"].map((r) => (
                  <button
                    key={r}
                    className="range-btn"
                    onClick={() => setRange(r)}
                    style={{
                      padding: "5px 13px",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: ".06em",
                      fontFamily: "'Inter', sans-serif",
                      textTransform: "uppercase",
                      background: range === r ? "#3B82F6" : "transparent",
                      color: range === r ? "#fff" : "#64748B",
                      boxShadow:
                        range === r ? "0 2px 8px rgba(59,130,246,.3)" : "none",
                      transition: "all .15s",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {loading.services ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 5,
                  height: 210,
                  paddingBottom: 8,
                }}
              >
                {[40, 80, 60, 120, 90, 150, 110, 180, 130, 70, 100, 160].map(
                  (h, i) => (
                    <Sk key={i} h={h} w="100%" r={4} />
                  ),
                )}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart
                  data={chartData}
                  barSize={
                    range === "monthly" ? 16 : range === "weekly" ? 34 : 18
                  }
                >
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#1D4ED8"
                        stopOpacity={0.85}
                      />
                    </linearGradient>
                    <linearGradient
                      id="barGradLast"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#F97316" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#EA580C"
                        stopOpacity={0.85}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#EDF2FF"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 11,
                      fill: "#94A3B8",
                      fontFamily: "'Inter', sans-serif",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "#94A3B8",
                      fontFamily: "'Inter', sans-serif",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={26}
                  />
                  <Tooltip
                    content={<BlueTooltip />}
                    cursor={{ fill: "rgba(59,130,246,0.05)", radius: 6 }}
                  />
                  <Bar dataKey="count" name="Services" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === chartData.length - 1
                            ? "url(#barGradLast)"
                            : "url(#barGrad)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── ROW 3: AGENCIES + TEAMS + SERVICES ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 18,
            marginBottom: 18,
          }}
        >
          {/* Agencies */}
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: "26px 28px",
              border: "1px solid #DBEAFE",
              boxShadow: "0 4px 32px rgba(59,130,246,0.07)",
              animation: "fadeUp .5s .44s ease both",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SectionHeader
              title="Agencies"
              sub={`${agencies.length} registered`}
            />
            {loading.agencies ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Sk key={i} h={44} r={12} />
                ))}
              </div>
            ) : agencyRows.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#94A3B8",
                  padding: "32px 0",
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                No agencies found.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  flex: 1,
                }}
              >
                {agencyRows.map((a, i) => (
                  <div
                    key={i}
                    className="agency-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 11px",
                      background: "#F8FAFF",
                      borderRadius: 12,
                      border: "1px solid #E8EFFE",
                      transition: "all .15s",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: `${a.color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        color: a.color,
                        flexShrink: 0,
                        border: `1.5px solid ${a.color}30`,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {a.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#0F172A",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {a.name}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#94A3B8",
                          fontFamily: "'Inter', sans-serif",
                          marginTop: 1,
                        }}
                      >
                        {a.role}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: a.active ? "#10B981" : "#F59E0B",
                        boxShadow: a.active
                          ? "0 0 0 3px rgba(16,185,129,0.2)"
                          : "0 0 0 3px rgba(245,158,11,0.2)",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Summary box */}
            <div
              style={{
                marginTop: 16,
                padding: "14px 16px",
                background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
                borderRadius: 14,
                border: "1px solid #BFDBFE",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#1D4ED8",
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: ".08em",
                  marginBottom: 10,
                  fontWeight: 600,
                }}
              >
                NETWORK SUMMARY
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {[
                  { val: agencies.length, lbl: "AGENCIES", color: "#1D4ED8" },
                  { val: teams.length, lbl: "TEAMS", color: "#0F172A" },
                  { val: services.length, lbl: "SERVICES", color: "#3B82F6" },
                  {
                    val: services.filter(isResolved).length,
                    lbl: "COMPLETED",
                    color: "#10B981",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,.7)",
                      borderRadius: 9,
                      padding: "8px 10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: s.color,
                        letterSpacing: "-.02em",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {s.val}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#94A3B8",
                        fontFamily: "'Inter', sans-serif",
                        marginTop: 1,
                      }}
                    >
                      {s.lbl}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Responder Teams */}
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: "26px 28px",
              border: "1px solid #DBEAFE",
              boxShadow: "0 4px 32px rgba(59,130,246,0.07)",
              animation: "fadeUp .5s .52s ease both",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SectionHeader
              title="Responder Teams"
              sub={`${teams.length} active teams`}
            />
            {loading.teams ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Sk key={i} h={44} r={12} />
                ))}
              </div>
            ) : teamRows.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#94A3B8",
                  padding: "32px 0",
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                No teams found.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  flex: 1,
                }}
              >
                {teamRows.map((t, i) => {
                  const deployed = t.deployed;
                  const total = t.total;
                  const pct =
                    total > 0 ? Math.round((deployed / total) * 100) : 0;
                  const loadColor =
                    pct >= 80 ? "#EF4444" : pct >= 60 ? "#F59E0B" : "#10B981";
                  const load =
                    pct >= 80 ? "Overloaded" : pct >= 60 ? "Busy" : "Available";
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 11px",
                        background: "#F8FAFF",
                        borderRadius: 12,
                        border: "1px solid #E8EFFE",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: `${t.color}18`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          color: t.color,
                          flexShrink: 0,
                          border: `1.5px solid ${t.color}30`,
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {getInitials(t.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#0F172A",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {t.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#94A3B8",
                            fontFamily: "'Inter', sans-serif",
                            marginTop: 1,
                          }}
                        >
                          {deployed}/{total} deployed
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 2,
                        }}
                      >
                        <div
                          style={{
                            height: 6,
                            width: 40,
                            background: "#EEF4FF",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: `linear-gradient(90deg,${t.color},${t.color}bb)`,
                              borderRadius: 4,
                              transition: "width .8s ease",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: 40,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9,
                              color: loadColor,
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                            }}
                          >
                            {load}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: t.color,
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Services */}
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: "26px 28px",
              border: "1px solid #DBEAFE",
              boxShadow:
                "0 4px 32px rgba(59,130,246,0.07),0 1px 4px rgba(59,130,246,.04)",
              animation: "fadeUp .5s .6s ease both",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <SectionHeader
                title="Recent Services"
                sub="Service requests and updates"
              />
              <div style={{ position: "relative" }}>
                <Search
                  size={12}
                  color="#94A3B8"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  className="s-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  style={{
                    paddingLeft: 30,
                    paddingRight: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    background: "#F0F6FF",
                    border: "1.5px solid #DBEAFE",
                    borderRadius: 11,
                    fontSize: 12,
                    color: "#0F172A",
                    fontFamily: "'Inter', sans-serif",
                    width: 160,
                    transition: "all .2s",
                  }}
                />
              </div>
            </div>

            {loading.services ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Sk key={i} h={56} r={13} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#94A3B8",
                  padding: "40px 0",
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                No services found.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  flex: 1,
                }}
              >
                {filtered.map((r) => {
                  const { color, bg, Icon } = getCatMeta(r);
                  const st =
                    STATUS_META[getStatusKey(r)] || STATUS_META.reported;

                  const typeEn =
                    toEn(r.emergencyType?.name) ||
                    toEn(r.emergencyType) ||
                    toEn(r.type) ||
                    "Service";
                  const locEn =
                    toEn(r.kebele?.name) ||
                    toEn(r.kebele) ||
                    toEn(r.location) ||
                    "Unknown location";

                  const catSlug = getCatKey(r);
                  const catLabel =
                    catSlug.charAt(0).toUpperCase() +
                    catSlug.slice(1).replace(/_/g, " ");

                  return (
                    <div
                      key={r.id || r._id}
                      className="inc-row"
                      onClick={() => setSelected(r)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "11px 13px",
                        background: "#FAFBFF",
                        border: "1.5px solid #E8EFFE",
                        borderRadius: 13,
                        cursor: "pointer",
                        transition: "all .18s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 11,
                          background: bg,
                          border: `1.5px solid ${color}30`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={16} color={color} strokeWidth={2} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 2,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0F172A",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {typeEn}
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              padding: "2px 6px",
                              borderRadius: 5,
                              background: color + "18",
                              color,
                              fontWeight: 600,
                              fontFamily: "'Inter', sans-serif",
                              flexShrink: 0,
                            }}
                          >
                            {catLabel}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#94A3B8",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {locEn}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 10,
                          color: "#CBD5E1",
                          fontFamily: "'Inter', sans-serif",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {formatDistanceToNow(new Date(r.createdAt), {
                          addSuffix: true,
                        })}
                      </div>

                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          padding: "3px 9px",
                          borderRadius: 6,
                          background: st.bg,
                          color: st.color,
                          border: `1px solid ${st.border}`,
                          letterSpacing: ".05em",
                          fontFamily: "'Inter', sans-serif",
                          flexShrink: 0,
                        }}
                      >
                        {st.label.toUpperCase()}
                      </span>

                      <ChevronRight
                        size={13}
                        color="#CBD5E1"
                        style={{ flexShrink: 0 }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
