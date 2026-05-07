import React, { useState, useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  CheckCircle,
  Bell,
  Plus,
  Zap,
  FolderLock,
  Search,
  Target,
  Award,
  TrendingUp,
  Loader2,
} from "lucide-react";

const BASE_URL = "http://localhost:5000";

const ResponderDashboardPage = () => {
  // --- STATE ---
  const [incidents, setIncidents] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isServiceMode, setIsServiceMode] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [teamId, setTeamId] = useState(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchDashboardData = async () => {
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
        const serviceKeywords = [
          "municipal",
          "electric",
          "water",
          "health",
          "utility",
          "medical",
          "service",
        ];
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
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- DATA PROCESSING ---
  const { incidentChart, caseChart, dynamicStats, performance } =
    useMemo(() => {
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
        closed: cases.filter((c) => c.status?.toLowerCase() === "closed")
          .length,
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
          color: isServiceMode ? "text-emerald-600" : "text-rose-600",
          bg: isServiceMode ? "bg-emerald-50/50" : "bg-rose-50/50",
        },
        ...(!isServiceMode
          ? [
              {
                title: "Total Cases",
                value: cases.length,
                icon: FolderLock,
                color: "text-blue-600",
                bg: "bg-blue-50/50",
              },
            ]
          : []),
        {
          title: isServiceMode ? "In Field" : "Field Load",
          value: iCounts.active + (isServiceMode ? 0 : cCounts.pending),
          icon: Zap,
          color: "text-amber-600",
          bg: "bg-amber-50/50",
        },
        {
          title: "Resolved",
          value: totalResolved,
          icon: CheckCircle,
          color: "text-emerald-600",
          bg: "bg-emerald-50/50",
        },
      ];

      return {
        incidentChart: [
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
        ],
        caseChart: [
          { name: "Open", value: cCounts.open, color: "#3b82f6" },
          { name: "Pending", value: cCounts.pending, color: "#8b5cf6" },
          { name: "Closed", value: cCounts.closed, color: "#64748b" },
        ],
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
      };
    }, [incidents, cases, isServiceMode]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Syncing HQ Data...
        </p>
      </div>
    );

  const themeHex = isServiceMode ? "#10b981" : "#2563eb";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-12 font-sans">
      <div className="max-w-[1500px] mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">
              Bahir<span style={{ color: themeHex }}>Link</span>{" "}
              {isServiceMode ? "Service" : "HQ"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`h-2 w-2 rounded-full animate-pulse ${isServiceMode ? "bg-emerald-500" : "bg-blue-500"}`}
              />
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                {agencyInfo?.name || "Unit Dispatch"} | ID:{" "}
                {teamId ? String(teamId).slice(-6) : "GLOBAL"}
              </p>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm relative">
            <Bell size={20} className="text-slate-400" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
          </div>
        </header>

        {/* Stats Grid */}
        <div
          className={`grid gap-5 mb-8 ${isServiceMode ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}
        >
          {dynamicStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm"
            >
              <div
                className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}
              >
                <stat.icon size={22} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {stat.title}
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>

        {/* Graphs - Reduced Width & Height */}
        <div
          className={`grid gap-8 mb-8 ${isServiceMode ? "grid-cols-1 max-w-3xl" : "grid-cols-1 lg:grid-cols-2"}`}
        >
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 text-slate-500">
              {isServiceMode ? "Activity Distribution" : "Incident Load"}
            </h2>
            <div className="w-full h-72">
              {" "}
              {/* Reduced height to h-72 */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incidentChart}
                  margin={{ top: 0, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 6, 6]}
                    barSize={isServiceMode ? 50 : 30}
                  >
                    {incidentChart.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {!isServiceMode && (
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
              <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 text-slate-500">
                Case Portfolio
              </h2>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={caseChart}
                    margin={{ top: 0, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={30}>
                      {caseChart.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Efficiency Matrix */}
        <div
          className={`grid gap-8 mb-8 items-stretch ${isServiceMode ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"}`}
        >
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]">
            <TrendingUp
              className="absolute -left-4 -bottom-4 text-slate-50"
              size={120}
            />
            <div className="relative z-10 text-center">
              <div
                className={`w-14 h-14 rounded-full ${isServiceMode ? "bg-emerald-50" : "bg-blue-50"} flex items-center justify-center mb-4 mx-auto`}
              >
                <Target style={{ color: themeHex }} size={24} />
              </div>
              <h2 className="text-4xl font-black text-slate-900">
                {performance.successRate}%
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                Efficiency
              </p>
            </div>
          </div>

          <div
            className={`${isServiceMode ? "" : "lg:col-span-2"} bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-center`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Resolution Tracking
              </h2>
              <Award className="text-amber-500" size={18} />
            </div>
            <div className="space-y-8">
              <ProgressItem
                label={isServiceMode ? "Task Completion" : "Emergency Response"}
                val={performance.iRate}
                color={isServiceMode ? "bg-emerald-500" : "bg-rose-500"}
              />
              {!isServiceMode && (
                <ProgressItem
                  label="Case Closure"
                  val={performance.cRate}
                  color="bg-blue-600"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 h-full">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">
                  Operation Summary
                </h2>
                <Search size={16} className="text-slate-300" />
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                <SummaryCard
                  label="Pending"
                  val={incidentChart[0].value}
                  color={isServiceMode ? "text-emerald-600" : "text-rose-600"}
                  sub="Queue"
                />
                <SummaryCard
                  label="Active"
                  val={incidentChart[1].value}
                  color="text-amber-600"
                  sub="In-Field"
                />
                <SummaryCard
                  label="Cleared"
                  val={incidentChart[2].value}
                  color="text-emerald-600"
                  sub="Archived"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 h-full">
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden flex flex-col justify-center h-full shadow-xl min-h-[250px]">
              <Zap
                className="absolute -right-8 -bottom-8 text-white/5"
                size={180}
              />
              <h3 className="text-lg font-black mb-1 relative z-10">Control</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 relative z-10">
                Fast Access
              </p>
              <div className="grid grid-cols-1 gap-3 relative z-10">
                <button
                  className={`w-full p-4 ${isServiceMode ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500"} rounded-2xl flex items-center justify-between transition-all active:scale-95`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    New {isServiceMode ? "Entry" : "Incident"}
                  </span>
                  <Plus size={18} />
                </button>
                <button className="w-full p-4 bg-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-700 transition-all active:scale-95">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Archive
                  </span>
                  <FolderLock size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
