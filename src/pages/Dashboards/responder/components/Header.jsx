import { Bell, Menu, Search, User } from "lucide-react";

const ResponderHeader = ({ sidebarOpen, setSidebarOpen, active }) => {
  return (
    <header className="h-24 bg-gradient-to-r from-blue-700 to-blue-900 px-8 flex items-center justify-between shadow-lg">
      {/* LEFT */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:scale-110 transition-transform"
        >
          <Menu size={26} />
        </button>

        <div>
          <h1 className="text-white text-2xl font-black capitalize tracking-tight">
            {active}
          </h1>
          <p className="text-blue-200 text-sm">
            Responder Emergency Control Center 🚑
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        {/* SEARCH */}
        <div className="hidden md:flex relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
            size={18}
          />
          <input
            type="text"
            placeholder="Search emergencies..."
            className="bg-white/10 border border-white/20 rounded-full pl-12 pr-5 py-2 text-white placeholder:text-white/50 text-sm outline-none w-64 focus:w-80 focus:bg-white/20 transition-all"
          />
        </div>

        {/* NOTIFICATIONS */}
        <button className="relative p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
          <Bell size={20} />

          <span className="absolute top-0 right-0 w-5 h-5 bg-yellow-400 text-black rounded-full text-[10px] flex items-center justify-center font-bold">
            5
          </span>
        </button>

        {/* USER PROFILE */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <User className="text-white" size={18} />
          </div>

          <div className="hidden md:block text-white">
            <p className="text-sm font-bold">Responder</p>
            <p className="text-xs text-blue-200">Emergency Unit</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ResponderHeader;
