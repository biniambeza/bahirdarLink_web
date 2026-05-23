import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  AlertTriangle, Car, Clock, CheckCircle, Activity, Shield,
  Loader2, RefreshCw, MapPin, ChevronRight, HardHat, Wrench,
  ClipboardCheck, Flame, Building, Heart, Cloud, Lock, Radio,
  ArrowUp, ArrowDown, Tag, Zap, TrendingUp, Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import IncidentDetails from "./IncidentDetailPage";

const API_BASE_URL = "http://localhost:5000/api";
const SOCKET_URL   = "http://localhost:5000";

/* ─── Tokens ─────────────────────────────────────────── */
const T = {
  bg:        "#F6F8FF",
  card:      "#FFFFFF",
  navy:      "#0B1E3D",
  navyDeep:  "#060F22",
  blue:      "#2563EB",
  blueLight: "#DBEAFE",
  teal:      "#059669",
  tealLight: "#D1FAE5",
  amber:     "#D97706",
  amberLight:"#FEF3C7",
  rose:      "#E11D48",
  roseLight: "#FFE4E6",
  violet:    "#7C3AED",
  violetLight:"#EDE9FE",
  slate:     "#64748B",
  slateL:    "#94A3B8",
  border:    "#E2E8F0",
  shadow:    "rgba(15,23,42,0.08)",
};

const STATUS_CFG = {
  ongoing:    { bg: T.roseLight,  text: T.rose,   border: "#FECDD3", dot: T.rose   },
  reported:   { bg: T.roseLight,  text: T.rose,   border: "#FECDD3", dot: T.rose   },
  dispatched: { bg: T.amberLight, text: T.amber,  border: "#FDE68A", dot: T.amber  },
  pending:    { bg: T.violetLight,text: T.violet, border: "#DDD6FE", dot: T.violet },
  resolved:   { bg: T.tealLight,  text: T.teal,   border: "#A7F3D0", dot: T.teal   },
  completed:  { bg: T.tealLight,  text: T.teal,   border: "#A7F3D0", dot: T.teal   },
  escalated:  { bg: "#FFF1F2",    text: "#9F1239", border: "#FECDD3", dot: "#9F1239"},
  in_progress:{ bg: T.blueLight,  text: T.blue,   border: "#BFDBFE", dot: T.blue   },
};
const getStatusCfg = (s = "") => STATUS_CFG[s.toLowerCase()] || { bg: "#F1F5F9", text: T.slate, border: T.border, dot: T.slateL };

const CAT_META = {
  fire:     { color: "#E11D48", light: "#FFE4E6", Icon: Flame    },
  medical:  { color: "#059669", light: "#D1FAE5", Icon: Heart    },
  security: { color: "#7C3AED", light: "#EDE9FE", Icon: Lock     },
  hazmat:   { color: "#D97706", light: "#FEF3C7", Icon: Cloud    },
  rescue:   { color: "#0891B2", light: "#CFFAFE", Icon: Building },
  default:  { color: "#2563EB", light: "#DBEAFE", Icon: Radio    },
};
const getCat = (n = "") => {
  const k = n.toLowerCase();
  for (const [key, v] of Object.entries(CAT_META)) if (k.includes(key)) return v;
  return CAT_META.default;
};

/* ─── Helpers ───────────────────────────────────────── */
const getEn = (v) => {
  if (!v) return "—";
  if (typeof v === "object") return v.en || v.name?.en || v.name || "—";
  if (typeof v === "string" && v.startsWith("{")) { try { return JSON.parse(v).en || v; } catch { return v; } }
  return String(v);
};

const buildTrend = (items) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  return days.map(day => ({
    day: new Date(day).toLocaleDateString("en", { weekday: "short" }),
    total:    items.filter(it => (it.createdAt || "").slice(0, 10) === day).length,
    resolved: items.filter(it => (it.createdAt || "").slice(0, 10) === day && ["resolved","completed"].includes(getEn(it.status).toLowerCase())).length,
  }));
};
const buildCatDist = (items, catMap) => {
  const counts = {};
  items.forEach(it => {
    const rawId = it.categoryId ?? it.serviceCategoryId ?? it.category?.id ?? it.serviceCategory?.id ?? null;
    let name = "General";
    if (rawId && catMap[String(rawId)]) name = getEn(catMap[String(rawId)].name);
    else { const n = getEn(it.serviceCategory?.name) || getEn(it.category?.name); if (n && n !== "—") name = n; }
    counts[name] = (counts[name] || 0) + 1;
  });
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6);
};
const buildStatusDist = (items) => {
  const MAP = { reported: T.rose, pending: T.violet, in_progress: T.blue, ongoing: T.rose, dispatched: T.amber, resolved: T.teal, completed: T.teal, escalated: "#9F1239" };
  const counts = {};
  items.forEach(it => { const s = getEn(it.status).toLowerCase(); counts[s] = (counts[s] || 0) + 1; });
  return Object.entries(counts).map(([name, value]) => ({ name: name.replace("_", " "), value, color: MAP[name] || T.slate }));
};

/* ─── Custom Tooltip ────────────────────────────────── */
const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.navyDeep, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: "10px 16px", fontSize: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
      <p style={{ color: T.slateL, marginBottom: 6, fontWeight: 600, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color || p.fill }} />
          <span style={{ color: "#E2E8F0", fontWeight: 600 }}>{p.name}:</span>
          <span style={{ color: "#fff", fontWeight: 800 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Gradient defs component ──────────────────────── */
const GradDefs = () => (
  <defs>
    <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={T.blue} stopOpacity={0.25} />
      <stop offset="100%" stopColor={T.blue} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="gTeal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={T.teal} stopOpacity={0.2} />
      <stop offset="100%" stopColor={T.teal} stopOpacity={0} />
    </linearGradient>
  </defs>
);

/* ─── Stat Card ─────────────────────────────────────── */
const StatCard = ({ title, value, Icon, color, light, delay, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 20,
      padding: "22px 24px",
      position: "relative",
      overflow: "hidden",
      boxShadow: `0 1px 3px ${T.shadow}, 0 8px 24px ${T.shadow}`,
    }}
  >
    {/* Top accent line */}
    <div style={{ position: "absolute", top: 0, left: 24, right: 24, height: 2, background: `linear-gradient(90deg, ${color}, ${color}44)`, borderRadius: "0 0 4px 4px" }} />

    {/* Background glow */}
    <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: color, opacity: 0.05, filter: "blur(30px)", pointerEvents: "none" }} />

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: light, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} color={color} />
      </div>
      {sub != null && (
        <div style={{
          fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
          background: sub >= 0 ? T.tealLight : T.roseLight,
          color: sub >= 0 ? T.teal : T.rose,
          display: "flex", alignItems: "center", gap: 3,
        }}>
          {sub >= 0 ? <ArrowUp size={9} /> : <ArrowDown size={9} />}
          {Math.abs(sub)}
        </div>
      )}
    </div>

    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: T.slateL, marginBottom: 6 }}>{title}</p>
    <p style={{ fontSize: 36, fontWeight: 800, color: T.navy, lineHeight: 1, letterSpacing: "-.03em", fontVariantNumeric: "tabular-nums" }}>{value}</p>
  </motion.div>
);

/* ─── Trend chart ───────────────────────────────────── */
const TrendChart = ({ data, label }) => (
  <div style={{ background: T.card, borderRadius: 20, padding: "22px 24px", border: `1px solid ${T.border}`, boxShadow: `0 1px 3px ${T.shadow}`, height: "100%" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.slateL, marginBottom: 3 }}>Activity Trend</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{label}</p>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {[{ label: "Total", color: T.blue }, { label: "Resolved", color: T.teal }].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: T.slate }}>
            <span style={{ width: 16, height: 3, borderRadius: 2, background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
    <ResponsiveContainer width="100%" height={175}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <GradDefs />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: T.slateL }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: T.slateL }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CT />} />
        <Area type="monotone" dataKey="total"    stroke={T.blue} strokeWidth={2.5} fill="url(#gBlue)" name="Total"    dot={false} activeDot={{ r: 4, fill: T.blue }} />
        <Area type="monotone" dataKey="resolved" stroke={T.teal} strokeWidth={2}   fill="url(#gTeal)" name="Resolved" dot={false} activeDot={{ r: 4, fill: T.teal }} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

/* ─── Team donut ────────────────────────────────────── */
const TeamDonut = ({ units, total }) => {
  const entries = [
    { name: "Available", value: units.find(u => u.name === "Available")?.value ?? 0, color: T.teal   },
    { name: "Busy",      value: units.find(u => u.name === "Busy")?.value      ?? 0, color: T.rose   },
    { name: "Offline",   value: units.find(u => u.name === "Offline")?.value   ?? 0, color: T.amber  },
  ];
  return (
    <div style={{ background: T.card, borderRadius: 20, padding: "22px 24px", border: `1px solid ${T.border}`, boxShadow: `0 1px 3px ${T.shadow}` }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.slateL, marginBottom: 3 }}>Team Status</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 18 }}>Unit Distribution</p>
      <div style={{ position: "relative", height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={entries} cx="50%" cy="50%" innerRadius={44} outerRadius={66}
              dataKey="value" paddingAngle={4} strokeWidth={0}>
              {entries.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip content={<CT />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: T.navy, lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: T.slateL, letterSpacing: ".15em", textTransform: "uppercase", marginTop: 2 }}>Total</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        {entries.map(e => (
          <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 10, background: `${e.color}0D`, border: `1px solid ${e.color}22` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: T.navy }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: e.color }} />
              {e.name}
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: e.color }}>{e.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Category bar chart ────────────────────────────── */
const CatChart = ({ data }) => (
  <div style={{ background: T.card, borderRadius: 20, padding: "22px 24px", border: `1px solid ${T.border}`, boxShadow: `0 1px 3px ${T.shadow}` }}>
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.slateL, marginBottom: 3 }}>Distribution</p>
    <p style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 18 }}>By Category</p>
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} barSize={22} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.slateL }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: T.slateL }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CT />} cursor={{ fill: "rgba(37,99,235,0.04)", radius: 8 }} />
        <Bar dataKey="count" radius={[8, 8, 2, 2]} name="Count">
          {data.map((e, i) => <Cell key={i} fill={getCat(e.name).color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

/* ─── Status pie ────────────────────────────────────── */
const StatusPie = ({ data }) => (
  <div style={{ background: T.card, borderRadius: 20, padding: "22px 24px", border: `1px solid ${T.border}`, boxShadow: `0 1px 3px ${T.shadow}` }}>
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: T.slateL, marginBottom: 3 }}>Overview</p>
    <p style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 18 }}>Status Breakdown</p>
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <div style={{ width: 140, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={62} dataKey="value" paddingAngle={2} strokeWidth={0}>
              {data.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip content={<CT />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map(e => (
          <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 500, color: T.slate, textTransform: "capitalize" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: e.color, flexShrink: 0 }} />
              {e.name}
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.navy, fontVariantNumeric: "tabular-nums" }}>{e.value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Category badge ────────────────────────────────── */
const CatBadge = ({ name }) => {
  const m = getCat(name);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: ".04em", padding: "2px 8px", borderRadius: 6, background: m.light, color: m.color, border: `1px solid ${m.color}30` }}>
      <Tag size={8} />{name}
    </span>
  );
};

/* ─── Incident row ──────────────────────────────────── */
const IncRow = ({ inc, onClick, index }) => {
  const m  = getCat(inc.category);
  const ss = getStatusCfg(inc.status);
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      onClick={onClick}
      whileHover={{ translateX: 4 }}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 18px", borderRadius: 14, cursor: "pointer",
        background: T.card, border: `1px solid ${T.border}`,
        transition: "border-color .15s, box-shadow .15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue + "44"; e.currentTarget.style.boxShadow = `0 4px 20px ${T.shadow}`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Icon */}
      <div style={{ width: 42, height: 42, borderRadius: 12, background: m.light, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <m.Icon size={18} color={m.color} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {inc.type}
          </span>
          <CatBadge name={inc.category} />
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 11, fontWeight: 500, color: T.slateL }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={10} color={T.slateL} />{inc.location}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={10} color={T.slateL} />{inc.time}</span>
        </div>
      </div>

      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 20, background: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: ss.dot }} />
          {inc.status}
        </div>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.blueLight, color: T.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={14} />
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
const DashboardPage = () => {
  const [loading,          setLoading]          = useState(true);
  const [isSyncing,        setIsSyncing]        = useState(false);
  const [agencyInfo,       setAgencyInfo]       = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const socketRef = useRef();

  const [allItems,      setAllItems]      = useState([]);
  const [allTeams,      setAllTeams]      = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const uiFlavor = useMemo(() => {
    const s = JSON.parse(localStorage.getItem("agency") || "{}");
    const t = (getEn(s?.agencyType?.name) || "").toLowerCase();
    const isSvc = ["municipal","electric","water","road","utility"].some(x => t.includes(x));
    return {
      isService:    isSvc,
      title:        isSvc ? "Operations Hub"   : "Command Center",
      mainLabel:    isSvc ? "Active Requests"  : "Active Incidents",
      teamLabel:    isSvc ? "Field Crews"      : "Response Teams",
      logLabel:     isSvc ? "Request Log"      : "Dispatch Log",
      trendLabel:   isSvc ? "Request Trend — Last 7 Days" : "Incident Trend — Last 7 Days",
      mainIcon:     isSvc ? Wrench             : AlertTriangle,
      resolvedIcon: isSvc ? ClipboardCheck     : CheckCircle,
    };
  }, []);

  const categoryMap = useMemo(() => {
    const m = {};
    allCategories.forEach(c => { if (c.id != null) m[String(c.id)] = c; if (c._id != null) m[String(c._id)] = c; });
    return m;
  }, [allCategories]);

  const activeCount   = useMemo(() => allItems.filter(it => !["resolved","completed","fixed","closed"].includes(getEn(it.status).toLowerCase())).length, [allItems]);
  const resolvedCount = useMemo(() => allItems.length - activeCount, [allItems, activeCount]);
  const trendData     = useMemo(() => buildTrend(allItems),                [allItems]);
  const catDistData   = useMemo(() => buildCatDist(allItems, categoryMap), [allItems, categoryMap]);
  const statusDist    = useMemo(() => buildStatusDist(allItems),           [allItems]);

  const unitStats = useMemo(() => ([
    { name: "Available", value: allTeams.filter(t => t.status === "available").length },
    { name: "Busy",      value: allTeams.filter(t => t.status === "busy").length      },
    { name: "Offline",   value: allTeams.filter(t => t.status === "offline").length   },
  ]), [allTeams]);

  const recentIncidents = useMemo(() =>
    [...allItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8).map(item => {
      const rawId = item.categoryId ?? item.serviceCategoryId ?? item.category?.id ?? item.serviceCategory?.id ?? null;
      let catName = "General";
      if (rawId && categoryMap[String(rawId)]) catName = getEn(categoryMap[String(rawId)].name);
      else { const n = getEn(item.serviceCategory?.name) || getEn(item.category?.name); if (n && n !== "—") catName = n; }
      return {
        id:       item._id || item.id,
        category: catName,
        type:     getEn(item.serviceType?.name || item.emergencyType?.name || (uiFlavor.isService ? "Service Request" : "Emergency")),
        location: getEn(item.kebele) !== "—" ? `${getEn(item.kebele)} · ${getEn(item.street)}` : "Area",
        time:     new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status:   getEn(item.status),
        raw:      item,
      };
    })
  , [allItems, categoryMap, uiFlavor.isService]);

  const fetchData = useCallback(async (initial = false) => {
    const token  = localStorage.getItem("token");
    const stored = JSON.parse(localStorage.getItem("agency") || "{}");
    setAgencyInfo(stored);
    if (!stored.id) return;
    const cfg = { headers: { Authorization: `Bearer ${token}` } };
    initial ? setLoading(true) : setIsSyncing(true);
    try {
      const dataUrl = uiFlavor.isService ? `${API_BASE_URL}/service/agency/${stored.id}` : `${API_BASE_URL}/emergencies/agency/${stored.id}/emergencies`;
      const catUrl  = uiFlavor.isService ? `${API_BASE_URL}/serviceCategory/agency/${stored.id}` : `${API_BASE_URL}/categories/by-agency/${stored.id}`;
      const [dataRes, teamRes, catRes] = await Promise.allSettled([
        axios.get(dataUrl, cfg),
        axios.get(`${API_BASE_URL}/responderTeam/agency/${stored.id}`, cfg),
        axios.get(catUrl, cfg),
      ]);
      const body = dataRes.status === "fulfilled" ? dataRes.value.data : {};
      setAllItems(body.services || body.data || (Array.isArray(body) ? body : []));
      setAllTeams(teamRes.status === "fulfilled" ? (teamRes.value.data.data || teamRes.value.data.teams || teamRes.value.data || []) : []);
      setAllCategories(catRes.status === "fulfilled" ? (catRes.value.data.data || catRes.value.data.categories || catRes.value.data || []) : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setIsSyncing(false); }
  }, [uiFlavor]);

  useEffect(() => {
    fetchData(true);
    const token = localStorage.getItem("token");
    socketRef.current = io(SOCKET_URL, { auth: { token: `Bearer ${token}` } });
    socketRef.current.on(uiFlavor.isService ? "newServiceRequest" : "newEmergency", () => fetchData());
    return () => socketRef.current?.disconnect();
  }, [fetchData, uiFlavor.isService]);

  /* ── Loading ── */
  if (loading) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: T.bg }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <Loader2 size={38} color={T.blue} />
      </motion.div>
      <p style={{ marginTop: 14, fontSize: 10, fontWeight: 700, color: T.slateL, letterSpacing: ".25em", textTransform: "uppercase" }}>
        Initialising {uiFlavor.title}
      </p>
    </div>
  );

  /* ── Main render ── */
  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "1.75rem 1.75rem 3rem", fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes pulse-live { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(1.6)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* ══ HEADER ══ */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: 16 }}
      >
        <div>
          {/* Live badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `${T.teal}12`, border: `1px solid ${T.teal}30`, borderRadius: 99, padding: "4px 12px", marginBottom: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.teal, animation: "pulse-live 1.8s infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: T.teal }}>Live · {uiFlavor.title}</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: T.navy, margin: 0, letterSpacing: "-.03em", lineHeight: 1.1 }}>
            {getEn(agencyInfo?.name)}
          </h1>
          {agencyInfo?.agencyType && (
            <p style={{ fontSize: 13, color: T.slateL, fontWeight: 500, marginTop: 4 }}>
              {getEn(agencyInfo.agencyType?.name)} Department · Real-time monitoring
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Status pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 99, background: T.card, border: `1px solid ${T.border}`, fontSize: 11, fontWeight: 700, color: T.slate, boxShadow: `0 1px 4px ${T.shadow}` }}>
            <Shield size={13} color={T.teal} />
            Secure Channel
          </div>
          {/* Sync button */}
          <button
            onClick={() => fetchData()}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 99, border: "none", background: T.blue, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 16px rgba(37,99,235,0.35)`, transition: "opacity .15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <RefreshCw size={13} style={{ animation: isSyncing ? "spin 1s linear infinite" : "none" }} />
            Sync Data
          </button>
        </div>
      </motion.div>

      {/* ══ STAT CARDS ══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: "1.5rem" }}>
        <StatCard title="Total Records"       value={allItems.length}  Icon={Activity}                                      color={T.blue}   light={T.blueLight}   delay={0}    />
        <StatCard title={uiFlavor.mainLabel}  value={activeCount}      Icon={uiFlavor.mainIcon}                             color={T.rose}   light={T.roseLight}   delay={0.08} />
        <StatCard title={uiFlavor.teamLabel}  value={allTeams.length}  Icon={uiFlavor.isService ? HardHat : Users}          color={T.violet} light={T.violetLight} delay={0.16} />
        <StatCard title="Resolved"            value={resolvedCount}    Icon={uiFlavor.resolvedIcon}                         color={T.teal}   light={T.tealLight}   delay={0.24} />
      </div>

      {/* ══ CHARTS ROW 1: trend + donut ══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14, marginBottom: "1.25rem", alignItems: "start" }}>
        <TrendChart data={trendData} label={uiFlavor.trendLabel} />
        <TeamDonut units={unitStats} total={allTeams.length} />
      </div>

      {/* ══ CHARTS ROW 2: cat bar + status pie ══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: "1.5rem" }}>
        <CatChart data={catDistData} />
        <StatusPie data={statusDist} />
      </div>

      {/* ══ DISPATCH LOG ══ */}
      <div>
        {/* Section header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 4, height: 18, background: T.blue, borderRadius: 2 }} />
            <p style={{ fontSize: 13, fontWeight: 800, color: T.navy, letterSpacing: "-.01em" }}>{uiFlavor.logLabel}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 99, background: `${T.teal}12`, color: T.teal, border: `1px solid ${T.teal}25` }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.teal, animation: "pulse-live 1.4s infinite" }} />
            Live Stream
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <AnimatePresence>
            {recentIncidents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3.5rem", borderRadius: 16, border: `1.5px dashed ${T.border}`, color: T.slateL, fontSize: 13, fontWeight: 500, background: T.card }}>
                No activity recorded for this sector.
              </div>
            ) : (
              recentIncidents.map((inc, i) => (
                <IncRow key={inc.id} inc={inc} index={i} onClick={() => setSelectedIncident(inc.raw)} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══ DETAIL PANEL ══ */}
      <AnimatePresence>
        {selectedIncident && (
          <IncidentDetails
            incident={selectedIncident}
            categories={allCategories}
            onClose={() => setSelectedIncident(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;