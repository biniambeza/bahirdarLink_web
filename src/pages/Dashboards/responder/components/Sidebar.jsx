import React, { useState, useEffect } from "react";
import {
  BarChart2,
  AlertTriangle,
  Settings,
  FileText,
  Loader2,
  Zap,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

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
          <LogOut size={28} className="text-blue-700" strokeWidth={2} />
        </div>

        <h2 className="text-[1.25rem] font-black text-slate-900 tracking-tight mb-2">
          Sign out?
        </h2>
        <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
          You'll be returned to the login screen.<br />
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
const ResponderSidebar = ({ sidebarOpen, active, setActive }) => {
  const navigate = useNavigate();
  const [isServiceMode, setIsServiceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const checkAgencyType = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const responderTeamId = decoded.id;

        const teamRes = await axios.get(
          `${BASE_URL}/api/responderTeam/${responderTeamId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const agencyId = teamRes.data?.data?.agencyId || teamRes.data?.agencyId;

        const agencyRes = await axios.get(
          `${BASE_URL}/api/agency/${agencyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const agencyName = (
          agencyRes.data?.data?.name ||
          agencyRes.data?.name ||
          ""
        ).toLowerCase();

        const serviceKeywords = [
          "municipal", "electric", "water", "health",
          "utility", "medical", "service",
        ];
        setIsServiceMode(serviceKeywords.some((kw) => agencyName.includes(kw)));
      } catch (error) {
        console.error("Sidebar Auth Error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAgencyType();
  }, []);

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
        animate={{ width: sidebarOpen ? 260 : 90 }}
        className="h-screen flex flex-col shadow-2xl bg-gradient-to-b from-blue-700 to-blue-900 text-white"
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            {loading ? (
              <Loader2 className="animate-spin text-blue-700" size={20} />
            ) : (
              <span className="text-2xl">{isServiceMode ? "⚡" : "🚑"}</span>
            )}
          </div>

          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-black text-lg tracking-tight leading-tight uppercase">
                {isServiceMode ? "Service" : "Responder"}
              </span>
              <span className="text-[10px] font-bold opacity-60 tracking-[0.2em]">
                UNIT HUB
              </span>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-2 mt-6">
          <NavItem
            icon={<BarChart2 size={22} />}
            label="Dashboard"
            active={active === "dashboard"}
            open={sidebarOpen}
            onClick={() => setActive("dashboard")}
          />

          <NavItem
            icon={isServiceMode ? <Zap size={22} /> : <AlertTriangle size={22} />}
            label={isServiceMode ? "Tasks" : "Incidents"}
            active={active === "incidents"}
            open={sidebarOpen}
            onClick={() => setActive("incidents")}
          />

          {!isServiceMode && (
            <NavItem
              icon={<FileText size={22} />}
              label="Cases"
              active={active === "cases"}
              open={sidebarOpen}
              onClick={() => setActive("cases")}
            />
          )}

          <NavItem
            icon={<Settings size={22} />}
            label="Settings"
            active={active === "settings"}
            open={sidebarOpen}
            onClick={() => setActive("settings")}
          />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {sidebarOpen && (
            <div className="px-1 pb-2">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  {isServiceMode ? "Service Unit" : "Emergency Unit"}
                </p>
              </div>
            </div>
          )}

          <NavItem
            icon={<LogOut size={22} />}
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
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
      active
        ? "bg-white text-blue-900 shadow-xl scale-[1.02]"
        : danger
          ? "text-blue-200/50 hover:bg-white/10 hover:text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
    }`}
  >
    <span
      className={`${
        active
          ? "text-blue-600"
          : "group-hover:scale-110 transition-transform"
      }`}
    >
      {icon}
    </span>

    {open && (
      <span
        className={`text-xs font-black uppercase tracking-widest ${
          active ? "text-blue-900" : ""
        }`}
      >
        {label}
      </span>
    )}

    {active && !open && (
      <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
    )}
  </button>
);

export default ResponderSidebar;