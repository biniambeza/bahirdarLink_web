import React from "react";
import {
  Activity,
  CheckCircle,
  Clock,
  MapPin,
  Bell,
  Zap,
  Ambulance,
  User,
  Navigation,
} from "lucide-react";

const stats = [
  {
    title: "My Missions",
    value: 6,
    change: "Today",
    icon: Ambulance,
    color: "text-green-600",
    bg: "bg-green-50/50",
  },
  {
    title: "Active Mission",
    value: 1,
    change: "In Progress",
    icon: Activity,
    color: "text-yellow-600",
    bg: "bg-yellow-50/50",
  },
  {
    title: "Completed",
    value: 4,
    change: "Good Performance",
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50/50",
  },
  {
    title: "Status",
    value: "Available",
    change: "Ready",
    icon: User,
    color: "text-blue-600",
    bg: "bg-blue-50/50",
  },
];

const CrewDashboardPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-xl shadow">
                <Zap size={18} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold">Crew Dashboard</h1>
            </div>

            <p className="text-sm text-slate-500 mt-1">
              🚑 Field Operations • On Duty
            </p>
          </div>

          <button className="relative p-2 bg-white rounded-xl shadow">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border shadow-sm"
            >
              <div className="flex justify-between mb-3">
                <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-xs text-gray-400">{stat.change}</span>
              </div>

              <p className="text-xs text-gray-400 uppercase">{stat.title}</p>
              <h3 className="text-xl font-bold">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Missions */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow border">
              <div className="p-5 border-b">
                <h2 className="font-bold">My Missions</h2>
                <p className="text-xs text-gray-500">Assigned emergencies</p>
              </div>

              <div className="p-4 space-y-3">
                {[
                  {
                    title: "Fire at Bole Road",
                    time: "5 min ago",
                    status: "Pending",
                  },
                  {
                    title: "Medical Emergency - Kazanchis",
                    time: "20 min ago",
                    status: "In Progress",
                  },
                ].map((m, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="font-semibold">{m.title}</p>
                        <p className="text-xs text-gray-400">{m.time}</p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-blue-600">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Actions + Map */}
          <div className="lg:col-span-4 space-y-6">
            {/* Action Card */}
            <div className="bg-green-700 text-white p-6 rounded-2xl shadow">
              <h2 className="font-bold mb-2">Quick Actions</h2>
              <p className="text-sm text-green-100 mb-4">
                Manage your mission quickly
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white text-green-700 p-3 rounded-xl font-bold">
                  Start
                </button>
                <button className="bg-green-500 p-3 rounded-xl">
                  Complete
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl p-3 shadow border">
              <div className="h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                <Navigation />
                <span className="ml-2 text-sm">Map View</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewDashboardPage;
