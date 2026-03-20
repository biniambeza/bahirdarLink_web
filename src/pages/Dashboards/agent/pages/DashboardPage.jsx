import React from "react";
import { AlertTriangle, Car, Clock, CheckCircle } from "lucide-react";
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
} from "recharts";

/* ================= MAIN DASHBOARD ================= */

const DashboardPage = () => {
  const stats = [
    {
      title: "Active Incidents",
      value: "8",
      icon: AlertTriangle,
      color: "from-red-500 to-orange-500",
      bg: "bg-red-50",
    },
    {
      title: "Available Units",
      value: "12",
      icon: Car,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
    },
    {
      title: "Response Time",
      value: "3.8m",
      icon: Clock,
      color: "from-yellow-500 to-orange-400",
      bg: "bg-yellow-50",
    },
    {
      title: "Resolved Today",
      value: "7",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
    },
  ];

  const incidents = [
    {
      id: "INC-001",
      title: "Road Accident",
      location: "Ring Road",
      time: "2 min ago",
      status: "Active",
    },
    {
      id: "INC-002",
      title: "Fire Outbreak",
      location: "Market Area",
      time: "10 min ago",
      status: "Responding",
    },
  ];

  const incidentTrend = [
    { time: "6AM", incidents: 2 },
    { time: "9AM", incidents: 5 },
    { time: "12PM", incidents: 3 },
    { time: "3PM", incidents: 4 },
    { time: "6PM", incidents: 7 },
    { time: "9PM", incidents: 8 },
  ];

  const unitStatus = [
    { name: "Available", value: 8, color: "#10B981" },
    { name: "Busy", value: 4, color: "#EF4444" },
    { name: "Maintenance", value: 2, color: "#F59E0B" },
  ];

  return (
    <div className="space-y-8">
      {/* TITLE */}
      <div>
        <h2 className="text-3xl font-black text-[#0052CC] tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-gray-500 text-sm">
          Real-time emergency monitoring system
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INCIDENTS + TREND */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-black text-gray-700 mb-4 uppercase text-sm tracking-widest">
              Active Incidents
            </h3>
            <div className="space-y-4">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition"
                >
                  <div>
                    <p className="font-bold text-gray-800">{inc.title}</p>
                    <p className="text-xs text-gray-400">
                      {inc.location} • {inc.time}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600">
                    {inc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* INCIDENT TREND LINE CHART */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-black text-gray-700 mb-4 uppercase text-sm tracking-widest">
              Incidents Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={incidentTrend}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  stroke="#EF4444"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="space-y-6">
          {/* UNITS PIE CHART */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-black text-gray-700 text-sm mb-4 uppercase">
              Units Status
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={unitStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {unitStatus.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* SYSTEM STATUS */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-black text-gray-700 text-sm mb-4 uppercase">
              System Status
            </h3>
            <div className="space-y-3 text-sm">
              <SystemItem label="GPS Tracking" status="Active" />
              <SystemItem label="Dispatch System" status="Running" />
              <SystemItem label="Network" status="Stable" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

/* ================= COMPONENTS ================= */

const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`p-6 rounded-2xl shadow ${stat.bg} relative overflow-hidden`}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">{stat.title}</p>
          <h2 className="text-2xl font-black text-gray-800">{stat.value}</h2>
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}
        >
          <Icon size={20} />
        </div>
      </div>
      <div
        className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`}
      />
    </motion.div>
  );
};

const SystemItem = ({ label, status }) => (
  <div className="flex justify-between">
    <span>{label}</span>
    <span className="text-green-500 font-bold">{status}</span>
  </div>
);
