import React, { useState } from "react";
import {
  LogOut,
  LayoutDashboard,
  UserCircle2,
  ClipboardList,
  Zap,
  Globe2,
  Component,
  Settings2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl p-8 w-[360px] flex flex-col items-center text-center"
        style={{ boxShadow: "0 24px 80px rgba(0,82,204,0.18)" }}
      >
        {/* Icon */}
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

const Sidebar = ({
  sidebarOpen,
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
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

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

      {/* Footer — Logout */}
      <div className="p-8 mt-auto">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-4 text-blue-100/60 hover:text-white transition-all group"
        >
          <LogOut
            size={20}
            strokeWidth={2.5}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {sidebarOpen && (
            <span className="font-bold text-[11px] uppercase tracking-[0.2em]">
              Logout
            </span>
          )}
        </button>
      </div>
    </motion.aside>
    </>
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
      {active && (
        <div className="absolute right-0 -top-[20px] w-[20px] h-[20px] bg-[#F4F7FE] pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-[#0052CC] after:rounded-br-[20px]" />
      )}
      {active && (
        <div className="absolute right-0 -bottom-[20px] w-[20px] h-[20px] bg-[#F4F7FE] pointer-events-none after:content-[''] after:absolute after:inset-0 after:bg-[#0052CC] after:rounded-tr-[20px]" />
      )}

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