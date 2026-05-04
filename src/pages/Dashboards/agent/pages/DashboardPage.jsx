import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  AlertTriangle, Car, CheckCircle, Activity, Shield,
  Signal, Loader2, RefreshCw, Radio, Users, TrendingUp,
  MapPin, Clock, Zap, ChevronRight, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
  BarChart, Bar, LabelList
} from "recharts";

const API_BASE_URL = "http://localhost:5000/api";
const SOCKET_URL   = "http://localhost:5000";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  navy:      "#0B2545",
  blue:      "#1565C0",
  blueMid:   "#1976D2",
  blueLight: "#42A5F5",
  bluePale:  "#E3F2FD",
  blueTint:  "#F0F7FF",
  accent:    "#0288D1",
  teal:      "#00838F",
  green:     "#00897B",
  amber:     "#F57C00",
  red:       "#D32F2F",
  slate:     "#455A64",
  muted:     "#78909C",
  border:    "#BBDEFB",
  borderSoft:"#E1EFFF",
  bg:        "#F5F9FF",
  white:     "#FFFFFF",
};

// ─── Type colours ─────────────────────────────────────────────────────────────
const TYPE_PALETTE = [
  "#1565C0","#00897B","#E53935","#F57C00","#4527A0",
  "#006064","#00695C","#AD1457","#558B2F","#283593",
];

function getTypeColor(index) {
  return TYPE_PALETTE[index % TYPE_PALETTE.length];
}

const STATUS_CONFIG = {
  pending:    { bg:"#FFF8E1", text:"#E65100", dot:"#FFB300"  },
  dispatched: { bg:"#E3F2FD", text:"#0D47A1", dot:"#1E88E5"  },
  active:     { bg:"#FCE4EC", text:"#880E4F", dot:"#E91E63"  },
  resolved:   { bg:"#E0F2F1", text:"#004D40", dot:"#00897B"  },
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.white, border: `1.5px solid ${T.border}`,
      borderRadius: 10, padding: "8px 14px",
      boxShadow: "0 4px 20px rgba(21,101,192,0.12)"
    }}>
      <p style={{ color: T.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || T.blue, fontSize: 13, fontWeight: 800, margin: 0 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Category Donut Custom Tooltip ────────────────────────────────────────────
const CategoryTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: T.white, border: `1.5px solid ${T.border}`,
      borderRadius: 10, padding: "8px 14px",
      boxShadow: "0 4px 20px rgba(21,101,192,0.12)"
    }}>
      <p style={{ fontSize: 12, fontWeight: 800, color: d.payload.fill, margin: 0 }}>{d.name}</p>
      <p style={{ fontSize: 13, fontWeight: 900, color: T.navy, margin: 0 }}>{d.value} incidents</p>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const [loading,  setLoading]  = useState(true);
  const [syncing,  setSyncing]  = useState(false);
  const [agency,   setAgency]   = useState(null);
  const [activeCatIndex, setActiveCatIndex] = useState(null);
  const socketRef = useRef();

  const [data, setData] = useState({
    stats: [], incidents: [], teams: [], teamStats: [],
    categoryBreakdown: [], trend: [],
    totalIncidents: 0, resolvedCount: 0, activeCount: 0,
  });

  const fetchAll = useCallback(async (isInitial = false) => {
    const token    = localStorage.getItem("token");
    const agencyId = localStorage.getItem("agencyId");
    if (!token || !agencyId) { setLoading(false); setSyncing(false); return; }

    const cfg = { headers: { Authorization: `Bearer ${token}` } };
    if (isInitial) setLoading(true); else setSyncing(true);

    try {
      // ── 1. Fetch agency info ──────────────────────────────────────────────
      const agRes = await axios.get(`${API_BASE_URL}/agencies/${agencyId}`, cfg);
      const ag = agRes.data.data || agRes.data;
      setAgency(ag);

      // ── 2. Fetch incidents via /agency/:agencyId/emergencies ──────────────
      //    This avoids the route-ordering bug where /admin/all is shadowed
      //    by /:userOrGuestId matching "admin" as a param.
      const emRes = await axios.get(
        `${API_BASE_URL}/emergencies/agency/${agencyId}/emergencies`, cfg
      );
      const mine = emRes.data.data || emRes.data || [];

      // ── 3. Fetch responder teams by agency ────────────────────────────────
      const tmRes = await axios.get(
        `${API_BASE_URL}/responderTeam/agency/${agencyId}`, cfg
      );
      const teams = tmRes.data.data || tmRes.data || [];

      // ── 4. Compute stats ─────────────────────────────────────────────────
      const today    = new Date().toDateString();
      const total    = mine.length;
      const resolved = mine.filter(e => e.status === "resolved").length;
      const active   = mine.filter(e => e.status !== "resolved").length;
      const rToday   = mine.filter(e =>
        e.status === "resolved" &&
        new Date(e.updatedAt).toDateString() === today
      ).length;

      const avail   = teams.filter(t => t.status === "available").length;
      const busy    = teams.filter(t => t.status === "busy").length;
      const offline = teams.filter(t => t.status === "offline").length;

      // ── 5. Category breakdown using agency's own emergencyTypes ──────────
      //    Build a map from the agency's registered emergency type list first
      //    so categories with 0 incidents still appear (shows full picture).
      const agencyTypes = ag.emergencyTypes || [];

      // Map by _id → name for quick lookup
      const typeNameById = {};
      agencyTypes.forEach(t => {
        const id   = String(t._id || t.id || t);
        const name = t.name || t;
        typeNameById[id] = name;
      });

      // Count incidents per type
      const countByTypeId = {};
      mine.forEach(e => {
        const tid = String(
          e.emergencyType?._id || e.emergencyType?.id || e.emergencyType || "unknown"
        );
        countByTypeId[tid] = (countByTypeId[tid] || 0) + 1;
      });

      // Build categoryBreakdown — include all agency types + any "other" incidents
      const categoryBreakdown = agencyTypes.map((t, i) => {
        const id    = String(t._id || t.id || t);
        const name  = t.name || String(t);
        return {
          name,
          count: countByTypeId[id] || 0,
          fill:  getTypeColor(i),
        };
      }).filter(c => c.count > 0); // only show types that have incidents

      // If there are incidents whose type isn't in agencyTypes, group as "Other"
      const knownIds = new Set(agencyTypes.map(t => String(t._id || t.id || t)));
      const otherCount = mine.filter(e => {
        const tid = String(e.emergencyType?._id || e.emergencyType?.id || e.emergencyType || "");
        return !knownIds.has(tid);
      }).length;
      if (otherCount > 0) {
        categoryBreakdown.push({
          name: "Other",
          count: otherCount,
          fill: "#78909C",
        });
      }

      // ── 6. 24-hour trend buckets (4-hour windows) ─────────────────────────
      const buckets = Array.from({ length: 6 }, (_, i) => ({
        name: `${String(i * 4).padStart(2, "0")}:00`,
        val: 0,
      }));
      mine.forEach(e => {
        const h = new Date(e.createdAt).getHours();
        buckets[Math.floor(h / 4)].val++;
      });

      // ── 7. Available team names list ──────────────────────────────────────
      const availableTeams = teams
        .filter(t => t.status === "available")
        .map(t => ({
          id:     t._id || t.id,
          name:   t.teamName || t.name || `Team ${String(t._id).slice(-4)}`,
          lead:   t.leader?.fullName || t.leadName || "—",
          status: t.status,
        }));

      const allTeamsFormatted = teams.slice(0, 8).map(t => ({
        id:     t._id || t.id,
        name:   t.teamName || t.name || `Team ${String(t._id).slice(-4)}`,
        lead:   t.leader?.fullName || t.leadName || "—",
        status: t.status || "offline",
      }));

      setData({
        stats: [
          { label: "Total Incidents",    value: total,  icon: Radio,         color: T.blue,  bg: T.bluePale },
          { label: "Active Emergencies", value: active, icon: AlertTriangle,  color: T.amber, bg: "#FFF3E0"  },
          { label: "Resolved Today",     value: rToday, icon: CheckCircle,    color: T.green, bg: "#E0F2F1"  },
          { label: "Available Teams",    value: avail,  icon: Users,          color: T.teal,  bg: "#E0F7FA"  },
        ],
        incidents: mine.slice(0, 8).map(e => ({
          id:       e._id || e.id,
          type:     e.emergencyType?.name || "General",
          location: e.address || e.location || "—",
          time:     new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status:   e.status || "pending",
        })),
        teams: allTeamsFormatted,
        availableTeams,
        teamStats: [
          { name: "Available", value: avail,   color: T.green },
          { name: "On Mission", value: busy,    color: T.red   },
          { name: "Off-duty",  value: offline, color: T.muted },
        ],
        categoryBreakdown,
        trend: buckets,
        totalIncidents: total,
        resolvedCount: resolved,
        activeCount: active,
        totalTeams: teams.length,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(true);
    const token = localStorage.getItem("token");
    socketRef.current = io(SOCKET_URL, { auth: { token: `Bearer ${token}` } });
    socketRef.current.on("newEmergency",     () => fetchAll());
    socketRef.current.on("emergencyUpdated", () => fetchAll());
    return () => socketRef.current?.disconnect();
  }, [fetchAll]);

  if (loading) return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: `linear-gradient(160deg,${T.navy} 0%,${T.blue} 60%,${T.blueLight} 100%)`
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)",
        border: "1.5px solid rgba(255,255,255,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 28, boxShadow: "0 8px 40px rgba(0,0,0,0.3)"
      }}>
        <Shield size={34} color="#fff" />
      </div>
      <Loader2 size={22} color="rgba(255,255,255,0.7)"
        style={{ animation: "spin 1s linear infinite", marginBottom: 14 }} />
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 3, fontWeight: 700, textTransform: "uppercase" }}>
        Initialising Secure Stream
      </p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const pct = data.totalIncidents > 0
    ? Math.round((data.resolvedCount / data.totalIncidents) * 100)
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav style={{
        background: T.white, height: 62,
        borderBottom: `1.5px solid ${T.borderSoft}`,
        padding: "0 36px", display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 12px rgba(21,101,192,0.06)", position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `linear-gradient(135deg,${T.blue},${T.accent})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 14px ${T.blue}40`
          }}>
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: T.navy, margin: 0, letterSpacing: -0.4 }}>
              {agency?.name || "Agency HQ"}
            </p>
            <p style={{ fontWeight: 600, fontSize: 10, color: T.muted, margin: 0, letterSpacing: 1.2, textTransform: "uppercase" }}>
              Emergency Operations Center
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: `${T.green}14`, border: `1.5px solid ${T.green}30`,
            borderRadius: 24, padding: "5px 13px"
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: T.green,
              boxShadow: `0 0 7px ${T.green}`, animation: "pulse 2s infinite"
            }} />
            <span style={{ color: T.green, fontSize: 10, fontWeight: 800, letterSpacing: 1.2 }}>LIVE</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: T.blueTint, border: `1.5px solid ${T.borderSoft}`,
            borderRadius: 10, padding: "6px 12px"
          }}>
            <Building2 size={13} color={T.blueLight} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.slate }}>
              {agency?.city || agency?.location || "—"}
            </span>
          </div>
          <button onClick={() => fetchAll()} style={{
            width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${T.borderSoft}`,
            background: T.blueTint, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <RefreshCw size={15} color={syncing ? T.blue : T.muted}
              style={syncing ? { animation: "spin 0.7s linear infinite" } : {}} />
          </button>
        </div>
      </nav>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "28px 36px" }}>

        {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 22 }}>
          {data.stats.map((s, i) => <StatCard key={i} stat={s} />)}
        </div>

        {/* ── Hero Banner ────────────────────────────────────────────────────── */}
        <HeroBanner
          total={data.totalIncidents}
          resolved={data.resolvedCount}
          active={data.activeCount}
          pct={pct}
          totalTeams={data.totalTeams || 0}
        />

        {/* ── Charts Row ─────────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 20 }}>

          {/* ── Agency Emergency Type Category Breakdown ─────────────────────── */}
          <Card>
            <SectionHead
              icon={<TrendingUp size={15} color={T.blue} />}
              title={`Incidents by ${agency?.name || "Agency"} Category`}
            />
            {data.categoryBreakdown.length === 0 ? <Empty text="No incidents recorded yet" /> : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 24, alignItems: "center" }}>

                {/* Bar chart */}
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.categoryBreakdown}
                      layout="vertical"
                      barSize={20}
                      margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke={T.borderSoft} />
                      <XAxis
                        type="number"
                        axisLine={false} tickLine={false}
                        tick={{ fontSize: 10, fill: T.muted }}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false} tickLine={false}
                        tick={{ fontSize: 11, fontWeight: 700, fill: T.slate }}
                        width={90}
                      />
                      <Tooltip content={<CategoryTip />} cursor={{ fill: `${T.blue}08` }} />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {data.categoryBreakdown.map((e, i) => (
                          <Cell key={i} fill={e.fill} />
                        ))}
                        <LabelList
                          dataKey="count"
                          position="right"
                          style={{ fill: T.navy, fontSize: 11, fontWeight: 800 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Donut summary */}
                <div>
                  <div style={{ position: "relative", height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryBreakdown}
                          innerRadius={52} outerRadius={72}
                          paddingAngle={4}
                          dataKey="count"
                          animationDuration={1100}
                          onMouseEnter={(_, i) => setActiveCatIndex(i)}
                          onMouseLeave={() => setActiveCatIndex(null)}
                        >
                          {data.categoryBreakdown.map((e, i) => (
                            <Cell
                              key={i} fill={e.fill}
                              opacity={activeCatIndex === null || activeCatIndex === i ? 1 : 0.35}
                              style={{ cursor: "pointer" }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CategoryTip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      pointerEvents: "none"
                    }}>
                      <p style={{ fontSize: 22, fontWeight: 900, color: T.navy, margin: 0, lineHeight: 1 }}>
                        {activeCatIndex !== null
                          ? data.categoryBreakdown[activeCatIndex]?.count
                          : data.totalIncidents}
                      </p>
                      <p style={{ fontSize: 8, color: T.muted, fontWeight: 700, letterSpacing: 1.2, margin: 0 }}>
                        {activeCatIndex !== null
                          ? data.categoryBreakdown[activeCatIndex]?.name?.toUpperCase().slice(0, 10)
                          : "TOTAL"}
                      </p>
                    </div>
                  </div>
                  {/* Legend */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 6 }}>
                    {data.categoryBreakdown.map((c, i) => {
                      const pct = data.totalIncidents > 0
                        ? Math.round((c.count / data.totalIncidents) * 100)
                        : 0;
                      return (
                        <div key={i}
                          onMouseEnter={() => setActiveCatIndex(i)}
                          onMouseLeave={() => setActiveCatIndex(null)}
                          style={{
                            display: "flex", alignItems: "center", gap: 7,
                            cursor: "pointer", opacity: activeCatIndex === null || activeCatIndex === i ? 1 : 0.4,
                            transition: "opacity 0.15s"
                          }}
                        >
                          <span style={{
                            width: 9, height: 9, borderRadius: 3,
                            background: c.fill, flexShrink: 0,
                            display: "inline-block"
                          }} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: T.slate, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.name}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 800, color: T.navy }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Area – 24h trend */}
          <Card>
            <SectionHead icon={<Activity size={15} color={T.accent} />} title="Incident Volume (24h)" />
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={T.blue} stopOpacity={0.16} />
                      <stop offset="95%" stopColor={T.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={T.borderSoft} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: T.muted }} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: T.muted }} allowDecimals={false} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="val" name="Incidents"
                    stroke={T.blue} strokeWidth={2.5}
                    fill="url(#ag)"
                    dot={{ r: 4, fill: T.blue, stroke: T.white, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* ── Bottom Row ─────────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, marginTop: 20 }}>

          {/* Live Dispatch Feed */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <SectionHead icon={<Radio size={15} color={T.red} />} title="Live Dispatch Feed" inline />
              <span style={{
                fontSize: 10, fontWeight: 800, color: T.red,
                background: "#FFEBEE", border: "1.5px solid #FFCDD2",
                borderRadius: 20, padding: "3px 11px", letterSpacing: 0.5
              }}>
                {data.activeCount} Active
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {data.incidents.length === 0 && <Empty />}
              <AnimatePresence>
                {data.incidents.map((inc, i) => {
                  const sc  = STATUS_CONFIG[inc.status] || STATUS_CONFIG.pending;
                  // Find color from categoryBreakdown for consistent coloring
                  const catEntry = data.categoryBreakdown.find(c =>
                    c.name.toLowerCase() === inc.type.toLowerCase()
                  );
                  const col = catEntry?.fill || T.blue;
                  return (
                    <motion.div key={inc.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        display: "grid", gridTemplateColumns: "4px 1fr auto auto auto",
                        alignItems: "center", gap: "0 16px",
                        padding: "11px 14px", borderRadius: 12, cursor: "pointer",
                        background: i % 2 === 0 ? T.blueTint : T.white,
                        border: `1px solid ${i % 2 === 0 ? T.borderSoft : "transparent"}`,
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = T.bluePale}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.blueTint : T.white}
                    >
                      <span style={{ width: 4, height: 34, borderRadius: 4, background: col, display: "block" }} />
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 13, color: T.navy, margin: 0 }}>{inc.type}</p>
                        <p style={{ fontSize: 11, color: T.muted, margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
                          <MapPin size={10} /> {inc.location}
                        </p>
                      </div>
                      <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock size={10} /> {inc.time}
                      </p>
                      <span style={{
                        fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6,
                        padding: "3px 10px", borderRadius: 20,
                        background: sc.bg, color: sc.text, border: `1px solid ${sc.dot}30`,
                        display: "flex", alignItems: "center", gap: 4
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                        {inc.status}
                      </span>
                      <ChevronRight size={14} color={T.border} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </Card>

          {/* Field Teams Panel */}
          <Card>
            {/* Header with totals */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <SectionHead icon={<Car size={15} color={T.green} />} title="Field Teams" inline />
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, color: T.navy,
                  background: T.blueTint, border: `1.5px solid ${T.borderSoft}`,
                  borderRadius: 20, padding: "3px 10px"
                }}>
                  {data.totalTeams || 0} Total
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 800, color: T.green,
                  background: `${T.green}14`, border: `1.5px solid ${T.green}30`,
                  borderRadius: 20, padding: "3px 10px"
                }}>
                  {data.teamStats?.[0]?.value || 0} Available
                </span>
              </div>
            </div>

            {/* Responder status mini donut */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.teamStats}
                      innerRadius={28} outerRadius={38}
                      paddingAngle={4} dataKey="value"
                      animationDuration={900}
                    >
                      {data.teamStats.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  pointerEvents: "none"
                }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: T.navy }}>
                    {data.totalTeams || 0}
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                {data.teamStats.map((t, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: t.color, display: "inline-block",
                        boxShadow: `0 0 5px ${t.color}80`
                      }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.slate }}>{t.name}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 900, color: T.navy }}>{t.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available teams list */}
            <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, letterSpacing: 1.4, textTransform: "uppercase", margin: "0 0 8px" }}>
              Available Now
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 200, overflowY: "auto" }}>
              {data.availableTeams?.length === 0
                ? <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, textAlign: "center", padding: "12px 0" }}>No teams available</p>
                : data.availableTeams?.map((t, i) => (
                  <motion.div key={t.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: `${T.green}0A`, borderRadius: 10, padding: "9px 12px",
                      border: `1px solid ${T.green}20`
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: `${T.green}18`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      <Zap size={14} color={T.green} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 12, color: T.navy, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.name}
                      </p>
                      <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>Lead: {t.lead}</p>
                    </div>
                    <span style={{
                      fontSize: 8, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase",
                      padding: "2px 8px", borderRadius: 20,
                      background: `${T.green}18`, color: T.green, border: `1px solid ${T.green}30`
                    }}>Ready</span>
                  </motion.div>
                ))
              }
            </div>

            {/* Footer */}
            <div style={{
              marginTop: 14,
              background: `linear-gradient(135deg,${T.navy},${T.blue})`,
              borderRadius: 14, padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Shield size={15} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 12, margin: 0 }}>System Secure</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, margin: 0 }}>All channels encrypted · v2.4.0</p>
              </div>
              <Signal size={14} color={T.green} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.white, borderRadius: 20, padding: "22px 24px",
    border: `1.5px solid ${T.borderSoft}`,
    boxShadow: "0 2px 12px rgba(21,101,192,0.06)",
    ...style
  }}>
    {children}
  </div>
);

const SectionHead = ({ icon, title, inline = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: inline ? 0 : 16 }}>
    <div style={{
      width: 28, height: 28, borderRadius: 8, background: T.blueTint,
      border: `1px solid ${T.borderSoft}`, display: "flex", alignItems: "center", justifyContent: "center"
    }}>{icon}</div>
    <h3 style={{ fontWeight: 800, fontSize: 12, color: T.navy, margin: 0, letterSpacing: 0.4, textTransform: "uppercase" }}>
      {title}
    </h3>
  </div>
);

const Empty = ({ text = "No data yet" }) => (
  <div style={{ textAlign: "center", color: T.border, fontSize: 13, padding: "30px 0", fontWeight: 600 }}>
    {text}
  </div>
);

const StatCard = ({ stat }) => (
  <motion.div whileHover={{ y: -3, boxShadow: "0 10px 30px rgba(21,101,192,0.13)" }}
    style={{
      background: T.white, borderRadius: 20, padding: "20px 22px",
      border: `1.5px solid ${T.borderSoft}`,
      boxShadow: "0 2px 10px rgba(21,101,192,0.05)",
      display: "flex", alignItems: "center", gap: 16, cursor: "default", transition: "box-shadow 0.2s"
    }}>
    <div style={{
      width: 50, height: 50, borderRadius: 14, flexShrink: 0,
      background: stat.bg, border: `1.5px solid ${stat.color}25`,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <stat.icon size={22} color={stat.color} />
    </div>
    <div>
      <p style={{ fontSize: 9, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1.2, margin: 0 }}>
        {stat.label}
      </p>
      <p style={{ fontSize: 32, fontWeight: 900, color: T.navy, margin: 0, letterSpacing: -1.5, lineHeight: 1.05 }}>
        {stat.value}
      </p>
    </div>
  </motion.div>
);

const HeroBanner = ({ total, resolved, active, pct, totalTeams }) => (
  <div style={{
    background: `linear-gradient(130deg,${T.navy} 0%,${T.blueMid} 55%,${T.accent} 100%)`,
    borderRadius: 22, padding: "22px 30px",
    display: "flex", alignItems: "center", gap: 36, flexWrap: "wrap",
    boxShadow: `0 8px 32px ${T.blue}30`
  }}>
    <div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", margin: 0 }}>
        Resolution Rate
      </p>
      <p style={{ color: "#fff", fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: -2, lineHeight: 1 }}>
        {pct}<span style={{ fontSize: 20, fontWeight: 700, opacity: .6 }}>%</span>
      </p>
    </div>

    <div style={{ flex: 1, minWidth: 200 }}>
      <div style={{ height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.3, ease: "easeOut" }}
          style={{ height: "100%", background: "linear-gradient(90deg,#4DD0E1,#00E5FF)", borderRadius: 99 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{resolved} resolved</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{active} still active</span>
      </div>
    </div>

    <div style={{ display: "flex", gap: 30 }}>
      {[
        { label: "Total",      value: total,      color: "rgba(255,255,255,0.8)" },
        { label: "Resolved",   value: resolved,   color: "#4DD0E1" },
        { label: "Active",     value: active,     color: "#FF8A65" },
        { label: "Teams",      value: totalTeams, color: "#B2EBF2" },
      ].map((m, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <p style={{ fontSize: 24, fontWeight: 900, color: m.color, margin: 0, lineHeight: 1 }}>{m.value}</p>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: 0, marginTop: 3 }}>
            {m.label}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default DashboardPage;