import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Droplets, Skull, Ambulance, Radio, 
  Search, Clock, User, UserX, MapPin, 
  ChevronRight, Activity, AlertTriangle
} from "lucide-react";

// Import your new Detail component
import IncidentDetail from "./IncidentDetail"; 

const CATEGORY_STYLE = {
  fire: { icon: <Flame size={16} />, color: "text-orange-600", bg: "bg-orange-50" },
  crime: { icon: <Skull size={16} />, color: "text-purple-600", bg: "bg-purple-50" },
  medical: { icon: <Ambulance size={16} />, color: "text-rose-600", bg: "bg-rose-50" },
  flood: { icon: <Droplets size={16} />, color: "text-cyan-600", bg: "bg-cyan-50" },
  default: { icon: <Radio size={16} />, color: "text-slate-600", bg: "bg-slate-50" },
};

const DashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Slide Panel States
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/emergencies/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setReports(data.data || []);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        if (filter === "registered") return r.reporterType === "user";
        if (filter === "guest") return r.reporterType === "guest";
        return true;
      })
      .filter((r) => {
        const pool = `${r.emergencyType} ${r.category} ${r.reporterName} ${r.kebele}`.toLowerCase();
        return pool.includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [filter, searchQuery, reports]);

  // Drawer Control Logic
  const handleOpenDetail = (report) => {
    setSelectedReport(report);
    setIsDrawerOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDrawerOpen(false);
    // Timeout prevents content from disappearing mid-slide
    setTimeout(() => setSelectedReport(null), 300);
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] overflow-x-hidden">
      {/* Background Dimmer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseDetail}
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-40"
          />
        )}
      </AnimatePresence>

      <div className="p-4 lg:p-8">
        <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Incident <span className="text-blue-600">Control</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Response Dashboard</p>
          </div>
          
          <div className="flex gap-3">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                      type="text" 
                      placeholder="Search..." 
                      className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
              <div className="flex bg-slate-200/50 p-1 rounded-xl">
                  {["all", "registered", "guest"].map(t => (
                      <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${filter === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>{t}</button>
                  ))}
              </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3 space-y-4">
              <SmallStat label="Pending" val={reports.filter(r => r.status !== 'resolved').length} color="text-orange-600" />
              <SmallStat label="Total" val={reports.length} color="text-blue-600" />
          </div>

          <div className="col-span-12 lg:col-span-9 space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report) => (
                <CompactIncidentCard 
                  key={report.id} 
                  report={report} 
                  onClick={() => handleOpenDetail(report)} 
                />
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* The Slide-from-Right Detail Panel */}
      <IncidentDetail 
        report={selectedReport} 
        isOpen={isDrawerOpen} 
        onClose={handleCloseDetail} 
      />
    </div>
  );
};

/* --- COMPACT INCIDENT CARD --- */
const CompactIncidentCard = ({ report, onClick }) => {
  const style = CATEGORY_STYLE[report.category?.toLowerCase()] || CATEGORY_STYLE.default;
  const isRegistered = report.reporterType === "user";
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="group bg-white border border-slate-200 hover:border-blue-400 p-2 pr-4 rounded-xl cursor-pointer transition-all flex items-center gap-4 shadow-sm"
    >
      <div className={`w-10 h-10 shrink-0 rounded-lg ${style.bg} ${style.color} flex items-center justify-center`}>
        {style.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-xs font-black text-slate-800 truncate uppercase tracking-tight">
            {report.emergencyType || report.category}
          </h3>
          <div className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="text-[10px] font-bold text-slate-400 truncate">
            {report.kebele || "Location Pending"}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-400">
                {isRegistered ? <User size={10} className="text-blue-500" /> : <UserX size={10} />}
                <span className="text-[9px] font-bold truncate max-w-[100px]">
                    {report.reporterName || "Guest"}
                </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
                <Clock size={10} />
                <span className="text-[9px] font-bold">
                    {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </span>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border ${
            report.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
        }`}>
            {report.status || 'Active'}
        </span>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
      </div>
    </motion.div>
  );
};

const SmallStat = ({ label, val, color }) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-xl font-black ${color}`}>{val}</p>
    </div>
);

export default DashboardPage;