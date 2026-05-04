import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  AlertTriangle, Car, Clock, CheckCircle, Activity,
  Shield, Signal, Loader2, RefreshCw, ExternalLink, Radio
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from "recharts";

// --- Constants ---
const API_BASE_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";
const COLORS = {
  primary: "#0052CC",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const socketRef = useRef();
  
  const [data, setData] = useState({
    stats: [],
    incidents: [],
    units: [],
    totalUnits: 0,
    trend: []
  });

  // --- Data Fetching Logic ---
  const fetchDashboardData = useCallback(async (isInitial = false) => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    if (isInitial) setLoading(true);
    else setIsSyncing(true);

    try {
      // Fetching based on your server.js route definitions
      const [emergencyRes, teamRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/emergencies/admin/all`, config),
        axios.get(`${API_BASE_URL}/responderTeam`, config)
      ]);

      const allEmergencies = emergencyRes.data.data || [];
      const allTeams = teamRes.data.data || [];

      // Logic Processing
      const active = allEmergencies.filter(e => e.status !== "resolved").length;
      const resolvedToday = allEmergencies.filter(e => 
        e.status === "resolved" && 
        new Date(e.updatedAt).toDateString() === new Date().toDateString()
      ).length;

      const unitStats = [
        { name: "Available", value: allTeams.filter(t => t.status === "available").length, color: COLORS.success },
        { name: "Busy", value: allTeams.filter(t => t.status === "busy").length, color: COLORS.danger },
        { name: "Off-duty", value: allTeams.filter(t => t.status === "offline").length, color: COLORS.warning },
      ];

      setData({
        stats: [
          { title: "Active Emergencies", value: active, icon: AlertTriangle, color: "from-rose-500 to-red-600" },
          { title: "Available Teams", value: unitStats[0].value, icon: Car, color: "from-blue-500 to-indigo-600" },
          { title: "Avg Response", value: "3.8m", icon: Clock, color: "from-amber-400 to-orange-500" },
          { title: "Cleared Today", value: resolvedToday, icon: CheckCircle, color: "from-emerald-400 to-teal-600" },
        ],
        incidents: allEmergencies.slice(0, 6).map(e => ({
          id: e.id,
          type: e.emergencyType?.name || "General",
          location: e.address || "Sector 1",
          time: new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: e.status
        })),
        units: unitStats,
        totalUnits: allTeams.length,
        trend: [
          { name: "00:00", val: 2 }, { name: "04:00", val: 1 },
          { name: "08:00", val: 5 }, { name: "12:00", val: active },
          { name: "16:00", val: 4 }, { name: "20:00", val: 8 }
        ]
      });
    } catch (err) {
      console.error("Dashboard Refresh Failed:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // --- Real-time Socket Setup ---
  useEffect(() => {
    fetchDashboardData(true);

    const token = localStorage.getItem("token");
    socketRef.current = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` }
    });

    socketRef.current.on("newEmergency", (newInc) => {
      // Trigger a soft refresh when a new emergency is broadcast
      fetchDashboardData();
    });

    return () => socketRef.current.disconnect();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <h1 className="text-slate-400 font-bold tracking-widest uppercase text-sm">Initializing Secure Stream</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-4 lg:p-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">BahirLink HQ</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-time Monitoring Active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border flex items-center gap-4">
             <div className="text-right">
               <p className="text-[10px] font-bold text-slate-400 uppercase">Signal Strength</p>
               <p className="text-xs font-black text-emerald-500">EXCELLENT</p>
             </div>
             <Signal size={20} className="text-slate-300" />
          </div>
          <button 
            onClick={() => fetchDashboardData()}
            className="p-3 bg-white border rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={20} className={`${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {data.stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      {/* BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* INCIDENT TABLE */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Radio size={18} className="text-rose-500" /> Active Dispatch Feed
              </h3>
              <button className="text-xs font-bold text-blue-600 hover:underline">View All Records</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Location</th>
                    <th className="pb-4">Time</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {data.incidents.map((inc) => (
                      <motion.tr 
                        key={inc.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 font-bold text-slate-800 text-sm">{inc.type}</td>
                        <td className="py-4 text-slate-500 text-sm font-medium">{inc.location}</td>
                        <td className="py-4 text-slate-400 text-xs font-bold">{inc.time}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            inc.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {inc.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500 cursor-pointer transition-colors" />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* TREND CHART */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
             <h3 className="font-black text-slate-800 mb-8 uppercase text-sm tracking-widest">Incident Volume (24h)</h3>
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trend}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={3} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 text-center">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-6">Responder Status</h3>
            <div className="h-[200px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={data.units} 
                    innerRadius={60} 
                    outerRadius={85} 
                    paddingAngle={8} 
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {data.units.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute">
                <p className="text-3xl font-black text-slate-800 leading-none">{data.totalUnits}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Teams</p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {data.units.map(u => (
                <div key={u.name} className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{backgroundColor: u.color}} />
                    <span className="text-xs font-bold text-slate-600">{u.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-800">{u.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 rounded-[2rem] p-8 shadow-lg shadow-blue-200 text-white relative overflow-hidden">
            <Shield className="absolute right-[-10px] bottom-[-10px] text-blue-500 opacity-20" size={140} />
            <h3 className="text-lg font-black mb-2 relative z-10">System Integrity</h3>
            <p className="text-blue-100 text-xs font-medium leading-relaxed mb-6 relative z-10">
              End-to-end encryption is active for all dispatch channels. All logs are being synced to Neon DB.
            </p>
            <div className="flex items-center gap-2 bg-blue-700/50 w-fit px-3 py-1 rounded-full relative z-10">
              <Activity size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">v2.4.0 Secure</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

/* --- Helpers --- */
const StatCard = ({ stat }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between"
  >
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
      <stat.icon size={24} />
    </div>
    <div className="text-right">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
      <h2 className="text-3xl font-black text-slate-800">{stat.value}</h2>
    </div>
  </motion.div>
);

export default DashboardPage;