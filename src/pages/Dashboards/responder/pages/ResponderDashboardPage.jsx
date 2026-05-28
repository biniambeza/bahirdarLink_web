import React, { useState, useEffect, useMemo, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
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
  Bell,
  Plus,
  Zap,
  FolderLock,
  Target,
  Award,
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

const BASE_URL = "https://bahirlink-backend-1.onrender.com";

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

const toEn = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith("{") || trimmed.startsWith("[")) &&
      trimmed.includes('"en"')
    ) {
      try {
        return toEn(JSON.parse(trimmed));
      } catch {
        return value;
      }
    }
    return value;
  }
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

// ── Every category that isn't in FORCED_COLORS gets a unique palette colour ──
function buildCategoryPie(emergencies, catColorMap) {
  const counts = {};
  emergencies.forEach((e) => {
    const k = getCatKey(e);
    counts[k] = (counts[k] || 0) + 1;
  });

  // Collect which palette colours are already taken by FORCED_COLORS
  const usedColors = new Set(Object.values(FORCED_COLORS));
  // Build a pool of unused palette colours for unknown categories
  const unusedPool = DEFAULT_PALETTE.filter((c) => !usedColors.has(c));
  let poolIdx = 0;

  return Object.entries(counts).map(([key, value]) => {
    let color;
    if (catColorMap[key]) {
      color = catColorMap[key];
    } else {
      // Assign the next unused palette colour; cycle if we run out
      color = unusedPool[poolIdx % unusedPool.length];
      poolIdx++;
      // Cache it so the legend stays consistent
      catColorMap[key] = color;
    }
    return {
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      value,
      color,
      key,
    };
  });
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

const ResponderDashboardPage = () => {
  // --- STATE ---
  const [incidents, setIncidents] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isServiceMode, setIsServiceMode] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("weekly");
  const [errors, setErrors] = useState({});
  const [lastSync, setLastSync] = useState(null);

  // --- DATA FETCHING ---
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const decoded = jwtDecode(token);
      const responderTeamId = decoded.id;
      setTeamId(responderTeamId);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const teamRes = await axios.get(
        `${BASE_URL}/api/responderTeam/${responderTeamId}`,
        config,
      );
      const teamData = teamRes.data?.data || teamRes.data;
      const agencyId = teamData.agencyId;

      const agencyRes = await axios.get(
        `${BASE_URL}/api/agency/${agencyId}`,
        config,
      );
      const agency = agencyRes.data?.data || agencyRes.data;
      setAgencyInfo(agency);

      const agencyName = (agency?.name || "").toLowerCase();
      const serviceKeywords = ["municipal", "electric", "water", "health"];
      const localIsService = serviceKeywords.some((kw) =>
        agencyName.includes(kw),
      );
      setIsServiceMode(localIsService);

      const incidentEndpoint = localIsService
        ? `${BASE_URL}/api/service/responder-team/${responderTeamId}`
        : `${BASE_URL}/api/emergencies/responder-team/${responderTeamId}`;

      const requests = [axios.get(incidentEndpoint, config)];
      if (!localIsService) {
        requests.push(axios.get(`${BASE_URL}/api/cases/team/all`, config));
      }

      const responses = await Promise.all(requests);
      setIncidents(responses[0].data?.data || responses[0].data || []);

      if (!localIsService && responses[1]) {
        setCases(responses[1].data?.data || responses[1].data || []);
      }
      setErrors({});
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
      setErrors({ data: "Failed to load dashboard data." });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(() => {
    setLastSync(new Date());
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      @keyframes kpiIn   { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:none} }
      @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
      @keyframes shimmer { 0%,100%{opacity:.7} 50%{opacity:.35} }
      @keyframes spin    { to{transform:rotate(360deg)} }
      .inc-row:hover     { background:#EFF6FF !important; border-color:#93C5FD !important; transform:translateX(4px) !important; box-shadow:0 4px 16px rgba(59,130,246,.1) !important; }
      .range-btn:hover   { background:#EFF6FF !important; color:#2563EB !important; }
      .s-input:focus     { border-color:#93C5FD !important; box-shadow:0 0 0 3px rgba(59,130,246,.12) !important; outline:none !important; }
      .rfrsh-btn:hover   { background:#EFF6FF !important; color:#1D4ED8 !important; }
    `;
    document.head.appendChild(style);
    fetchAll();
    const id = setInterval(fetchAll, 15000);
    return () => {
      clearInterval(id);
      document.head.removeChild(style);
    };
  }, [fetchAll]);

  // ── CATEGORY COLOR MAP ────────────────────────────────────────────────────
  // Mutable ref-like object so buildCategoryPie can cache new colours into it
  const catColorMap = useMemo(() => {
    return { ...FORCED_COLORS };
  }, []);

  // --- DATA PROCESSING ---
  const {
    incidentChart,
    caseChart,
    dynamicStats,
    performance,
    chartData,
    catPie,
    filteredIncidents,
  } = useMemo(() => {
    const iCounts = {
      reported: incidents.filter((i) =>
        ["reported", "pending", "open"].includes(i.status?.toLowerCase()),
      ).length,
      active: incidents.filter((i) =>
        ["in_progress", "active", "dispatched"].includes(
          i.status?.toLowerCase(),
        ),
      ).length,
      resolved: incidents.filter((i) =>
        ["resolved", "closed", "completed"].includes(i.status?.toLowerCase()),
      ).length,
    };

    const cCounts = {
      open: cases.filter((c) => c.status?.toLowerCase() === "open").length,
      pending: cases.filter((c) => c.status?.toLowerCase() === "pending")
        .length,
      closed: cases.filter((c) => c.status?.toLowerCase() === "closed").length,
    };

    const totalResolved =
      iCounts.resolved + (isServiceMode ? 0 : cCounts.closed);
    const totalItems = incidents.length + (isServiceMode ? 0 : cases.length);
    const successRate =
      totalItems > 0 ? Math.round((totalResolved / totalItems) * 100) : 0;

    const stats = [
      {
        title: isServiceMode ? "Active Tasks" : "Live Incidents",
        value: incidents.length,
        icon: Activity,
        accent: isServiceMode ? "#10B981" : "#EF4444",
        sub: "assigned to team",
      },
      ...(!isServiceMode
        ? [
            {
              title: "Total Cases",
              value: cases.length,
              icon: FolderLock,
              accent: "#3B82F6",
              sub: "managed cases",
            },
          ]
        : []),
      {
        title: isServiceMode ? "In Field" : "Field Load",
        value: iCounts.active + (isServiceMode ? 0 : cCounts.pending),
        icon: Zap,
        accent: "#F59E0B",
        sub: "currently active",
      },
      {
        title: "Resolved",
        value: totalResolved,
        icon: CheckCircle2,
        accent: "#10B981",
        sub: "successfully closed",
      },
    ];

    const incChart = [
      {
        name: "New",
        value: iCounts.reported,
        color: isServiceMode ? "#10b981" : "#e11d48",
      },
      { name: "Active", value: iCounts.active, color: "#f59e0b" },
      {
        name: "Resolved",
        value: iCounts.resolved,
        color: isServiceMode ? "#059669" : "#10b981",
      },
    ];

    const casChart = [
      { name: "Open", value: cCounts.open, color: "#3b82f6" },
      { name: "Pending", value: cCounts.pending, color: "#8b5cf6" },
      { name: "Closed", value: cCounts.closed, color: "#64748b" },
    ];

    const timeline = buildTimeline(incidents, range);
    // Pass catColorMap so unknown categories receive unique colours
    const pie = buildCategoryPie(incidents, catColorMap);

    const q = search.toLowerCase();
    const filtered = incidents
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);
    const filteredInc = q
      ? filtered.filter((r) => {
          const typeStr =
            toEn(r.emergencyType?.name) || toEn(r.emergencyType) || "";
          const catStr = getCatName(r.category);
          const locStr =
            toEn(r.kebele?.name) || toEn(r.kebele) || r.location || "";
          const repStr = r.reporterName || "";
          return `${typeStr} ${catStr} ${locStr} ${repStr}`
            .toLowerCase()
            .includes(q);
        })
      : filtered;

    return {
      incidentChart: incChart,
      caseChart: casChart,
      dynamicStats: stats,
      performance: {
        successRate,
        iRate:
          incidents.length > 0
            ? Math.round((iCounts.resolved / incidents.length) * 100)
            : 0,
        cRate:
          cases.length > 0
            ? Math.round((cCounts.closed / cases.length) * 100)
            : 0,
        label:
          successRate > 75
            ? "Elite"
            : successRate > 40
              ? "Steady"
              : "High Load",
      },
      chartData: timeline,
      catPie: pie,
      filteredIncidents: filteredInc,
    };
  }, [incidents, cases, isServiceMode, range, search, catColorMap]);

  const getCatMeta = (e) => {
    const key = getCatKey(e);
    const color = catColorMap[key] || "#64748B";
    return { color, bg: color + "20", Icon: ICON_MAP[key] || Radio };
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(160deg,#f0f6ff 0%,#e8f0fe 50%,#f4f8ff 100%)",
          gap: 16,
        }}
      >
        <RefreshCw
          style={{ animation: "spin 1s linear infinite" }}
          size={40}
          color="#3B82F6"
        />
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".15em",
            color: "#64748B",
            fontFamily: "'Inter', sans-serif",
            textTransform: "uppercase",
          }}
        >
          Syncing HQ Data...
        </p>
      </div>
    );

  const themeHex = isServiceMode ? "#10b981" : "#2563eb";

  return (
    <>
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
        {errors.data && <ErrorBanner msg={errors.data} onRetry={fetchAll} />}

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
              Responder Control Center
            </h1>
            <p
              style={{
                fontSize: 12,
                color: "#94A3B8",
                marginTop: 4,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {toEn(agencyInfo?.name) || "Unit Dispatch"} | ID:{" "}
              {teamId ? String(teamId).slice(-6) : "GLOBAL"} |{" "}
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
                  animation: loading ? "spin 1s linear infinite" : "none",
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
            gridTemplateColumns: `repeat(${dynamicStats.length},1fr)`,
            gap: 16,
            marginBottom: 24,
          }}
        >
          {dynamicStats.map((stat, i) => (
            <KPICard
              key={i}
              label={stat.title.toUpperCase()}
              value={stat.value}
              sub={stat.sub}
              trend={`${stat.value} total`}
              trendUp={false}
              accent={stat.accent}
              icon={stat.icon}
              delay={i * 80}
              loading={loading}
            />
          ))}
        </div>

        {/* ── ROW 2: TIMELINE + DONUT ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.7fr 1fr",
            gap: 18,
            marginBottom: 18,
          }}
        >
          {/* Timeline */}
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
                title="Incident Timeline"
                sub="Assigned to your team"
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

            {loading ? (
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
                  <Bar dataKey="count" name="Incidents" radius={[6, 6, 0, 0]}>
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

          {/* Category Donut */}
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: "26px 28px",
              border: "1px solid #DBEAFE",
              boxShadow:
                "0 4px 32px rgba(59,130,246,0.07),0 1px 4px rgba(59,130,246,.04)",
              animation: "fadeUp .5s .2s ease both",
            }}
          >
            <SectionHeader
              title="By Category"
              sub={`${catPie.length} categories`}
            />
            {loading ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <Sk h={150} r={14} />
                {[1, 2, 3, 4].map((i) => (
                  <Sk key={i} h={14} />
                ))}
              </div>
            ) : catPie.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#94A3B8",
                  paddingTop: 60,
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                No data yet.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={catPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={3}
                      stroke="#fff"
                    >
                      {catPie.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<BlueTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
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
                              width: 9,
                              height: 9,
                              borderRadius: 3,
                              background: c.color,
                              boxShadow: `0 0 0 2px ${c.color}30`,
                              flexShrink: 0,
                            }}
                          />
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 6,
                              background: c.color + "20",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon size={10} color={c.color} />
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#475569",
                              fontWeight: 500,
                              fontFamily: "'Inter', sans-serif",
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
                              width: 44,
                              height: 5,
                              borderRadius: 3,
                              background: "#EEF4FF",
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
                              fontFamily: "'Inter', sans-serif",
                              minWidth: 18,
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

        {/* ── ROW 3: INCIDENTS + PERFORMANCE ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.55fr 1fr",
            gap: 18,
          }}
        >
          {/* Recent Incidents */}
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: "26px 28px",
              border: "1px solid #DBEAFE",
              boxShadow:
                "0 4px 32px rgba(59,130,246,0.07),0 1px 4px rgba(59,130,246,.04)",
              animation: "fadeUp .5s .28s ease both",
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
                title="Recent Incidents"
                sub="Assigned to your team"
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
                  placeholder="Search incidents…"
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

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Sk key={i} h={56} r={13} />
                ))}
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#94A3B8",
                  padding: "40px 0",
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                No incidents found.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {filteredIncidents.map((r) => {
                  const catName = toEn(r.category) || "Other";
                  const catSlug = catName
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "_");
                  const catLabel =
                    catName.charAt(0).toUpperCase() + catName.slice(1);
                  const { color, bg, Icon } = getCatMeta(catSlug);
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

                  return (
                    <div
                      key={r.id || r._id}
                      className="inc-row"
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

          {/* Performance */}
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: "26px 28px",
              border: "1px solid #DBEAFE",
              boxShadow: "0 4px 32px rgba(59,130,246,0.07)",
              animation: "fadeUp .5s .36s ease both",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SectionHeader title="Performance" sub="Your team's metrics" />
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 20,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 700,
                    color: themeHex,
                    letterSpacing: "-.03em",
                    lineHeight: 1,
                    marginBottom: 10,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {performance.successRate}%
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "#94A3B8",
                    marginTop: 3,
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: ".02em",
                  }}
                >
                  Overall Efficiency
                </p>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: "#475569",
                        fontWeight: 500,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Incident Resolution
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: themeHex,
                        fontWeight: 700,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {performance.iRate}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "#EEF4FF",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${performance.iRate}%`,
                        height: "100%",
                        background: `linear-gradient(90deg,${themeHex},${themeHex}bb)`,
                        borderRadius: 4,
                        transition: "width .8s ease",
                      }}
                    />
                  </div>
                </div>
                {!isServiceMode && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "#475569",
                          fontWeight: 500,
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        Case Closure
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: themeHex,
                          fontWeight: 700,
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {performance.cRate}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "#EEF4FF",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${performance.cRate}%`,
                          height: "100%",
                          background: `linear-gradient(90deg,${themeHex},${themeHex}bb)`,
                          borderRadius: 4,
                          transition: "width .8s ease",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Internal Components
const ProgressItem = ({ label, val, color }) => (
  <div className="w-full">
    <div className="flex justify-between mb-2">
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
        {label}
      </span>
      <span className="text-[10px] font-black text-slate-900">{val}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-1000`}
        style={{ width: `${val}%` }}
      />
    </div>
  </div>
);

const SummaryCard = ({ label, val, color, sub }) => (
  <div className="text-center p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col justify-center items-center flex-grow transition-all">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
      {label}
    </p>
    <h4 className={`text-4xl font-black ${color}`}>{val}</h4>
    <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">
      {sub}
    </p>
  </div>
);

export default ResponderDashboardPage;
