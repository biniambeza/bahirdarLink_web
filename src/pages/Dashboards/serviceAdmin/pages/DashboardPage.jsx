import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Droplets,
  Building2,
  HeartPulse,
  AlertTriangle,
  Users,
  Map,
  Radio,
  PlusCircle,
} from "lucide-react";

// Real system-based incidents (mapped to your service types)
const incidents = [
  {
    id: "ELE-001",
    category: "electric",
    title: "Power Outage",
    location: "Kebele 12",
    severity: "critical",
    status: "pending",
    time: "2m ago",
    reporter: "User_102",
    icon: <Zap size={20} />,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  {
    id: "WAT-102",
    category: "water",
    title: "Pipe Leakage",
    location: "Kebele 05",
    severity: "high",
    status: "responding",
    time: "6m ago",
    reporter: "User_88",
    icon: <Droplets size={20} />,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    id: "MUN-221",
    category: "municipal",
    title: "Blocked Drainage",
    location: "City Center",
    severity: "moderate",
    status: "pending",
    time: "10m ago",
    reporter: "User_55",
    icon: <Building2 size={20} />,
    color: "text-gray-500",
    bg: "bg-gray-50",
  },
  {
    id: "HEA-311",
    category: "health",
    title: "Severe Injury",
    location: "Kebele 09",
    severity: "critical",
    status: "on-route",
    time: "12m ago",
    reporter: "User_21",
    icon: <HeartPulse size={20} />,
    color: "text-red-500",
    bg: "bg-red-50",
  },
];

const stats = [
  { label: "Electric Response Efficiency", value: 78, color: "bg-yellow-500" },
  { label: "Water Response Efficiency", value: 65, color: "bg-blue-500" },
  { label: "Municipal Response Efficiency", value: 72, color: "bg-gray-500" },
  { label: "Health Response Efficiency", value: 88, color: "bg-red-500" },
];

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-black text-[#0052CC]">
          Service Emergency Dashboard
        </h2>
        <p className="text-sm text-slate-500">
          Monitor all service emergencies in real time.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents */}
        <div className="space-y-4">
          <h3 className="font-black text-slate-700 uppercase text-sm tracking-wider">
            Active Emergencies
          </h3>

          <AnimatePresence mode="popLayout">
            {incidents.map((em, idx) => (
              <IncidentCard key={em.id} em={em} index={idx} />
            ))}
          </AnimatePresence>
        </div>

        {/* Stats + Actions */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-6">
              System Performance
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

          {/* Actions */}
          <div className="bg-[#0052CC] rounded-2xl p-6 text-white shadow-xl">
            <h4 className="font-black text-xs uppercase tracking-widest text-blue-200 mb-4">
              Coordination Tools
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <ActionBtn icon={<PlusCircle />} label="New Alert" />
              <ActionBtn icon={<Map />} label="Map View" />
              <ActionBtn icon={<Radio />} label="Dispatch" />
              <ActionBtn icon={<Users />} label="Teams" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------- Components ----------------

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
        className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
          em.severity === "critical"
            ? "bg-red-100 text-red-600"
            : "bg-slate-100 text-slate-600"
        }`}
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
  <button className="flex flex-col items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10">
    <span className="text-white mb-1">{icon}</span>
    <span className="text-[9px] font-black uppercase tracking-widest">
      {label}
    </span>
  </button>
);

export default DashboardPage;
