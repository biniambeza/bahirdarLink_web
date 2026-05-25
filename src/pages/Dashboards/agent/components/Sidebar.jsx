import React, { useState, useMemo } from "react";
import {
  BarChart2,
  AlertTriangle,
  Car,
  Building2,
  ClipboardList,
  Truck,
  LogOut,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// ─── LOGOUT MODAL ─────────────────────────────────────────────────────────────
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
        className="bg-white rounded-3xl p-8 w-[360px] flex flex-col items-center text-center"
        style={{ boxShadow: "0 24px 80px rgba(0,82,204,0.18)" }}
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
          <LogOut size={28} className="text-[#0052CC]" strokeWidth={2} />
        </div>

        <h2 className="text-[1.25rem] font-black text-slate-900 tracking-tight mb-2">
          Sign out?
        </h2>
        <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
          You'll be returned to the login screen.
          <br />
          Any unsaved changes will be lost.
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

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const Sidebar = ({ sidebarOpen, active, setActive }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const storedAgency = JSON.parse(localStorage.getItem("agency") || "{}");
  const agencyType = (storedAgency?.agencyType?.name || "").toLowerCase();

  const isService = ["municipal", "electric", "water"].some((t) =>
    agencyType.includes(t),
  );

  const navItems = useMemo(() => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: <BarChart2 size={20} /> },
    ];

    if (isService) {
      baseItems.push(
        {
          id: "incidents",
          label: "Requests",
          icon: <ClipboardList size={20} />,
        },
        { id: "units", label: "Teams", icon: <Truck size={20} /> },
      );
    } else {
      baseItems.push(
        {
          id: "incidents",
          label: "Incidents",
          icon: <AlertTriangle size={20} />,
        },
        { id: "units", label: "Units", icon: <Car size={20} /> },
      );
    }

    // Dynamic placement of the settings option inside the list structure
    baseItems.push({
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} />,
    });

    return baseItems;
  }, [isService]);

  return (
    <>
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 90 }}
        className="h-screen bg-gradient-to-b from-[#0052CC] to-[#1E3A8A] text-white flex flex-col shadow-2xl sticky top-0"
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 shrink-0">
            {isService ? (
              <Building2 className="text-blue-700" size={24} />
            ) : (
              <span className="text-blue-700 font-black text-xl">A</span>
            )}
          </div>
          {sidebarOpen && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-black text-lg tracking-tight leading-none uppercase truncate">
                {storedAgency.name || "Agency"}
              </span>
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter opacity-70">
                {agencyType} Portal
              </span>
            </div>
          )}
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 space-y-2 mt-6">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={active === item.id}
              open={sidebarOpen}
              onClick={() => setActive(item.id)}
            />
          ))}
        </nav>

        {/* Footer: Logout only */}
        <div className="p-4 border-t border-white/10">
          <NavItem
            icon={<LogOut size={20} />}
            label="Logout"
            active={false}
            open={sidebarOpen}
            onClick={() => setShowLogoutModal(true)}
            danger
          />
        </div>
      </motion.aside>
    </>
  );
};

// ─── NAV ITEM ─────────────────────────────────────────────────────────────────
const NavItem = ({ icon, label, active, open, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative group ${
      active
        ? "bg-white/20 text-white shadow-inner"
        : danger
          ? "text-blue-200/50 hover:bg-white/10 hover:text-white"
          : "text-blue-100 hover:bg-white/10"
    }`}
  >
    <span
      className={`${active ? "scale-110" : "group-hover:scale-110"} transition-transform shrink-0`}
    >
      {icon}
    </span>

    {open && (
      <span className="text-[11px] font-black uppercase tracking-widest truncate">
        {label}
      </span>
    )}

    {active && !open && (
      <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
    )}
  </button>
);

export default Sidebar;
