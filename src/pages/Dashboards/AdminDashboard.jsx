import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Map,
  Users,
  Settings,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Abebe Kebede",
    role: "Administrator",
    initials: "AK",
  };

  const stats = [
    { label: "Total Incidents", value: "156", icon: <AlertTriangle />, change: "+12%", color: "from-red-500 to-orange-500", bg: "bg-red-50" },
    { label: "Active Now", value: "23", icon: <TrendingUp />, change: "+5", color: "from-blue-500 to-cyan-500", bg: "bg-blue-50" },
    { label: "Resolved Today", value: "12", icon: <CheckCircle />, change: "+3", color: "from-green-500 to-emerald-500", bg: "bg-green-50" },
    { label: "Avg Response", value: "4.2 min", icon: <Clock />, change: "-0.8", color: "from-purple-500 to-pink-500", bg: "bg-purple-50" },
  ];

  const incidents = [
    { id: "INC-001", title: "Structure Fire on Kebele 14", location: "Kebele 14", severity: "critical", status: "active", time: "2 min ago" },
    { id: "INC-002", title: "Multi-Vehicle Accident", location: "Ring Road", severity: "high", status: "responding", time: "5 min ago" },
    { id: "INC-003", title: "Medical Emergency", location: "University Area", severity: "high", status: "responding", time: "8 min ago" },
    { id: "INC-004", title: "Flooding Area", location: "Lakeside", severity: "medium", status: "active", time: "15 min ago" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30",
      high: "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30",
      medium: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30",
      low: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30",
    };
    return badges[severity] || "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30",
      responding: "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30",
      resolved: "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30",
    };
    return badges[status] || "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`${sidebarOpen ? "w-72" : "w-24"} 
          bg-gradient-to-b from-indigo-600 via-blue-600 to-indigo-700 
          text-white shadow-2xl transition-all duration-500 flex flex-col relative overflow-hidden`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative p-6 flex items-center justify-between border-b border-white/20">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center text-xl font-bold">
              BL
            </div>
            {sidebarOpen && (
              <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                BahirLink
              </h1>
            )}
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>

        <div className="relative p-6 border-b border-white/20">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg flex items-center justify-center font-semibold text-xl border border-white/20"
            >
              {user.initials}
            </motion.div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <p className="font-semibold text-lg">{user.name}</p>
                <p className="text-xs text-blue-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {user.role}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        <nav className="relative flex-1 p-4 space-y-2">
          {[
            { id: "dashboard", icon: <BarChart3 size={20} />, label: "Dashboard" },
            { id: "incidents", icon: <AlertTriangle size={20} />, label: "Incidents", badge: "4" },
            { id: "analytics", icon: <TrendingUp size={20} />, label: "Analytics" },
            { id: "map", icon: <Map size={20} />, label: "Live Map" },
            { id: "users", icon: <Users size={20} />, label: "Users" },
            { id: "settings", icon: <Settings size={20} />, label: "Settings" },
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: sidebarOpen ? 5 : 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group
                ${activeTab === item.id
                  ? "bg-white/20 backdrop-blur-md shadow-lg"
                  : "hover:bg-white/10"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className={`${activeTab === item.id ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </div>
              {sidebarOpen && item.badge && (
                <span className="px-2 py-1 bg-red-500 rounded-lg text-xs font-bold">
                  {item.badge}
                </span>
              )}
              {!sidebarOpen && item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="relative p-4 border-t border-white/20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-all group"
          >
            <LogOut size={20} className="group-hover:text-red-300" />
            {sidebarOpen && (
              <span className="text-sm font-medium group-hover:text-red-300">Logout</span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/20 px-8 py-4 flex justify-between items-center"
        >
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent capitalize">
              {activeTab}
            </h1>
            <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <Bell size={22} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-auto">
                      {[1,2,3].map((i) => (
                        <div key={i} className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm font-medium">New incident reported</p>
                          <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/50 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                {user.initials}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`} />
                <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                      <p className={`text-xs mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                        {stat.change}
                        <TrendingUp size={12} />
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center text-2xl`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Incidents Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Recent Incidents</h2>
                <p className="text-sm text-gray-500 mt-1">Active incidents requiring attention</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Filter
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition"
                >
                  View All →
                </motion.button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["ID", "Title", "Location", "Severity", "Status", "Time", "Actions"].map((head) => (
                      <th key={head} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {incidents.map((incident, index) => (
                    <motion.tr
                      key={incident.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.02)" }}
                      className="group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">{incident.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{incident.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{incident.location}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityBadge(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(incident.status)}`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{incident.time}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">View</button>
                          <button className="text-xs text-green-600 hover:text-green-800 font-medium">Assign</button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">Showing 1-4 of 24 incidents</p>
              <div className="flex gap-2">
                {[1,2,3].map((page) => (
                  <button key={page} className={`w-8 h-8 rounded-lg text-sm ${page === 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;