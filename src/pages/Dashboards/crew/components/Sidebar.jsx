import {
  BarChart2,
  Ambulance,
  FileText,
  Settings,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

const CrewSidebar = ({ sidebarOpen, active, setActive }) => {
  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 90 }}
      className="h-screen bg-gradient-to-b from-green-700 to-green-900 text-white flex flex-col shadow-2xl"
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-700 font-bold">
          🚑
        </div>

        {sidebarOpen && (
          <span className="font-bold text-lg tracking-tight">Crew Unit</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2 mt-6">
        <NavItem
          icon={<BarChart2 />}
          label="Dashboard"
          active={active === "dashboard"}
          open={sidebarOpen}
          onClick={() => setActive("dashboard")}
        />

        {/* 🚑 Missions (replaces Incidents) */}
        <NavItem
          icon={<Ambulance />}
          label="Missions"
          active={active === "missions"}
          open={sidebarOpen}
          onClick={() => setActive("missions")}
        />

        {/* ⚡ Active Incident (real-time focus) */}
        <NavItem
          icon={<Activity />}
          label="Active"
          active={active === "active"}
          open={sidebarOpen}
          onClick={() => setActive("active")}
        />

        {/* 📝 Reports (replaces Cases) */}
        <NavItem
          icon={<FileText />}
          label="Reports"
          active={active === "reports"}
          open={sidebarOpen}
          onClick={() => setActive("reports")}
        />

        <NavItem
          icon={<Settings />}
          label="Settings"
          active={active === "settings"}
          open={sidebarOpen}
          onClick={() => setActive("settings")}
        />
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="p-4 text-xs text-green-200 text-center">
          Crew Field Operations 🚑
        </div>
      )}
    </motion.aside>
  );
};

const NavItem = ({ icon, label, active, open, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
      active
        ? "bg-white/20 text-white shadow-inner"
        : "text-green-100 hover:bg-white/10"
    }`}
  >
    <span>{icon}</span>

    {open && (
      <span className="text-sm font-bold uppercase tracking-widest">
        {label}
      </span>
    )}
  </button>
);

export default CrewSidebar;
