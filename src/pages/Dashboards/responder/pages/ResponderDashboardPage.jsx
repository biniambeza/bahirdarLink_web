import React from "react";
import {
  Activity,
  Clock,
  CheckCircle,
  Users,
  Bell,
  ArrowUpRight,
  Search,
  Plus,
  MoreHorizontal,
  MapPin,
  ShieldAlert,
  Zap,
} from "lucide-react";

const stats = [
  {
    title: "Total Incidents",
    value: 24,
    change: "+12%",
    icon: Activity,
    color: "text-blue-600",
    bg: "bg-blue-50/50",
    trend: "up",
  },
  {
    title: "Pending Dispatches",
    value: 7,
    change: "High Priority",
    icon: ShieldAlert,
    color: "text-rose-600",
    bg: "bg-rose-50/50",
    trend: "neutral",
  },
  {
    title: "Resolved Cases",
    value: 15,
    change: "82% Efficiency",
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50/50",
    trend: "up",
  },
  {
    title: "Active Responders",
    value: 12,
    change: "92% Capacity",
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-50/50",
    trend: "neutral",
  },
];

const ResponderDashboardPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Header Area */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <Zap size={20} className="text-white fill-current" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Command Center
              </h1>
            </div>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              System Live: 14 Active Nodes{" "}
              <span className="text-slate-300">|</span> April 6, 2026
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search IDs, units..."
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 transition-all w-64"
              />
            </div>
            <button className="relative p-2.5 hover:bg-slate-50 rounded-xl transition-colors">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-100 mx-1" />
            <button className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-slate-50 rounded-xl transition-colors">
              <span className="text-sm font-bold text-slate-700 hidden sm:inline">
                Admin Unit 01
              </span>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-600 flex items-center justify-center text-white text-[10px] font-bold">
                AU
              </div>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="group bg-white p-5 rounded-[1.75rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                  <stat.icon size={22} />
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stat.bg} ${stat.color} border border-current/10`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {stat.title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Activity Feed */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-slate-50/30">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Incident Pipeline
                  </h2>
                  <p className="text-xs text-slate-500 font-medium text-slate-400">
                    Monitoring real-time dispatch streams
                  </p>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreHorizontal size={20} className="text-slate-400" />
                </button>
              </div>
              <div className="p-2">
                {[
                  {
                    label: "Critical Incident #102: Structure Fire",
                    time: "2m ago",
                    status: "Dispatching",
                    color: "text-rose-600",
                    bg: "bg-rose-50",
                  },
                  {
                    label: "Unit 04: Arrival confirmed at Sector G",
                    time: "14m ago",
                    status: "On-Site",
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    label: "Protocol v4.2 Synchronized",
                    time: "1h ago",
                    status: "System",
                    color: "text-slate-500",
                    bg: "bg-slate-50",
                  },
                  {
                    label: "Incident #098: Medical Clearance granted",
                    time: "3h ago",
                    status: "Resolved",
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}
                      >
                        <MapPin size={18} className={item.color} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                          {item.time} • Local Server
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-current/20 ${item.color}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 text-sm font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all border-t border-slate-100">
                Access Archives
              </button>
            </div>
          </div>

          {/* Right Column: Actions & Map Preview */}
          <div className="lg:col-span-4 space-y-6">
            {/* Action Card */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldAlert size={120} strokeWidth={1} />
              </div>

              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-2">Emergency Protocols</h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
                  Quick-access triggers for active dispatchers and field
                  coordinators.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button className="flex flex-col items-center justify-center p-4 bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all gap-2 group">
                    <Plus
                      size={20}
                      className="group-hover:rotate-90 transition-transform"
                    />
                    <span className="text-[11px] font-bold">New Dispatch</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all gap-2 border border-slate-700">
                    <Activity size={20} />
                    <span className="text-[11px] font-bold">Log Event</span>
                  </button>
                </div>

                <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:shadow-lg hover:shadow-white/5 transition-all">
                  Generate Summary Report
                </button>
              </div>
            </div>

            {/* Map Placeholder/Preview */}
            <div className="bg-white rounded-[2rem] p-2 border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-48 w-full rounded-[1.5rem] bg-slate-100 relative group cursor-crosshair overflow-hidden">
                {/* Mock Map Background */}
                <div className="absolute inset-0 opacity-20 grayscale bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i12!2i2241!3i1546!2m3!1e0!2sm!3i400000000!5m1!5f2')] bg-cover" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping" />
                    <MapPin
                      className="text-blue-600 fill-blue-600 relative z-10"
                      size={32}
                    />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                  <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200/50">
                    Sector G-12 (Active)
                  </span>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-white bg-slate-300"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponderDashboardPage;
