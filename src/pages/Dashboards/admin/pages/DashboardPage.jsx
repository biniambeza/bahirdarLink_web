import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Droplets,
  Skull,
  Ambulance,
  Map,
  PlusCircle,
  Radio,
  Users,
} from "lucide-react";

// Mock incidents and stats for dashboard
const incidents = [
  {
    id: "FIR-021",
    category: "fire",
    title: "Residential Fire",
    location: "Kebele 11, Abay Mado",
    severity: "critical",
    status: "pending",
    time: "1m ago",
    reporter: "Guest_4421",
    icon: <Flame size={20} />,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    id: "CRM-109",
    category: "crime",
    title: "Street Robbery",
    location: "Grand Resort Area",
    severity: "high",
    status: "responding",
    time: "5m ago",
    reporter: "Dawit M. (Verified)",
    icon: <Skull size={20} />,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    id: "MED-332",
    category: "medical",
    title: "Emergency Childbirth",
    location: "Kebele 14",
    severity: "critical",
    status: "on-route",
    time: "8m ago",
    reporter: "Guest_1102",
    icon: <Ambulance size={20} />,
    color: "text-pink-500",
    bg: "bg-pink-50",
  },
  {
    id: "FLD-004",
    category: "flood",
    title: "Lake Overrun",
    location: "Tana Shore",
    severity: "moderate",
    status: "pending",
    time: "15m ago",
    reporter: "Kidus H. (Verified)",
    icon: <Droplets size={20} />,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
];

const stats = [
  { label: "Fire Response Efficiency", value: 82, color: "bg-red-500" },
  { label: "Medical Unit Availability", value: 45, color: "bg-pink-500" },
  { label: "Police Coverage", value: 91, color: "bg-[#0052CC]" },
];

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-black text-[#0052CC]">
          Dashboard Overview
        </h2>
        <p className="text-sm text-slate-500">
          Monitor system stats, alerts, and quick summaries.
        </p>
      </div>

      {/* Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-black text-slate-700 uppercase text-sm tracking-wider mb-2">
            Priority Alerts
          </h3>
          <AnimatePresence mode="popLayout">
            {incidents.map((em, idx) => (
              <IncidentCard key={em.id} em={em} index={idx} />
            ))}
          </AnimatePresence>
        </div>

        {/* Stats & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-6">
              Real-time Stats
            </h4>
            <div className="space-y-4">
              {stats.map((s, idx) => (
                <ProgressStat
                  key={idx}
                  label={s.label}
                  val={s.value}
                  color={s.color}
                />
              ))}
            </div>
          </div>

          <div className="bg-[#0052CC] rounded-2xl p-6 text-white shadow-xl shadow-blue-500/30">
            <h4 className="font-black text-xs uppercase tracking-widest text-blue-200 mb-4">
              Coordination Tools
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <ActionBtn icon={<PlusCircle />} label="New Report" />
              <ActionBtn icon={<Map />} label="Map View" />
              <ActionBtn icon={<Radio />} label="Dispatch" />
              <ActionBtn icon={<Users />} label="Officers" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const IncidentCard = ({ em, index }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl flex justify-between items-center"
  >
    <div className="flex items-center gap-4">
      <div
        className={`w-12 h-12 ${em.bg} ${em.color} rounded-xl flex items-center justify-center`}
      >
        {em.icon}
      </div>
      <div>
        <h5 className="font-black text-slate-800 text-sm">{em.title}</h5>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
          {em.location} • {em.time}
        </p>
        <p className="text-[10px] font-bold text-slate-400 mt-1">
          Reporter: <span className="text-slate-600">{em.reporter}</span>
        </p>
      </div>
    </div>
    <div className="flex flex-col items-end gap-2">
      <span
        className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${em.severity === "critical" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"}`}
      >
        {em.severity}
      </span>
      <button className="px-3 py-1 bg-[#0052CC] text-white text-[10px] font-black uppercase rounded-lg hover:scale-105 transition-all">
        Assign
      </button>
    </div>
  </motion.div>
);

const ProgressStat = ({ label, val, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
      <span>{label}</span>
      <span className="text-slate-800">{val}%</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${val}%` }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);

const ActionBtn = ({ icon, label }) => (
  <button className="flex flex-col items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 group">
    <span className="text-white mb-1">{icon}</span>
    <span className="text-[9px] font-black uppercase tracking-widest">
      {label}
    </span>
  </button>
);

export default DashboardPage;
