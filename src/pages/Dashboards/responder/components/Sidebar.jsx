// import {
//   BarChart2,
//   AlertTriangle,
//   Ambulance,
//   User,
//   Settings,
//   FileText,
// } from "lucide-react";
// import { motion } from "framer-motion";

// const ResponderSidebar = ({ sidebarOpen, active, setActive }) => {
//   return (
//     <motion.aside
//       animate={{ width: sidebarOpen ? 260 : 90 }}
//       className="h-screen bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col shadow-2xl"
//     >
//       {/* Logo */}
//       <div className="p-6 flex items-center gap-3">
//         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-700 font-bold">
//           🚑
//         </div>

//         {sidebarOpen && (
//           <span className="font-bold text-lg tracking-tight">Responder</span>
//         )}
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 px-3 space-y-2 mt-6">
//         <NavItem
//           icon={<BarChart2 />}
//           label="Dashboard"
//           active={active === "dashboard"}
//           open={sidebarOpen}
//           onClick={() => setActive("dashboard")}
//         />

//         <NavItem
//           icon={<AlertTriangle />}
//           label="Incidents"
//           active={active === "incidents"}
//           open={sidebarOpen}
//           onClick={() => setActive("incidents")}
//         />

//         {/* ✅ Cases now behaves like others */}
//         <NavItem
//           icon={<FileText />}
//           label="Cases"
//           active={active === "cases"}
//           open={sidebarOpen}
//           onClick={() => setActive("cases")}
//         />

//         <NavItem
//           icon={<Settings />}
//           label="Settings"
//           active={active === "settings"}
//           open={sidebarOpen}
//           onClick={() => setActive("settings")}
//         />
//       </nav>

//       {/* Footer */}
//       {sidebarOpen && (
//         <div className="p-4 text-xs text-blue-200 text-center">
//           Emergency Response System
//         </div>
//       )}
//     </motion.aside>
//   );
// };

// const NavItem = ({ icon, label, active, open, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
//       active
//         ? "bg-white/20 text-white shadow-inner"
//         : "text-blue-100 hover:bg-white/10"
//     }`}
//   >
//     <span>{icon}</span>

//     {open && (
//       <span className="text-sm font-bold uppercase tracking-widest">
//         {label}
//       </span>
//     )}
//   </button>
// );

// export default ResponderSidebar;

import React, { useState, useEffect } from "react";
import {
  BarChart2,
  AlertTriangle,
  Settings,
  FileText,
  Loader2,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

const ResponderSidebar = ({ sidebarOpen, active, setActive }) => {
  const [isServiceMode, setIsServiceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAgencyType = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const responderTeamId = decoded.id;

        const teamRes = await axios.get(
          `${BASE_URL}/api/responderTeam/${responderTeamId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const agencyId = teamRes.data?.data?.agencyId || teamRes.data?.agencyId;

        const agencyRes = await axios.get(
          `${BASE_URL}/api/agency/${agencyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const agencyName = (
          agencyRes.data?.data?.name ||
          agencyRes.data?.name ||
          ""
        ).toLowerCase();

        const serviceKeywords = [
          "municipal",
          "electric",
          "water",
          "health",
          "utility",
          "medical",
          "service",
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

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 90 }}
      // Unified blue gradient for both modes
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

        {/* Dynamic Logic: Hide Cases for Service Teams */}
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
      {sidebarOpen && (
        <div className="p-6">
          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
              {isServiceMode ? "Service Unit" : "Emergency Unit"}
            </p>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

const NavItem = ({ icon, label, active, open, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
      active
        ? "bg-white text-blue-900 shadow-xl scale-[1.02]"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    }`}
  >
    <span
      className={`${active ? "text-blue-600" : "group-hover:scale-110 transition-transform"}`}
    >
      {icon}
    </span>

    {open && (
      <span
        className={`text-xs font-black uppercase tracking-widest ${active ? "text-blue-900" : ""}`}
      >
        {label}
      </span>
    )}
  </button>
);

export default ResponderSidebar;
