import React from "react";
import { Activity, Clock, CheckCircle, Users, Bell } from "lucide-react";

const stats = [
  {
    title: "Total Incidents",
    value: 24,
    icon: Activity,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Pending Dispatches",
    value: 7,
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Resolved Cases",
    value: 15,
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Active Responders",
    value: 12,
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

const ResponderDashboardPage = () => {
  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-1">
            Dashboard
          </h1>
          <p className="text-slate-500 font-medium">
            System Operational •{" "}
            <span className="text-emerald-500">Live Updates</span>
          </p>
        </div>
        <button className="mt-4 md:mt-0 flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition font-semibold">
          <Bell size={18} className="text-slate-600" />
          Notifications
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-black text-slate-800">
                  {stat.value}
                </h3>
              </div>
              <div
                className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}
              >
                <stat.icon size={24} />
              </div>
            </div>
            {/* Subtle progress bar aesthetic */}
            <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.color.replace("text", "bg")} opacity-60 w-2/3`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold">Recent Activity</h2>
            <button className="text-blue-600 text-sm font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="p-0">
            {[
              {
                label: "Incident #102 assigned",
                time: "2h ago",
                type: "assignment",
              },
              {
                label: "Dispatch completed",
                time: "4h ago",
                type: "completion",
              },
              {
                label: "New incident reported",
                time: "6h ago",
                type: "report",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 transition border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Side Panel */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">System Status</h2>
            <p className="text-slate-400 text-sm mb-6">
              All responder units are currently synced with the central hub.
            </p>
            <div className="space-y-4">
              <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition">
                Create New Dispatch
              </button>
              <button className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold border border-slate-700 hover:bg-slate-700 transition">
                Generate Report
              </button>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
              <div>
                <p className="text-sm font-bold">Dispatcher Alpha</p>
                <p className="text-xs text-slate-400">Online since 08:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponderDashboardPage;
