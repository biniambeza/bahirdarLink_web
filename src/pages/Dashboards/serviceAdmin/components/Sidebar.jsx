import React, { useState } from "react";
import {
  LogOut,
  Home,
  Users,
  Settings,
  MapPin,
  Tag,
  Building,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// ── MODERN LOGOUT MODAL OVERLAY ──
const LogoutModal = ({ onConfirm, onCancel }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: "rgba(0,18,51,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl p-8 w-[360px] flex flex-col items-center text-center"
        style={{ boxShadow: "0 24px 80px rgba(0,82,204,0.18)" }}
      >
        {/* Icon Accent */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
          <LogOut size={28} className="text-[#0052CC]" strokeWidth={2} />
        </div>

        <h2 className="text-[1.25rem] font-black text-slate-900 tracking-tight mb-2">
          Sign out?
        </h2>
        <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
          You'll be returned to the login screen.<br />Any unsaved changes will be lost.
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 text-[13px] font-bold tracking-wide hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl text-white text-[13px] font-bold tracking-wide transition-all"
            style={{
              background: "linear-gradient(135deg,#0052CC,#2684FF)",
              boxShadow: "0 4px 16px rgba(0,82,204,0.35)",
            }}
          >
            Yes, sign out
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ── MAIN SIDEBAR NAVIGATION ──
const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  selectedCategory,
  setSelectedCategory,
}) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Structural Portal Target Injection */}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <motion.aside
        animate={{ width: sidebarOpen ? 280 : 90 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-[#0052CC] h-screen flex flex-col shadow-2xl shadow-blue-900/40 relative z-40"
      >
        {/* Logo and Brand Section */}
        <div className="p-6 flex items-center gap-3">
          <div className="min-w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center shadow-lg">
            <img
              src="/logo.webp"
              alt="BahirLink Logo"
              className="w-8 h-8 object-contain"
            />
          </div>

          {sidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-black text-white text-2xl tracking-tighter"
            >
              Bahir<span className="font-light opacity-80">Link</span>
            </motion.span>
          )}
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 px-4 space-y-2 mt-8">
          <SidebarLink
            active={selectedCategory === "dashboard"}
            icon={<Home size={22} strokeWidth={2.2} />}
            label="Dashboard"
            open={sidebarOpen}
            onClick={() => setSelectedCategory("dashboard")}
          />

          <SidebarLink
            active={selectedCategory === "users"}
            icon={<Users size={22} strokeWidth={2.2} />}
            label="Users"
            open={sidebarOpen}
            onClick={() => setSelectedCategory("users")}
          />

          <SidebarLink
            active={selectedCategory === "requests"}
            icon={<Building size={22} strokeWidth={2.2} />}
            label="Requests"
            open={sidebarOpen}
            onClick={() => setSelectedCategory("requests")}
          />

          <SidebarLink
            active={selectedCategory === "agents"}
            icon={<Building size={22} strokeWidth={2.2} />}
            label="Agents"
            open={sidebarOpen}
            onClick={() => setSelectedCategory("agents")}
          />

          <SidebarLink
            active={selectedCategory === "kebele"}
            icon={<MapPin size={22} strokeWidth={2.2} />}
            label="Kebele Assignment"
            open={sidebarOpen}
            onClick={() => setSelectedCategory("kebele")}
          />

          <SidebarLink
            active={selectedCategory === "category"}
            icon={<Tag size={22} strokeWidth={2.2} />}
            label="Categories"
            open={sidebarOpen}
            onClick={() => setSelectedCategory("category")}
          />

          <SidebarLink
            active={selectedCategory === "settings"}
            icon={<Settings size={22} strokeWidth={2.2} />}
            label="Settings"
            open={sidebarOpen}
            onClick={() => setSelectedCategory("settings")}
          />
        </nav>

        {/* Footer — Logout Controls */}
        <div className="p-6 border-t border-white/10 mt-auto">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-4 text-blue-100/60 hover:text-white transition-all group px-4 py-2 w-full"
          >
            <LogOut 
              size={20} 
              strokeWidth={2.5}
              className="group-hover:-translate-x-1 transition-transform" 
            />
            {sidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-[11px] uppercase tracking-[0.2em]"
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

// ── REUSABLE ACTION LINK COMPONENT ──
const SidebarLink = ({ active, icon, label, open, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group ${
      active
        ? "bg-white/20 text-white shadow-inner"
        : "text-blue-100 hover:bg-white/10"
    }`}
  >
    <motion.span 
      whileHover={{ scale: active ? 1 : 1.1 }}
      className="flex-shrink-0"
    >
      {icon}
    </motion.span>

    <AnimatePresence>
      {open && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="text-sm font-bold uppercase tracking-widest whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </button>
);

export default Sidebar;