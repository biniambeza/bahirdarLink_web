import React from "react";
import {
  LogOut,
  LayoutDashboard, // Modern Dashboard
  UserCircle2,     // Refined Users
  ClipboardList,   // Professional Reports
  Zap,             // High-energy Agents
  Globe2,          // Better Map/Kebele icon
  Component,       // Modern Category icon
  Settings2,       // Refined Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({
  sidebarOpen,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 280 : 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-[#0052CC] h-screen flex flex-col relative z-40"
    >
      {/* Brand Section */}
      <div className="p-8 mb-4">
        <h1 className="text-white text-2xl font-black tracking-tighter">
          {sidebarOpen ? (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              BAHIR<span className="font-light opacity-80">LINK</span>
            </motion.span>
          ) : (
            "B."
          )}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col pt-2">
        <SidebarLink
          active={selectedCategory === "dashboard"}
          icon={<LayoutDashboard size={22} strokeWidth={2.2} />}
          label="Dashboard"
          open={sidebarOpen}
          onClick={() => setSelectedCategory("dashboard")}
        />

        <SidebarLink
          active={selectedCategory === "users"}
          icon={<UserCircle2 size={22} strokeWidth={2.2} />}
          label="Users"
          open={sidebarOpen}
          onClick={() => setSelectedCategory("users")}
        />

        <SidebarLink
          active={selectedCategory === "reports"}
          icon={<ClipboardList size={22} strokeWidth={2.2} />}
          label="Reports"
          open={sidebarOpen}
          onClick={() => setSelectedCategory("reports")}
        />

        <SidebarLink
          active={selectedCategory === "agents"}
          icon={<Zap size={22} strokeWidth={2.2} fill={selectedCategory === "agents" ? "currentColor" : "none"} />}
          label="Agents"
          open={sidebarOpen}
          onClick={() => setSelectedCategory("agents")}
        />

        <SidebarLink
          active={selectedCategory === "kebele"}
          icon={<Globe2 size={22} strokeWidth={2.2} />}
          label="Kebele"
          open={sidebarOpen}
          onClick={() => setSelectedCategory("kebele")}
        />

        <SidebarLink
          active={selectedCategory === "category"}
          icon={<Component size={22} strokeWidth={2.2} />}
          label="Category"
          open={sidebarOpen}
          onClick={() => setSelectedCategory("category")}
        />

        <SidebarLink
          active={selectedCategory === "settings"}
          icon={<Settings2 size={22} strokeWidth={2.2} />}
          label="Settings"
          open={sidebarOpen}
          onClick={() => setSelectedCategory("settings")}
        />
      </nav>

      {/* Footer Area */}
      <div className="p-8 mt-auto">
        <button className="flex items-center gap-4 text-blue-100/60 hover:text-white transition-all group">
          <LogOut size={20} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
          {sidebarOpen && <span className="font-bold text-[11px] uppercase tracking-[0.2em]">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

const SidebarLink = ({ active, icon, label, open, onClick }) => (
  <div className="relative py-1 pl-4">
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-5 py-4 px-7 transition-all duration-300 group ${
        active 
          ? "bg-[#F4F7FE] text-[#0052CC] rounded-l-[3rem] shadow-[-10px_0_20px_rgba(0,0,0,0.05)]" 
          : "text-blue-100/80 hover:text-white"
      }`}
    >
      {/* Top Inverse Curve Trick */}
      {active && (
        <div className="absolute right-0 -top-[20px] w-[20px] h-[20px] bg-[#F4F7FE] pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-[#0052CC] after:rounded-br-[20px]" />
      )}
      
      {/* Bottom Inverse Curve Trick */}
      {active && (
        <div className="absolute right-0 -bottom-[20px] w-[20px] h-[20px] bg-[#F4F7FE] pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-[#0052CC] after:rounded-tr-[20px]" />
      )}

      {/* Animated Icon */}
      <motion.span 
        whileHover={{ scale: active ? 1 : 1.2 }}
        className="flex-shrink-0"
      >
        {icon}
      </motion.span>

      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-[14px] font-bold tracking-tight whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  </div>
);

export default Sidebar;