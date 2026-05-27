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
import IncidentDetailPage from "./IncidentDetail";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://bahirlink-backend-1.onrender.com";

const API = `${API_BASE}/api`;
const getToken = () => localStorage.getItem("token");
const authHdrs = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const DEFAULT_PALETTE = [
  "#3B82F6",
  "#6366F1",
  "#EF4444",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#F97316",
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
  "#3B82F6",
  "#EF4444",
  "#6366F1",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#F97316",
  "#8B5CF6",
];

const STATUS_META = {
  reported: {
    label: "Reported",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  in_progress: {
    label: "In Progress",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  resolved: {
    label: "Resolved",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  escalated: {
    label: "Escalated",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
  pending: {
    label: "Reported",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  active: {
    label: "Reported",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  responding: {
    label: "In Progress",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
};

// ─── NAME HELPERS ────────────────────────────────────────────────────────────
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
function buildTimeline(emergencies, range) {
  const now = new Date();
  if (range === "daily") {
    return Array.from({ length: 12 }, (_, i) => {
      const h = i * 2;
      const label = `${String(h).padStart(2, "0")}:00`;
      const count = emergencies.filter((e) => {
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
      const count = emergencies.filter(
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
    const count = emergencies.filter((e) => {
      const d = new Date(e.createdAt);
      return (
        d.getFullYear() === month.getFullYear() &&
        d.getMonth() === month.getMonth()
      );
    }).length;
    return { label, count };
  });
}

function buildCategoryPie(emergencies, catColorMap) {
  const counts = {};
  emergencies.forEach((e) => {
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
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        fontSize: 12,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}
    >
      <p
        style={{
          color: "#64748B",
          fontWeight: 600,
          marginBottom: 4,
          fontSize: 11,
        }}
      >
        {label}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: "#0F172A", fontWeight: 700 }}>
          {p.name || "Count"}:{" "}
          <span style={{ color: p.color || "#3B82F6" }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── SKELETON ────────────────────────────────────────────────────────────────
const Sk = ({ h = 16, w = "100%", r = 8 }) => (
  <div
    style={{
      height: h,
      width: w,
      background: "#F1F5F9",
      borderRadius: r,
      animation: "shimmer 1.6s ease infinite",
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
      border: "1px solid #FECACA",
      borderRadius: 10,
      marginBottom: 14,
    }}
  >
    <AlertCircle size={14} color="#EF4444" />
    <span
      style={{
        fontSize: 12,
        color: "#B91C1C",
        flex: 1,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
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
        fontWeight: 700,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}
    >
      Retry
    </button>
  </div>
);

// ─── SLIDE PANEL ─────────────────────────────────────────────────────────────
const SlidePanel = ({ incident, onClose }) => {
  const isOpen = !!incident;
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
          background: "rgba(2,8,23,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 90,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
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
          background: "#fff",
          zIndex: 100,
          boxShadow: "-12px 0 48px rgba(0,0,0,0.12)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "sticky",
            top: 16,
            left: 16,
            zIndex: 10,
            alignSelf: "flex-start",
            margin: "16px 0 0 16px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            color: "#475569",
            cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F1F5F9";
            e.currentTarget.style.color = "#0F172A";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#F8FAFC";
            e.currentTarget.style.color = "#475569";
          }}
        >
          <X size={13} /> Close Panel
        </button>
        {incident && (
          <div style={{ flex: 1 }}>
            <IncidentDetailPage incidentProp={incident} panelMode />
          </div>
        )}
      </div>
    </>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
const DashboardMain = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [teams, setTeams] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("weekly");
  const [loading, setLoading] = useState({
    emergencies: true,
    teams: true,
    agencies: true,
    categories: true,
  });
  const [errors, setErrors] = useState({});
  const [lastSync, setLastSync] = useState(null);
  const [selected, setSelected] = useState(null);

  const catColorMap = useMemo(() => {
    if (categories.length === 0) return { ...FORCED_COLORS };
    const map = {},
      used = new Set(Object.values(FORCED_COLORS));
    let pi = 0;
    categories.forEach((cat) => {
      const enName = getCatName(cat);
      const key = enName.toLowerCase().trim().replace(/\s+/g, "_");
      if (FORCED_COLORS[key]) {
        map[key] = FORCED_COLORS[key];
      } else if (cat.color && !used.has(cat.color)) {
        map[key] = cat.color;
        used.add(cat.color);
      } else {
        while (pi < DEFAULT_PALETTE.length && used.has(DEFAULT_PALETTE[pi]))
          pi++;
        const c = DEFAULT_PALETTE[pi % DEFAULT_PALETTE.length] || "#94A3B8";
        map[key] = c;
        used.add(c);
        pi++;
      }
    });
    if (!map.other) map.other = "#94A3B8";
    return map;
  }, [categories]);

  const fetchEmergencies = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/emergencies/admin/all`, {
        headers: authHdrs(),
      });
      if (data.success) setEmergencies(data.data || []);
      setErrors((p) => ({ ...p, emergencies: null }));
    } catch {
      setErrors((p) => ({ ...p, emergencies: "Failed to load emergencies." }));
    } finally {
      setLoading((p) => ({ ...p, emergencies: false }));
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

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/categories`, {
        headers: authHdrs(),
      });
      setCategories(
        Array.isArray(data) ? data : data.data || data.categories || [],
      );
      setErrors((p) => ({ ...p, categories: null }));
    } catch {
      setErrors((p) => ({ ...p, categories: "Using default categories." }));
    } finally {
      setLoading((p) => ({ ...p, categories: false }));
    }
  }, []);

  const fetchAll = useCallback(() => {
    setLastSync(new Date());
    fetchEmergencies();
    fetchTeams();
    fetchAgencies();
    fetchCategories();
  }, [fetchEmergencies, fetchTeams, fetchAgencies, fetchCategories]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 15000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const isLoadingAny = Object.values(loading).some(Boolean);

  const stats = useMemo(() => {
    const total = emergencies.length;
    const resolved = emergencies.filter(isResolved).length;
    const resRate = total ? ((resolved / total) * 100).toFixed(1) : "0.0";
    return { total, resolved, resRate };
  }, [emergencies]);

  const catPie = useMemo(
    () => buildCategoryPie(emergencies, catColorMap),
    [emergencies, catColorMap],
  );
  const chartData = useMemo(
    () => buildTimeline(emergencies, range),
    [emergencies, range],
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
    const list = emergencies
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
  }, [emergencies, search]);

  const getCatMeta = (e) => {
    const key = getCatKey(e);
    const color = catColorMap[key] || "#64748B";
    return { color, bg: color + "18", Icon: ICON_MAP[key] || Radio };
  };

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    @keyframes kpiIn    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
    @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
    @keyframes shimmer  { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    .inc-row:hover      { background:#F8FAFF !important; border-color:#C7D7FD !important; }
    .range-btn:hover    { background:#EFF6FF !important; color:#1D4ED8 !important; }
    .s-input:focus      { border-color:#93C5FD !important; box-shadow:0 0 0 3px rgba(59,130,246,0.1) !important; outline:none !important; }
    .rfrsh-btn:hover    { background:#EFF6FF !important; }
    .cat-pill:hover     { opacity:0.85 !important; }
    .team-row:hover     { background:#F8FAFF !important; }
    .agency-row:hover   { background:#F8FAFF !important; }
  `;

  const F = "'Plus Jakarta Sans', sans-serif";
  const FM = "'JetBrains Mono', monospace";

  return (
    <>
      <style>{globalStyles}</style>
      <SlidePanel incident={selected} onClose={() => setSelected(null)} />

      <div
        style={{
          fontFamily: F,
          background: "#F8FAFC",
          minHeight: "100vh",
          padding: "24px 28px",
          color: "#0F172A",
        }}
      >
        {errors.emergencies && (
          <ErrorBanner msg={errors.emergencies} onRetry={fetchEmergencies} />
        )}
        {errors.teams && (
          <ErrorBanner msg={errors.teams} onRetry={fetchTeams} />
        )}
        {errors.agencies && (
          <ErrorBanner msg={errors.agencies} onRetry={fetchAgencies} />
        )}

        {/* ── TOP BAR ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22C55E",
                  boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#64748B",
                  fontFamily: FM,
                  letterSpacing: ".06em",
                }}
              >
                LIVE DASHBOARD
              </span>
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-.03em",
                lineHeight: 1.2,
              }}
            >
              Emergency Control Center
            </h1>
            <p
              style={{
                fontSize: 11,
                color: "#94A3B8",
                marginTop: 4,
                fontFamily: FM,
              }}
            >
              {lastSync
                ? `Synced at ${format(lastSync, "HH:mm:ss")}`
                : "Loading…"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!loading.categories && categories.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  maxWidth: 420,
                  justifyContent: "flex-end",
                }}
              >
                {categories.slice(0, 8).map((cat, i) => {
                  const catNameEn = getCatName(cat);
                  const key = catNameEn
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "_");
                  const color =
                    catColorMap[key] ||
                    DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
                  const Icon = ICON_MAP[key] || Radio;
                  return (
                    <div
                      key={cat.id || cat._id || i}
                      className="cat-pill"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 10px",
                        background: color + "12",
                        border: `1px solid ${color}30`,
                        borderRadius: 6,
                        fontSize: 10,
                        color,
                        fontWeight: 700,
                        fontFamily: FM,
                        transition: "all .15s",
                        cursor: "default",
                        letterSpacing: ".04em",
                      }}
                    >
                      <Icon size={9} color={color} />
                      {catNameEn}
                    </div>
                  );
                })}
              </div>
            )}
            <button
              className="rfrsh-btn"
              onClick={fetchAll}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                fontSize: 11,
                color: "#475569",
                cursor: "pointer",
                fontFamily: FM,
                fontWeight: 600,
                transition: "all .15s",
                letterSpacing: ".05em",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <RefreshCw
                size={12}
                style={{
                  animation: isLoadingAny ? "spin 1s linear infinite" : "none",
                }}
              />
              REFRESH
            </button>
          </div>
        </div>

        {/* ── KPI ROW ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "TOTAL INCIDENTS",
              value: stats.total,
              sub: "in database",
              trend: `${stats.total} total`,
              up: false,
              accent: "#3B82F6",
              icon: Activity,
              delay: 0,
              load: loading.emergencies,
            },
            {
              label: "RESOLVED",
              value: stats.resolved,
              sub: "closed",
              trend: `${stats.resRate}% rate`,
              up: false,
              accent: "#10B981",
              icon: CheckCircle2,
              delay: 60,
              load: loading.emergencies,
            },
            {
              label: "RESPONDER TEAMS",
              value: teams.length,
              sub: "registered",
              trend: `${teamRows.filter((t) => t.deployed > 0).length} active`,
              up: false,
              accent: "#6366F1",
              icon: Shield,
              delay: 120,
              load: loading.teams,
            },
            {
              label: "AGENCIES",
              value: agencies.length,
              sub: "registered",
              trend: `${agencyRows.filter((a) => a.active).length} on duty`,
              up: false,
              accent: "#F97316",
              icon: Users,
              delay: 180,
              load: loading.agencies,
            },
          ].map(
            ({
              label,
              value,
              sub,
              trend,
              up,
              accent,
              icon: Icon,
              delay,
              load,
            }) => (
              <div
                key={label}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "20px 22px",
                  border: "1px solid #E2E8F0",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
                  animation: `kpiIn 0.5s ${delay}ms ease both`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 80,
                    height: 80,
                    background: `radial-gradient(circle at top right, ${accent}0F 0%, transparent 70%)`,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".12em",
                      color: "#94A3B8",
                      fontFamily: FM,
                    }}
                  >
                    {label}
                  </span>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: `${accent}12`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={16} color={accent} strokeWidth={2} />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 800,
                    color: "#0F172A",
                    letterSpacing: "-.04em",
                    lineHeight: 1,
                    marginBottom: 10,
                  }}
                >
                  {load ? (
                    <span style={{ fontSize: 18, color: "#CBD5E1" }}>—</span>
                  ) : (
                    value
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 10,
                    fontFamily: FM,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      background: up ? "#FEF2F2" : "#F0FDF4",
                      color: up ? "#DC2626" : "#16A34A",
                      padding: "2px 7px",
                      borderRadius: 5,
                      fontWeight: 700,
                    }}
                  >
                    {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}{" "}
                    {trend}
                  </span>
                  <span style={{ color: "#94A3B8" }}>{sub}</span>
                </div>
              </div>
            ),
          )}
        </div>

        {/* ── ROW 2: TIMELINE + DONUT ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.7fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* Timeline */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px 26px",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
              animation: "fadeUp .45s .1s ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 3,
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 16,
                      background: "#3B82F6",
                      borderRadius: 2,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#0F172A",
                      letterSpacing: ".04em",
                    }}
                  >
                    INCIDENT TIMELINE
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "#94A3B8",
                    marginLeft: 10,
                    fontFamily: FM,
                  }}
                >
                  Computed from real records
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  background: "#F1F5F9",
                  borderRadius: 8,
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
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      fontFamily: FM,
                      textTransform: "uppercase",
                      background: range === r ? "#3B82F6" : "transparent",
                      color: range === r ? "#fff" : "#64748B",
                      boxShadow:
                        range === r ? "0 1px 4px rgba(59,130,246,.3)" : "none",
                      transition: "all .15s",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {loading.emergencies ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 4,
                  height: 200,
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
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={chartData}
                  barSize={
                    range === "monthly" ? 18 : range === "weekly" ? 36 : 20
                  }
                >
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke="#F1F5F9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: FM }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: FM }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "rgba(59,130,246,0.04)", radius: 6 }}
                  />
                  <Bar dataKey="count" name="Incidents" radius={[5, 5, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === chartData.length - 1 ? "#F97316" : "#3B82F6"
                        }
                        opacity={i === chartData.length - 1 ? 1 : 0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category Donut */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px 26px",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
              animation: "fadeUp .45s .2s ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 16,
                  background: "#6366F1",
                  borderRadius: 2,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0F172A",
                  letterSpacing: ".04em",
                }}
              >
                BY CATEGORY
              </span>
            </div>
            <p
              style={{
                fontSize: 11,
                color: "#94A3B8",
                marginLeft: 10,
                marginBottom: 16,
                fontFamily: FM,
              }}
            >
              {categories.length} categories
            </p>

            {loading.emergencies || loading.categories ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <Sk h={140} r={12} />
                {[1, 2, 3, 4].map((i) => (
                  <Sk key={i} h={12} />
                ))}
              </div>
            ) : catPie.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#94A3B8",
                  paddingTop: 60,
                  fontSize: 12,
                  fontFamily: F,
                }}
              >
                No data yet.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={catPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={3}
                      stroke="#fff"
                    >
                      {catPie.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                    marginTop: 6,
                  }}
                >
                  {catPie.map((c, i) => {
                    const Icon = ICON_MAP[c.key] || Radio;
                    const pct = Math.round(
                      (c.value / Math.max(...catPie.map((x) => x.value))) * 100,
                    );
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 2,
                              background: c.color,
                              flexShrink: 0,
                            }}
                          />
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 5,
                              background: c.color + "18",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon size={9} color={c.color} />
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#475569",
                              fontWeight: 600,
                            }}
                          >
                            {c.name}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 4,
                              borderRadius: 3,
                              background: "#F1F5F9",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: c.color,
                                borderRadius: 3,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: c.color,
                              fontFamily: FM,
                              minWidth: 16,
                              textAlign: "right",
                            }}
                          >
                            {c.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── ROW 3: INCIDENTS + TEAMS + AGENCIES ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.55fr 1fr 0.85fr",
            gap: 16,
          }}
        >
          {/* Recent Incidents */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px 26px",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
              animation: "fadeUp .45s .25s ease both",
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
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 3,
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      height: 16,
                      background: "#EF4444",
                      borderRadius: 2,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#0F172A",
                      letterSpacing: ".04em",
                    }}
                  >
                    RECENT INCIDENTS
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "#94A3B8",
                    marginLeft: 10,
                    fontFamily: FM,
                  }}
                >
                  Click a row to view details
                </p>
              </div>
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
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#0F172A",
                    fontFamily: FM,
                    width: 160,
                    transition: "all .2s",
                  }}
                />
              </div>
            </div>

            {loading.emergencies ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Sk key={i} h={54} r={10} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#94A3B8",
                  padding: "40px 0",
                  fontSize: 13,
                }}
              >
                No incidents found.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filtered.map((r) => {
                  const { color, bg, Icon } = getCatMeta(r);
                  const st =
                    STATUS_META[getStatusKey(r)] || STATUS_META.reported;
                  const typeEn =
                    toEn(r.emergencyType?.name) ||
                    toEn(r.emergencyType) ||
                    toEn(r.type) ||
                    "Emergency";
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
                        gap: 11,
                        padding: "11px 13px",
                        background: "#FAFBFF",
                        border: "1px solid #E8EFFE",
                        borderRadius: 11,
                        cursor: "pointer",
                        transition: "all .15s",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: bg,
                          border: `1px solid ${color}28`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={15} color={color} strokeWidth={2} />
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
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#0F172A",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {typeEn}
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: color + "14",
                              color,
                              fontWeight: 700,
                              fontFamily: FM,
                              flexShrink: 0,
                            }}
                          >
                            {catLabel}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 10.5,
                            color: "#94A3B8",
                            fontFamily: FM,
                          }}
                        >
                          {locEn}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#CBD5E1",
                          fontFamily: FM,
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
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 5,
                          background: st.bg,
                          color: st.color,
                          border: `1px solid ${st.border}`,
                          letterSpacing: ".06em",
                          fontFamily: FM,
                          flexShrink: 0,
                        }}
                      >
                        {st.label.toUpperCase()}
                      </span>
                      <ChevronRight
                        size={12}
                        color="#CBD5E1"
                        style={{ flexShrink: 0 }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Responder Teams */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px 26px",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
              animation: "fadeUp .45s .32s ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 16,
                  background: "#6366F1",
                  borderRadius: 2,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0F172A",
                  letterSpacing: ".04em",
                }}
              >
                RESPONDER TEAMS
              </span>
            </div>
            <p
              style={{
                fontSize: 11,
                color: "#94A3B8",
                marginLeft: 10,
                marginBottom: 18,
                fontFamily: FM,
              }}
            >
              {teams.length} teams total
            </p>

            {loading.teams ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <Sk key={i} h={36} r={8} />
                ))}
              </div>
            ) : teamRows.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#94A3B8",
                  padding: "32px 0",
                  fontSize: 12,
                }}
              >
                No teams registered.
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {teamRows.map((t, i) => {
                  const pct =
                    t.total > 0
                      ? Math.min(100, Math.round((t.deployed / t.total) * 100))
                      : 0;
                  const load = pct >= 75 ? "HIGH" : pct >= 40 ? "MOD" : "FREE";
                  const loadColor =
                    pct >= 75 ? "#EF4444" : pct >= 40 ? "#F59E0B" : "#10B981";
                  return (
                    <div
                      key={i}
                      className="team-row"
                      style={{
                        padding: "9px 10px",
                        borderRadius: 10,
                        transition: "background .15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 7,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 7,
                              background: t.color + "14",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Shield
                              size={11}
                              color={t.color}
                              strokeWidth={2.5}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#1E293B",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 110,
                            }}
                          >
                            {t.name}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            color: "#94A3B8",
                            fontFamily: FM,
                          }}
                        >
                          {t.deployed}/{t.total}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 5,
                          background: "#F1F5F9",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: t.color,
                            borderRadius: 3,
                            transition: "width .8s ease",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 9,
                            color: loadColor,
                            fontFamily: FM,
                            fontWeight: 700,
                          }}
                        >
                          {load}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: t.color,
                            fontFamily: FM,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Agencies */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px 26px",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
              animation: "fadeUp .45s .4s ease both",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 16,
                  background: "#F97316",
                  borderRadius: 2,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0F172A",
                  letterSpacing: ".04em",
                }}
              >
                AGENCIES
              </span>
            </div>
            <p
              style={{
                fontSize: 11,
                color: "#94A3B8",
                marginLeft: 10,
                marginBottom: 16,
                fontFamily: FM,
              }}
            >
              {agencies.length} registered
            </p>

            {loading.agencies ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Sk key={i} h={42} r={10} />
                ))}
              </div>
            ) : agencyRows.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#94A3B8",
                  padding: "32px 0",
                  fontSize: 12,
                }}
              >
                No agencies found.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
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
                      padding: "9px 10px",
                      background: "#F8FAFC",
                      borderRadius: 10,
                      border: "1px solid #E2E8F0",
                      transition: "all .15s",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: `${a.color}14`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 800,
                        color: a.color,
                        flexShrink: 0,
                        border: `1.5px solid ${a.color}28`,
                      }}
                    >
                      {a.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: "#0F172A",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {a.name}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#94A3B8",
                          fontFamily: FM,
                          marginTop: 1,
                        }}
                      >
                        {a.role}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: a.active ? "#22C55E" : "#F59E0B",
                        boxShadow: a.active
                          ? "0 0 0 3px rgba(34,197,94,0.18)"
                          : "0 0 0 3px rgba(245,158,11,0.18)",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                marginTop: 14,
                padding: "14px 15px",
                background: "#F8FAFC",
                borderRadius: 12,
                border: "1px solid #E2E8F0",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#64748B",
                  fontFamily: FM,
                  letterSpacing: ".1em",
                  marginBottom: 10,
                  fontWeight: 700,
                }}
              >
                NETWORK SUMMARY
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 7,
                }}
              >
                {[
                  { val: agencies.length, lbl: "Agencies", color: "#3B82F6" },
                  { val: teams.length, lbl: "Teams", color: "#6366F1" },
                  { val: stats.total, lbl: "Incidents", color: "#EF4444" },
                  { val: stats.resolved, lbl: "Resolved", color: "#10B981" },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      borderRadius: 8,
                      padding: "8px 10px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: s.color,
                        letterSpacing: "-.03em",
                        lineHeight: 1,
                      }}
                    >
                      {s.val}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94A3B8",
                        fontFamily: FM,
                        marginTop: 3,
                      }}
                    >
                      {s.lbl}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardMain;
