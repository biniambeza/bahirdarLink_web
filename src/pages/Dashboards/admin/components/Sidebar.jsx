import { LogOut, Home, Users, FileText, Settings, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 280 : 90 }}
      className="bg-[#0052CC] h-screen flex flex-col shadow-2xl shadow-blue-900/40"
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="min-w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center shadow-lg">
          <img
            src="/logo.webp"
            alt="BahirLink Logo"
            className="w-8 h-8 object-contain"
          />
        </div>
        {sidebarOpen && (
          <span className="font-black text-white text-2xl tracking-tighter">
            Bahir<span className="font-light">Link</span>
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-8">
        <SidebarLink
          active={selectedCategory === "dashboard"}
          icon={<Home />}
          label="Dashboard"
          open={sidebarOpen}
          onClick={() => setSelectedCategory("dashboard")}
        />
        <SidebarLink
          active={selectedCategory === "users"}
          icon={<Users />}
          label="Users"
          open={sidebarOpen}
          onClick={() => setSelectedCategory("users")}
        />
        <SidebarLink
          active={selectedCategory === "reports"}
          icon={<FileText />}
          label="Reports"
          open={sidebarOpen}
          onClick={() => setSelectedCategory("reports")}
        />
        <SidebarLink
          active={selectedCategory === "agents"}
          icon={<Zap />}
          label="Agents"
          open={sidebarOpen}
          onClick={() => setSelectedCategory("agents")}
        />
        <SidebarLink
          active={selectedCategory === "settings"}
          icon={<Settings />}
          label="Settings"
          open={sidebarOpen}
          onClick={() => setSelectedCategory("settings")}
        />
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-white/10">
        <button className="flex items-center gap-4 text-blue-100 hover:text-white transition-colors px-4 py-2 w-full">
          <LogOut size={20} />
          {sidebarOpen && (
            <span className="font-bold text-sm uppercase tracking-widest">
              Logout
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

const SidebarLink = ({ active, icon, label, open, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
      active
        ? "bg-white/20 text-white shadow-inner"
        : "text-blue-100 hover:bg-white/10"
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

export default Sidebar;
