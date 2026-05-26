import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { formatDistanceToNow, format } from "date-fns";
import {
  AlertTriangle,
  Car,
  Clock,
  CheckCircle2,
  Activity,
  Shield,
  Loader2,
  RefreshCw,
  Radio,
  MapPin,
  ChevronRight,
  Bell,
  TrendingUp,
  TrendingDown,
  HardHat,
  Wrench,
  ClipboardCheck,
  Zap,
  Users,
  Search,
  AlertCircle,
  Flame,
  Droplets,
  Skull,
  Ambulance,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

import IncidentDetails from "./IncidentDetailPage";

const API_BASE_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const TEAM_COLORS = [
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
];
const STATUS_META = {
  pending: {
    label: "Pending",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  reported: {
    label: "Reported",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  ongoing: {
    label: "In Progress",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  dispatched: {
    label: "Dispatched",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
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
  completed: {
    label: "Completed",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  fixed: { label: "Fixed", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  closed: {
    label: "Closed",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
};
const ICON_MAP = {
  fire: Flame,
  crime: Skull,
  medical: Ambulance,
  flood: Droplets,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getEnglish = (val) => {
  if (!val) return "—";
  if (typeof val === "object") return val.en || val.name?.en || val.name || "—";
  return String(val);
};
const toEn = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return String(value);
  if (typeof value.en === "string") return value.en;
  if (value.name !== undefined) return toEn(value.name);
  const first = Object.values(value).find((v) => typeof v === "string");
  return first || "";
};
const getCatKey = (item) => {
  const src =
    item.category?.name !== undefined
      ? item.category
      : item.category || "other";
  const name =
    typeof src === "object"
      ? toEn(src.name) || toEn(src)
      : String(src || "other");
  return name.toLowerCase().trim().replace(/\s+/g, "_");
};
const getStatusKey = (item) => {
  const s = (item.status || "pending").toLowerCase().replace(/\s+/g, "_");
  return s;
};
const isResolved = (item) =>
  ["resolved", "completed", "fixed", "closed"].includes(getStatusKey(item));

// ─── CHART TOOLTIP ───────────────────────────────────────────────────────────
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
        fontFamily: "'Space Mono', monospace",
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

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes kpiIn    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes shimmer  { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{box-shadow:0 0 0 6px rgba(34,197,94,0)} }
  .inc-row:hover  { background:#F8FAFF !important; border-color:#C7D7FD !important; transform:translateX(2px); }
  .team-row:hover { background:#F8FAFF !important; }
  .sync-btn:hover { background:#EFF6FF !important; border-color:#93C5FD !important; }
  .s-input:focus  { border-color:#93C5FD !important; box-shadow:0 0 0 3px rgba(59,130,246,0.1) !important; outline:none !important; }
`;

const F = "'Plus Jakarta Sans', sans-serif";
const FM = "'Space Mono', monospace";
const FD = "'Outfit', sans-serif";

// ═════════════════════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [search, setSearch] = useState("");
  const [lastSync, setLastSync] = useState(null);
  const socketRef = useRef();

  const [data, setData] = useState({
    stats: [],
    incidents: [],
    allIncidents: [],
    units: [],
    totalUnits: 0,
    categories: [],
    teamRows: [],
  });

  const uiFlavor = useMemo(() => {
    const storedAgency = JSON.parse(localStorage.getItem("agency") || "{}");
    const type = (
      getEnglish(storedAgency?.agencyType?.name) || ""
    ).toLowerCase();
    const isService = [
      "municipal",
      "electric utility",
      "water utility",
      "health service",
    ].some((t) => type.includes(t));
    return {
      isService,
      title: isService ? "Operational Command" : "Tactical Overview",
      mainStatLabel: isService ? "Active Requests" : "Active Emergencies",
      teamLabel: isService ? "Field Crews" : "Response Teams",
      logLabel: isService ? "Service Request Log" : "Dispatch Log",
      accentColor: isService ? "#10B981" : "#3B82F6",
      accentGrad: isService
        ? "linear-gradient(135deg,#10B981,#059669)"
        : "linear-gradient(135deg,#3B82F6,#2563EB)",
      mainIcon: isService ? Wrench : AlertTriangle,
      statusReady: isService ? "Operational" : "Live Feed",
    };
  }, []);

  const fetchDashboardData = useCallback(
    async (isInitial = false) => {
      const token = localStorage.getItem("token");
      const storedAgency = JSON.parse(localStorage.getItem("agency") || "{}");
      setAgencyInfo(storedAgency);
      if (!storedAgency.id) return;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isInitial) setLoading(true);
      else setIsSyncing(true);
      setLastSync(new Date());

      try {
        const dataUrl = uiFlavor.isService
          ? `${API_BASE_URL}/service/agency/${storedAgency.id}`
          : `${API_BASE_URL}/emergencies/agency/${storedAgency.id}/emergencies`;
        const categoryUrl = uiFlavor.isService
          ? `${API_BASE_URL}/serviceCategories`
          : `${API_BASE_URL}/categories`;

        const [dataRes, teamRes, catRes] = await Promise.all([
          axios.get(dataUrl, config),
          axios.get(
            `${API_BASE_URL}/responderTeam/agency/${storedAgency.id}`,
            config,
          ),
          axios.get(categoryUrl, config).catch(() => ({ data: { data: [] } })),
        ]);

        let allItems = [];
        const body = dataRes.data;
        if (body.services && Array.isArray(body.services))
          allItems = body.services;
        else if (body.data && Array.isArray(body.data)) allItems = body.data;
        else if (Array.isArray(body)) allItems = body;

        const allTeams = teamRes.data.data || [];
        const allCategories =
          catRes.data.data || catRes.data?.categories || catRes.data || [];

        const activeCount = allItems.filter((i) => !isResolved(i)).length;

        const teamRows = allTeams.slice(0, 6).map((t, i) => ({
          name: toEn(t.name) || "Team",
          deployed: t.crew?.length ?? t.crewCount ?? t.activeCount ?? 0,
          total: t.capacity ?? t.maxCrew ?? Math.max(t.crew?.length ?? 0, 6),
          color: TEAM_COLORS[i % TEAM_COLORS.length],
          status: t.status || "available",
        }));

        setData({
          stats: [
            {
              title: uiFlavor.isService
                ? "Total Service Calls"
                : "Total Incidents",
              value: allItems.length,
              icon: Activity,
              accent: "#3B82F6",
              delay: 0,
              load: false,
            },
            {
              title: uiFlavor.mainStatLabel,
              value: activeCount,
              icon: uiFlavor.mainIcon,
              accent: uiFlavor.isService ? "#10B981" : "#EF4444",
              delay: 60,
              load: false,
            },
            {
              title: uiFlavor.teamLabel,
              value: allTeams.length,
              icon: uiFlavor.isService ? HardHat : Car,
              accent: "#6366F1",
              delay: 120,
              load: false,
            },
            {
              title: uiFlavor.isService ? "Tasks Completed" : "Cases Resolved",
              value: allItems.length - activeCount,
              icon: uiFlavor.isService ? ClipboardCheck : CheckCircle2,
              accent: "#10B981",
              delay: 180,
              load: false,
            },
          ],
          allIncidents: allItems,
          incidents: allItems
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 12),
          units: [
            {
              name: "Available",
              value: allTeams.filter((t) => t.status === "available").length,
              color: "#10B981",
            },
            {
              name: "Busy",
              value: allTeams.filter((t) => t.status === "busy").length,
              color: "#EF4444",
            },
            {
              name: "Offline",
              value: allTeams.filter((t) => t.status === "offline").length,
              color: "#F59E0B",
            },
          ],
          totalUnits: allTeams.length,
          categories: allCategories,
          teamRows,
        });
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    },
    [uiFlavor],
  );

  useEffect(() => {
    fetchDashboardData(true);
    const token = localStorage.getItem("token");
    socketRef.current = io(SOCKET_URL, { auth: { token: `Bearer ${token}` } });
    const eventName = uiFlavor.isService ? "newServiceRequest" : "newEmergency";
    socketRef.current.on(eventName, () => fetchDashboardData());
    return () => socketRef.current.disconnect();
  }, [fetchDashboardData, uiFlavor.isService]);

  // ─── Filtered incidents ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return data.incidents;
    return data.incidents.filter((r) => {
      const typeStr =
        toEn(r.emergencyType?.name) || toEn(r.serviceType?.name) || "";
      const catStr = toEn(r.category?.name) || "";
      const locStr = toEn(r.kebele) || "";
      return `${typeStr} ${catStr} ${locStr}`.toLowerCase().includes(q);
    });
  }, [data.incidents, search]);

  // ─── Timeline chart (weekly) ──────────────────────────────────────────────
  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      const label = format(d, "EEE");
      const count = data.allIncidents.filter(
        (e) =>
          format(new Date(e.createdAt), "yyyy-MM-dd") ===
          format(d, "yyyy-MM-dd"),
      ).length;
      return { label, count };
    });
  }, [data.allIncidents]);

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8FAFC",
          fontFamily: F,
        }}
      >
        <style>{GLOBAL_STYLES}</style>
        <div style={{ animation: "spin 1s linear infinite" }}>
          <Loader2 color={uiFlavor.accentColor} size={42} />
        </div>
        <p
          style={{
            marginTop: 16,
            color: "#94A3B8",
            fontFamily: FM,
            fontSize: 11,
            letterSpacing: ".12em",
            textTransform: "uppercase",
          }}
        >
          Synchronizing {uiFlavor.title}…
        </p>
      </div>
    );
  }

  // ─── Helpers for incident rows ────────────────────────────────────────────
  const getCatMeta = (item) => {
    const key = getCatKey(item);
    const forcedColors = {
      fire: "#F97316",
      crime: "#6366F1",
      medical: "#EF4444",
      flood: "#06B6D4",
      environment: "#10B981",
    };
    const color = forcedColors[key] || uiFlavor.accentColor;
    return {
      color,
      bg: color + "14",
      Icon: ICON_MAP[key] || (uiFlavor.isService ? Wrench : Radio),
    };
  };

  const agencyName =
    toEn(agencyInfo?.name) || getEnglish(agencyInfo?.name) || "Agency";
  const resolvedCount = data.allIncidents.filter(isResolved).length;
  const resRate = data.allIncidents.length
    ? ((resolvedCount / data.allIncidents.length) * 100).toFixed(1)
    : "0.0";

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div
        style={{
          fontFamily: F,
          background: "#F8FAFC",
          minHeight: "100vh",
          padding: "24px 28px",
          color: "#0F172A",
        }}
      >
        {/* ── TOP BAR ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 28,
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
                  background: uiFlavor.accentColor,
                  animation: "pulse-dot 2s ease infinite",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#64748B",
                  fontFamily: FM,
                  letterSpacing: ".08em",
                }}
              >
                {uiFlavor.title.toUpperCase()}
              </span>
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-.04em",
                lineHeight: 1.1,
                fontFamily: FD,
              }}
            >
              {agencyName}
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

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#94A3B8",
                  fontFamily: FM,
                  letterSpacing: ".1em",
                  marginBottom: 3,
                }}
              >
                NETWORK
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 700,
                  fontSize: 12,
                  color: uiFlavor.accentColor,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: uiFlavor.accentColor,
                  }}
                />
                {uiFlavor.statusReady}
              </div>
            </div>
            <button
              className="sync-btn"
              onClick={() => fetchDashboardData()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 18px",
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                fontSize: 11,
                color: "#475569",
                cursor: "pointer",
                fontFamily: FM,
                fontWeight: 600,
                transition: "all .15s",
                letterSpacing: ".06em",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  animation: isSyncing ? "spin 1s linear infinite" : "none",
                  color: isSyncing ? uiFlavor.accentColor : "inherit",
                }}
              />
              SYNC HUB
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
          {data.stats.map(({ title, value, icon: Icon, accent, delay }, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "20px 22px",
                border: "1px solid #E2E8F0",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
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
                  background: `radial-gradient(circle at top right, ${accent}12 0%, transparent 70%)`,
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
                    letterSpacing: ".1em",
                    color: "#94A3B8",
                    fontFamily: FM,
                  }}
                >
                  {title.toUpperCase()}
                </span>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: `${accent}14`,
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
                  fontFamily: FD,
                }}
              >
                {value}
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
                    background: "#F0FDF4",
                    color: "#16A34A",
                    padding: "2px 7px",
                    borderRadius: 5,
                    fontWeight: 700,
                  }}
                >
                  <TrendingDown size={9} /> {resRate}% resolved
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── ROW 2 ── */}
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
                "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
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
                      background: uiFlavor.accentColor,
                      borderRadius: 2,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#0F172A",
                      letterSpacing: ".04em",
                      fontFamily: FD,
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
                  Last 7 days
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={32}>
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
                        i === chartData.length - 1
                          ? "#F97316"
                          : uiFlavor.accentColor
                      }
                      opacity={i === chartData.length - 1 ? 1 : 0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px 26px",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
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
                  fontFamily: FD,
                }}
              >
                {uiFlavor.teamLabel.toUpperCase()} STATUS
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
              {data.totalUnits} units total
            </p>
            <div
              style={{
                position: "relative",
                height: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={data.units}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    strokeWidth={3}
                    stroke="#fff"
                  >
                    {data.units.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <p
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#0F172A",
                    lineHeight: 1,
                    fontFamily: FD,
                  }}
                >
                  {data.totalUnits}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "#94A3B8",
                    fontFamily: FM,
                    marginTop: 2,
                  }}
                >
                  UNITS
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 12,
              }}
            >
              {data.units.map((u) => (
                <div
                  key={u.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "#F8FAFC",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: u.color,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#475569",
                        fontFamily: FM,
                        letterSpacing: ".06em",
                      }}
                    >
                      {u.name.toUpperCase()}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#0F172A",
                      fontFamily: FD,
                    }}
                  >
                    {u.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 3: INCIDENTS + TEAMS ── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}
        >
          {/* Dispatch Log */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px 26px",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
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
                      fontFamily: FD,
                    }}
                  >
                    {uiFlavor.logLabel.toUpperCase()}
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

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filtered.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#94A3B8",
                    padding: "40px 0",
                    fontSize: 13,
                    fontFamily: F,
                  }}
                >
                  No activity recorded for this sector.
                </div>
              ) : (
                filtered.map((item) => {
                  const { color, bg, Icon } = getCatMeta(item);
                  const stKey = getStatusKey(item);
                  const st = STATUS_META[stKey] || STATUS_META.pending;
                  const typeEn =
                    toEn(item.emergencyType?.name) ||
                    toEn(item.serviceType?.name) ||
                    toEn(item.requestType) ||
                    (uiFlavor.isService ? "Service Request" : "Emergency");
                  const locEn = toEn(item.kebele) || "Area Assigned";
                  const catKey = getCatKey(item);
                  const catLabel =
                    catKey.charAt(0).toUpperCase() +
                    catKey.slice(1).replace(/_/g, " ");
                  return (
                    <div
                      key={item._id || item.id}
                      className="inc-row"
                      onClick={() => setSelectedIncident(item)}
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
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <MapPin size={9} /> {locEn}
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
                        {formatDistanceToNow(new Date(item.createdAt), {
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
                })
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Responder Teams */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "24px 26px",
                border: "1px solid #E2E8F0",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
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
                    fontFamily: FD,
                  }}
                >
                  {uiFlavor.teamLabel.toUpperCase()}
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
                {data.totalUnits} teams total
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {data.teamRows.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94A3B8",
                      padding: "20px 0",
                      fontSize: 12,
                    }}
                  >
                    No teams registered.
                  </div>
                ) : (
                  data.teamRows.map((t, i) => {
                    const pct =
                      t.total > 0
                        ? Math.min(
                            100,
                            Math.round((t.deployed / t.total) * 100),
                          )
                        : 0;
                    const load =
                      pct >= 75 ? "HIGH" : pct >= 40 ? "MOD" : "FREE";
                    const loadColor =
                      pct >= 75 ? "#EF4444" : pct >= 40 ? "#F59E0B" : "#10B981";
                    return (
                      <div
                        key={i}
                        className="team-row"
                        style={{
                          padding: "8px 10px",
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
                                maxWidth: 120,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
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
                  })
                )}
              </div>
            </div>

            {/* Protocol card */}
            <div
              style={{
                background: "#0F172A",
                borderRadius: 16,
                padding: "24px 26px",
                position: "relative",
                overflow: "hidden",
                animation: "fadeUp .45s .4s ease both",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(ellipse at top right, ${uiFlavor.accentColor}20 0%, transparent 60%)`,
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: uiFlavor.accentColor + "20",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <Bell size={20} color={uiFlavor.accentColor} />
                </div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#F8FAFC",
                    marginBottom: 8,
                    fontFamily: FD,
                  }}
                >
                  Protocol Active
                </h3>
                <p
                  style={{
                    fontSize: 11,
                    color: "#64748B",
                    lineHeight: 1.6,
                    fontFamily: F,
                  }}
                >
                  System monitoring current{" "}
                  {uiFlavor.isService
                    ? "infrastructure status"
                    : "sector incidents"}
                  .
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginTop: 16,
                  }}
                >
                  {[
                    {
                      val: data.allIncidents.length,
                      lbl: "Total",
                      color: uiFlavor.accentColor,
                    },
                    { val: resolvedCount, lbl: "Resolved", color: "#10B981" },
                    {
                      val: data.allIncidents.length - resolvedCount,
                      lbl: "Active",
                      color: "#EF4444",
                    },
                    { val: data.totalUnits, lbl: "Teams", color: "#6366F1" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#FFFFFF08",
                        borderRadius: 10,
                        padding: "10px 12px",
                        border: "1px solid #FFFFFF0A",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: s.color,
                          letterSpacing: "-.03em",
                          lineHeight: 1,
                          fontFamily: FD,
                        }}
                      >
                        {s.val}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#475569",
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
              <div
                style={{
                  position: "absolute",
                  bottom: -10,
                  right: -10,
                  opacity: 0.05,
                }}
              >
                {uiFlavor.isService ? (
                  <HardHat size={120} color="#fff" />
                ) : (
                  <Shield size={120} color="#fff" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedIncident && (
          <IncidentDetails
            incident={selectedIncident}
            categories={data.categories}
            onClose={() => setSelectedIncident(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardPage;
