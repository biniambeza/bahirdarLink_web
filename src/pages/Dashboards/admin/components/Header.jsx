import { Bell, Menu, Search, User, Settings, LogOut } from "lucide-react";

const Header = ({ sidebarOpen, setSidebarOpen, notifications }) => {
  return (
    <header className="h-28 bg-gradient-to-r from-[#0052CC] to-[#1E90FF] px-10 flex items-center justify-between shadow-lg relative z-20">
      <div className="flex items-center gap-8">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:scale-110 transition-transform"
        >
          <Menu size={28} />
        </button>
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">
            Welcome, Admin!
          </h1>
          <p className="text-blue-100 text-sm font-medium">
            Bahir Dar Emergency Monitoring System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
            size={18}
          />
          <input
            type="text"
            placeholder="Quick Search..."
            className="bg-white/10 border border-white/20 rounded-full pl-12 pr-6 py-2.5 text-white placeholder:text-white/50 text-sm outline-none w-64 focus:w-80 transition-all focus:bg-white/20"
          />
        </div>

        <button className="relative p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
          <Bell size={22} />
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 border-2 border-[#1E90FF] rounded-full text-[10px] flex items-center justify-center font-bold">
            {notifications}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
