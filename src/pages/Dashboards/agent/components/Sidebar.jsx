import React, { useMemo } from "react";
import {
  BarChart2,
  AlertTriangle,
  Car,
  Building2,
  ClipboardList,
  Truck,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";

const Sidebar = ({ sidebarOpen, active, setActive }) => {
  // 1. Get Agency Data
  const storedAgency = JSON.parse(localStorage.getItem("agency") || "{}");
  const agencyType = (storedAgency?.agencyType?.name || "").toLowerCase();

  // 2. Determine Mode
  const isService = ["municipal", "electric", "water"].some((t) =>
    agencyType.includes(t),
  );

  // 3. Define Dynamic Navigation Items
  const navItems = useMemo(() => {
    const baseItems = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <BarChart2 size={20} />,
      },
    ];

    if (isService) {
      // Service-Oriented Nav
      baseItems.push(
        {
          id: "incidents",
          label: "Requests",
          icon: <ClipboardList size={20} />,
        },
        {
          id: "units",
          label: "Teams",
          icon: <Truck size={20} />,
        },
      );
    } else {
      // Emergency-Oriented Nav
      baseItems.push(
        {
          id: "incidents",
          label: "Incidents",
          icon: <AlertTriangle size={20} />,
        },
        {
          id: "units",
          label: "Units",
          icon: <Car size={20} />,
        },
      );
    }

    return baseItems;
  }, [isService]);

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 90 }}
      className="h-screen bg-gradient-to-b from-[#0052CC] to-[#1E3A8A] text-white flex flex-col shadow-2xl sticky top-0"
    >
      {/* Dynamic Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
          {isService ? (
            <Building2 className="text-blue-700" size={24} />
          ) : (
            <span className="text-blue-700 font-black text-xl">A</span>
          )}
        </div>

        {sidebarOpen && (
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight leading-none uppercase">
              {storedAgency.name || "Agency"}
            </span>
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter opacity-70">
              {agencyType} Portal
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
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

      {/* Footer / Settings */}
      <div className="p-4 border-t border-white/10">
        <NavItem
          icon={<Settings size={20} />}
          label="Settings"
          active={active === "settings"}
          open={sidebarOpen}
          onClick={() => setActive("settings")}
        />
      </div>
    </motion.aside>
  );
};

const NavItem = ({ icon, label, active, open, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative group ${
      active
        ? "bg-white/20 text-white shadow-inner"
        : "text-blue-100 hover:bg-white/10"
    }`}
  >
    <span
      className={`${active ? "scale-110" : "group-hover:scale-110"} transition-transform`}
    >
      {icon}
    </span>

    {open && (
      <span className="text-[11px] font-black uppercase tracking-widest truncate">
        {label}
      </span>
    )}

    {/* Active Indicator Dot */}
    {active && !open && (
      <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
    )}
  </button>
);

export default Sidebar;
