import React from "react";
import {
  AlertTriangle,
  Car,
  Clock,
  CheckCircle,
  Activity,
  Shield,
  Signal,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

/* ================= THEMES & DATA ================= */

const COLORS = {
  primary: "#0052CC",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
};

const incidentTrend = [
  { time: "6AM", incidents: 2 },
  { time: "9AM", incidents: 5 },
  { time: "12PM", incidents: 3 },
  { time: "3PM", incidents: 4 },
  { time: "6PM", incidents: 7 },
  { time: "9PM", incidents: 8 },
];

const unitStatus = [
  { name: "Available", value: 8, color: COLORS.success },
  { name: "Busy", value: 4, color: COLORS.danger },
  { name: "Maintenance", value: 2, color: COLORS.warning },
];

/* ================= MAIN DASHBOARD ================= */

const DashboardPage = () => {
  const stats = [
    {
      title: "Active Incidents",
      value: "08",
      icon: AlertTriangle,
      color: "from-rose-500 to-red-600 shadow-rose-200",
    },
    {
      title: "Available Units",
      value: "12",
      icon: Car,
      color: "from-blue-500 to-indigo-600 shadow-blue-200",
    },
    {
      title: "Response Time",
      value: "3.8m",
      icon: Clock,
      color: "from-amber-400 to-orange-500 shadow-amber-200",
    },
    {
      title: "Resolved Today",
      value: "07",
      icon: CheckCircle,
      color: "from-emerald-400 to-teal-600 shadow-emerald-200",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 font-sans text-slate-900 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-100/50 rounded-full blur-[120px] -z-10" />

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent tracking-tight">
            Command Center
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-slate-500 font-medium text-sm">
              System Live: All services operational
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition">
            Export Report
          </button>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:scale-105 transition active:scale-95">
            Dispatch Unit
          </button>
        </div>
      </header>

      {/* STATS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <StatCard key={i} stat={stat} index={i} />
        ))}
      </section>

      {/* MAIN CONTENT GRID */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INCIDENTS LIST & TREND */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center gap-2">
                <Activity size={18} className="text-blue-500" />
                Recent Activity
              </h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase">
                Live Feed
              </span>
            </div>
            <div className="space-y-4">
              {[
                {
                  id: "INC-001",
                  title: "Road Accident",
                  location: "Ring Road",
                  time: "2 min ago",
                  status: "Critical",
                },
                {
                  id: "INC-002",
                  title: "Fire Outbreak",
                  location: "Market Area",
                  time: "10 min ago",
                  status: "Responding",
                },
                {
                  id: "INC-003",
                  title: "Medical Call",
                  location: "B-2 Sector",
                  time: "15 min ago",
                  status: "Resolved",
                },
              ].map((inc) => (
                <IncidentListItem key={inc.id} inc={inc} />
              ))}
            </div>
          </div>

          {/* INCIDENT TREND AREA CHART */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <h3 className="font-black text-white text-lg uppercase tracking-tight mb-8">
              Incident Inflow Trend
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incidentTrend}>
                  <defs>
                    <linearGradient
                      id="colorIncidents"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    stroke="#64748B"
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border: "none",
                      borderRadius: "12px",
                      color: "white",
                    }}
                    itemStyle={{ color: "#60A5FA" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="incidents"
                    stroke="#3B82F6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorIncidents)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SIDE PANEL */}
        <aside className="space-y-8">
          {/* UNITS STATUS - REFINED PIE CHART */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 text-center">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6">
              Units Allocation
            </h3>
            <div className="h-[200px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unitStatus}
                    dataKey="value"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    cornerRadius={12}
                  >
                    {unitStatus.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">14</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Total Units
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {unitStatus.map((s) => (
                <div key={s.name} className="flex flex-col items-center">
                  <div
                    className="w-2 h-2 rounded-full mb-1"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-[10px] font-black text-slate-800 uppercase">
                    {s.value}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SYSTEM HEALTH */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
            <h3 className="font-black text-slate-800 text-sm mb-6 uppercase tracking-widest">
              Core Infrastructure
            </h3>
            <div className="space-y-5">
              <SystemItem
                icon={Shield}
                label="Security Protocol"
                status="Encrypted"
              />
              <SystemItem
                icon={Signal}
                label="Network Load"
                status="Stable (24ms)"
              />
              <SystemItem
                icon={Activity}
                label="Response Engine"
                status="Optimized"
              />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default DashboardPage;

/* ================= COMPONENTS ================= */

const StatCard = ({ stat, index }) => {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/30 relative overflow-hidden group cursor-default"
    >
      <div className="flex justify-between items-start mb-6">
        <div
          className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}
        >
          <Icon size={24} />
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
            {stat.title}
          </p>
          <h2 className="text-4xl font-black text-slate-800 leading-none">
            {stat.value}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
        <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">
          +12.5%
        </span>
        <span>vs last hour</span>
      </div>
    </motion.div>
  );
};

const IncidentListItem = ({ inc }) => (
  <motion.div
    whileHover={{ x: 10 }}
    className="flex items-center justify-between p-5 bg-[#F1F5F9]/50 border border-transparent hover:border-white hover:bg-white rounded-[1.5rem] transition-all cursor-pointer shadow-sm hover:shadow-lg"
  >
    <div className="flex items-center gap-5">
      <div
        className={`h-3 w-3 rounded-full ${inc.status === "Critical" ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]" : "bg-emerald-500"} animate-pulse`}
      />
      <div>
        <p className="font-black text-slate-800 text-base">{inc.title}</p>
        <p className="text-xs text-slate-500 font-medium">
          {inc.location} <span className="mx-2 text-slate-300">|</span>{" "}
          {inc.time}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-right hidden md:block">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {inc.id}
        </p>
        <p className="text-xs font-bold text-slate-600">{inc.status}</p>
      </div>
      <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-slate-300 border border-slate-100 hover:text-blue-600 hover:border-blue-100 transition">
        <Activity size={18} />
      </div>
    </div>
  </motion.div>
);

const SystemItem = ({ icon: Icon, label, status }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors">
    <div className="flex items-center gap-3">
      <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
        <Icon size={18} />
      </div>
      <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
        {label}
      </span>
    </div>
    <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
      {status}
    </span>
  </div>
);
