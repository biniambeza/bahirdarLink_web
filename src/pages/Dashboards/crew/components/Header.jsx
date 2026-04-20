import { Bell, Menu, User, MapPin } from "lucide-react";

const CrewHeader = ({ sidebarOpen, setSidebarOpen, active }) => {
  return (
    <header className="h-20 bg-gradient-to-r from-green-700 to-green-900 px-6 flex items-center justify-between shadow-lg">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:scale-110 transition-transform"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="text-white text-xl font-bold capitalize">{active}</h1>
          <p className="text-green-200 text-xs flex items-center gap-1">
            <MapPin size={14} /> On Duty - Field Operation
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* STATUS */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-300/30">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <p className="text-xs text-white font-semibold">Available</p>
        </div>

        {/* NOTIFICATIONS */}
        <button className="relative p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
          <Bell size={18} />
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-[10px] flex items-center justify-center rounded-full">
            2
          </span>
        </button>

        {/* USER */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>

          <div className="hidden md:block text-white">
            <p className="text-sm font-bold">Crew Member</p>
            <p className="text-xs text-green-200">Medic</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CrewHeader;
