import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  AlertTriangle, Car, Clock, CheckCircle, Activity,
  Shield, Signal, Loader2, RefreshCw, Radio, MapPin, 
  ChevronRight, Calendar, Layers, Bell, TrendingUp, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, XAxis, Tooltip
} from "recharts";

// Import your existing IncidentDetails component
import IncidentDetails from "./IncidentDetailPage"; 

// --- Configuration ---
const API_BASE_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";
const COLORS = {
  primary: "#0052CC",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  slate: "#64748b"
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null); // NEW: For the slide panel
  const socketRef = useRef();
  
  const [data, setData] = useState({
    stats: [],
    incidents: [],
    units: [],
    totalUnits: 0,
    trend: []
  });

  const fetchDashboardData = useCallback(async (isInitial = false) => {
    const token = localStorage.getItem("token");
    const storedAgency = JSON.parse(localStorage.getItem("agency") || "{}");
    setAgencyInfo(storedAgency);

    if (!storedAgency.id) return;

    const config = { headers: { Authorization: `Bearer ${token}` } };
    if (isInitial) setLoading(true);
    else setIsSyncing(true);

    try {
      const [emergencyRes, teamRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/emergencies/agency/${storedAgency.id}/emergencies`, config),
        axios.get(`${API_BASE_URL}/responderTeam/agency/${storedAgency.id}`, config)
      ]);

      const allEmergencies = emergencyRes.data.data || [];
      const allTeams = teamRes.data.data || [];

      const activeCount = allEmergencies.filter(e => e.status !== "resolved").length;
      const resolvedCount = allEmergencies.filter(e => e.status === "resolved").length;

      const unitStats = [
        { name: "Available", value: allTeams.filter(t => t.status === "available").length, color: COLORS.success },
        { name: "Busy", value: allTeams.filter(t => t.status === "busy").length, color: COLORS.danger },
        { name: "Offline", value: allTeams.filter(t => t.status === "offline").length, color: COLORS.warning },
      ];

      setData({
        stats: [
          { title: "Total Incidents", value: allEmergencies.length, icon: Activity, color: "from-blue-600 to-cyan-500" },
          { title: "Active Emergencies", value: activeCount, icon: AlertTriangle, color: "from-rose-500 to-red-600" },
          { title: "Responder Teams", value: allTeams.length, icon: Car, color: "from-indigo-500 to-purple-600" },
          { title: "Resolved Cases", value: resolvedCount, icon: CheckCircle, color: "from-emerald-400 to-teal-600" },
        ],
        incidents: allEmergencies.slice(0, 6).map(e => ({
          id: e._id || e.id,
          category: e.categoryId?.name || "Uncategorized",
          type: e.emergencyTypeId?.name || "Emergency Report",
          location: e.kebele?.name || e.street || "Unknown Area",
          time: new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(e.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          status: e.status,
          raw: e // NEW: Keep raw data for the detail panel
        })),
        units: unitStats,
        totalUnits: allTeams.length,
        trend: [
          { name: "00:00", val: Math.floor(activeCount * 0.4) }, 
          { name: "08:00", val: Math.floor(activeCount * 0.7) },
          { name: "12:00", val: activeCount },
          { name: "16:00", val: activeCount + 1 },
          { name: "20:00", val: Math.max(0, activeCount - 1) }
        ]
      });
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(true);
    const token = localStorage.getItem("token");
    socketRef.current = io(SOCKET_URL, { auth: { token: `Bearer ${token}` } });
    socketRef.current.on("newEmergency", () => fetchDashboardData());
    return () => socketRef.current.disconnect();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F4F7FE]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <Loader2 className="text-blue-600" size={48} />
        </motion.div>
        <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">Synchronizing HQ Command...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-4 lg:p-8 font-sans text-slate-900 relative overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Shield size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">Tactical Overview</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            {agencyInfo?.name}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network</p>
                <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-sm">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    ENCRYPTED LINK
                </div>
            </div>
            <button 
                onClick={() => fetchDashboardData()}
                className="group flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-blue-900/5 hover:border-blue-300 transition-all active:scale-95"
            >
                <RefreshCw size={18} className={`${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} />
                <span className="font-black text-xs text-slate-700 tracking-widest uppercase">Refresh Hub</span>
            </button>
        </div>
      </header>

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {data.stats.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-5 group"
          >
            <div className={`p-4 rounded-3xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-0.5">{stat.title}</p>
              <h2 className="text-3xl font-black text-slate-800">{stat.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* RECENT INCIDENTS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase text-sm tracking-widest">
              <span className="h-6 w-1 bg-blue-600 rounded-full" />
              Recent Dispatch Log
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-white border rounded-lg text-[10px] font-black text-slate-500 uppercase">
                <Clock size={12} /> Live Updates
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {data.incidents.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-bold italic text-sm">No recent incidents detected in the current sector.</p>
                </div>
              ) : (
                data.incidents.map((inc, i) => (
                  <motion.div 
                    key={inc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedIncident(inc.raw)} // NEW: Trigger detail panel
                    className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-md shadow-blue-900/5 hover:border-blue-400 cursor-pointer transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-5">
                        <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <Radio size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-xl font-black text-slate-800 leading-none">{inc.type}</h4>
                                {/* Prominent Category Display */}
                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 border ${
                                    inc.category.toLowerCase().includes('drug') 
                                    ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                    : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                    <Layers size={10} /> {inc.category}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 font-bold text-xs">
                                <span className="flex items-center gap-1"><MapPin size={14} /> {inc.location}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="flex items-center gap-1"><Clock size={14} /> {inc.time}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            inc.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                            {inc.status}
                        </div>
                        <button className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ANALYTICS SIDEBAR */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 border border-slate-100">
            <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest mb-8 flex items-center gap-2">
                <TrendingUp size={14} className="text-blue-600" /> Unit Distribution
            </h3>
            <div className="h-[200px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.units} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                    {data.units.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-3xl font-black text-slate-800 leading-none">{data.totalUnits}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Teams</p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {data.units.map(u => (
                <div key={u.name} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full shadow-sm" style={{backgroundColor: u.color}} />
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{u.name}</span>
                  </div>
                  <span className="text-lg font-black text-slate-800">{u.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
                <div className="bg-blue-600/20 p-3 rounded-2xl w-fit mb-4">
                    <Bell size={24} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-black mb-2">Protocol Advisory</h3>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">Data ingestion active. High density areas flagged in sector 7.</p>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-10"><Shield size={120} /></div>
          </div>
        </aside>
      </div>

      {/* DETAIL SIDE PANEL (SLIDE FROM RIGHT) */}
      <AnimatePresence>
        {selectedIncident && (
          <IncidentDetails 
            incident={selectedIncident} 
            onClose={() => setSelectedIncident(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default DashboardPage;