import React, { useState, useEffect } from "react";
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
  BarChart3,
  Search,
  Filter,
  Download,
  PlusCircle,
  Shield,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  FileText,
  Home,
  PieChart,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncidents, setSelectedIncidents] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Abebe Kebede",
    role: "Administrator",
    initials: "AK",
    email: "abebe.kebede@bahirlink.gov.et",
    avatar: "https://ui-avatars.com/api/?name=Abebe+Kebede&background=2563eb&color=fff&bold=true"
  };

  const stats = [
    { 
      label: "Total Incidents", 
      value: "1,256", 
      icon: <AlertTriangle />, 
      change: "+12.5%", 
      trend: "up",
      color: "from-red-500 to-orange-500", 
      bg: "bg-red-50",
      chart: [40, 70, 50, 80, 60, 90, 75]
    },
    { 
      label: "Active Now", 
      value: "23", 
      icon: <Activity />, 
      change: "+5", 
      trend: "up",
      color: "from-blue-500 to-cyan-500", 
      bg: "bg-blue-50",
      chart: [60, 70, 45, 80, 65, 75, 50]
    },
    { 
      label: "Resolved Today", 
      value: "12", 
      icon: <CheckCircle />, 
      change: "+3", 
      trend: "up",
      color: "from-green-500 to-emerald-500", 
      bg: "bg-green-50",
      chart: [30, 45, 60, 40, 70, 55, 80]
    },
    { 
      label: "Avg Response", 
      value: "4.2", 
      suffix: "min", 
      icon: <Clock />, 
      change: "-0.8", 
      trend: "down",
      color: "from-purple-500 to-pink-500", 
      bg: "bg-purple-50",
      chart: [80, 65, 70, 55, 60, 45, 40]
    },
  ];

  const incidents = [
    { 
      id: "INC-001", 
      title: "Structure Fire on Kebele 14", 
      location: "Kebele 14, Near Market", 
      severity: "critical", 
      status: "active", 
      time: "2 min ago",
      assignedTo: "Unit 7",
      priority: 1,
      coordinates: { lat: 11.6, lng: 37.3 }
    },
    { 
      id: "INC-002", 
      title: "Multi-Vehicle Accident", 
      location: "Ring Road, Junction 4", 
      severity: "high", 
      status: "responding", 
      time: "5 min ago",
      assignedTo: "Unit 3, Unit 9",
      priority: 2,
      coordinates: { lat: 11.6, lng: 37.4 }
    },
    { 
      id: "INC-003", 
      title: "Medical Emergency", 
      location: "University Area, Block C", 
      severity: "high", 
      status: "responding", 
      time: "8 min ago",
      assignedTo: "Ambulance 2",
      priority: 2,
      coordinates: { lat: 11.6, lng: 37.35 }
    },
    { 
      id: "INC-004", 
      title: "Flooding Area", 
      location: "Lakeside, Zone 3", 
      severity: "medium", 
      status: "active", 
      time: "15 min ago",
      assignedTo: "Unassigned",
      priority: 3,
      coordinates: { lat: 11.6, lng: 37.32 }
    },
    { 
      id: "INC-005", 
      title: "Gas Leak Report", 
      location: "Industrial Zone", 
      severity: "critical", 
      status: "active", 
      time: "22 min ago",
      assignedTo: "Hazmat Team",
      priority: 1,
      coordinates: { lat: 11.61, lng: 37.38 }
    },
  ];

  const recentActivities = [
    { action: "New incident reported", user: "Citizen", time: "2 min ago", icon: "🚨" },
    { action: "Unit dispatched to INC-002", user: "Dispatch", time: "5 min ago", icon: "🚒" },
    { action: "INC-001 escalated to critical", user: "System", time: "10 min ago", icon: "⚠️" },
    { action: "New responder joined", user: "Admin", time: "15 min ago", icon: "👤" },
    { action: "Equipment status updated", user: "Maintenance", time: "25 min ago", icon: "🔧" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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

  const toggleIncidentSelection = (incidentId) => {
    setSelectedIncidents(prev =>
      prev.includes(incidentId)
        ? prev.filter(id => id !== incidentId)
        : [...prev, incidentId]
    );
  };

  // Mini chart component
  const MiniChart = ({ data, color }) => (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((value, i) => (
        <div
          key={i}
          className={`w-1.5 bg-gradient-to-t ${color} rounded-t-sm`}
          style={{ height: `${value}%` }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`${sidebarOpen ? "w-80" : "w-24"} 
          bg-gradient-to-b from-indigo-900/95 via-blue-900/95 to-indigo-900/95 
          backdrop-blur-xl text-white shadow-2xl transition-all duration-500 flex flex-col relative overflow-hidden border-r border-white/10`}
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 -right-40 w-80 h-80 bg-purple-500 rounded-full blur-3xl animate-pulse-slower"></div>
        </div>

        {/* Logo Section */}
        <div className="relative p-6 flex items-center justify-between border-b border-white/10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold shadow-xl">
              BL
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  BahirLink
                </h1>
                <p className="text-xs text-blue-300/70">Command Center</p>
              </div>
            )}
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: sidebarOpen ? 0 : 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition relative group"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              {sidebarOpen ? 'Collapse' : 'Expand'}
            </span>
          </motion.button>
        </div>

        {/* User Profile */}
        <div className="relative p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-xl"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-indigo-900 rounded-full"></span>
            </motion.div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <p className="font-semibold text-lg truncate">{user.name}</p>
                <p className="text-xs text-blue-300 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {user.role}
                </p>
                <p className="text-xs text-blue-300/70 mt-1 truncate">{user.email}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
          {[
            { id: "dashboard", icon: <BarChart3 size={20} />, label: "Dashboard", count: null },
            { id: "incidents", icon: <AlertTriangle size={20} />, label: "Incidents", count: "4", color: "bg-red-500" },
            { id: "analytics", icon: <TrendingUp size={20} />, label: "Analytics", count: null },
            { id: "map", icon: <Map size={20} />, label: "Live Map", count: null },
            { id: "users", icon: <Users size={20} />, label: "Users", count: "12", color: "bg-green-500" },
            { id: "reports", icon: <FileText size={20} />, label: "Reports", count: null },
            { id: "settings", icon: <Settings size={20} />, label: "Settings", count: null },
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: sidebarOpen ? 5 : 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group
                ${activeTab === item.id
                  ? "bg-white/20 backdrop-blur-md shadow-lg border border-white/10"
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
              {sidebarOpen && item.count && (
                <span className={`px-2 py-1 ${item.color} rounded-lg text-xs font-bold`}>
                  {item.count}
                </span>
              )}
              {!sidebarOpen && item.count && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 ${item.color} rounded-full text-[10px] flex items-center justify-center`}>
                  {item.count}
                </span>
              )}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                  {item.label}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="relative p-4 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-all group relative"
          >
            <LogOut size={20} className="group-hover:text-red-300" />
            {sidebarOpen && (
              <span className="text-sm font-medium group-hover:text-red-300">Logout</span>
            )}
            {!sidebarOpen && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                Logout
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/20 px-8 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent capitalize">
                {activeTab}
              </h1>
              
              {/* Search Bar */}
              <div className="hidden md:flex items-center flex-1 max-w-md ml-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search incidents, users, reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/50"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Time Display */}
              <div className="hidden lg:block text-right">
                <p className="text-sm font-medium text-gray-700">
                  {currentTime.toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Quick Actions */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
              >
                <PlusCircle size={20} />
              </motion.button>

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
                      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
                        <h3 className="font-semibold">Notifications</h3>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">5 new</span>
                      </div>
                      <div className="max-h-96 overflow-auto">
                        {recentActivities.map((activity, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 border-b hover:bg-gray-50 cursor-pointer flex items-start gap-3"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                              {activity.icon}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.action}</p>
                              <p className="text-xs text-gray-500 mt-1">{activity.time} • by {activity.user}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="p-3 bg-gray-50 text-center">
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          View All Notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/50 cursor-pointer hover:bg-white/80 transition"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </motion.div>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-4 border-b">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="p-2">
                        {['Profile', 'Settings', 'Help'].map((item) => (
                          <button key={item} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-lg">
                            {item}
                          </button>
                        ))}
                      </div>
                      <div className="p-2 border-t">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Welcome Banner - FIXED: Removed inline SVG */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white relative overflow-hidden"
          >
            {/* Simple pattern overlay using CSS gradient instead of SVG */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  rgba(255,255,255,0.1) 0px,
                  rgba(255,255,255,0.1) 2px,
                  transparent 2px,
                  transparent 8px
                )`
              }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}! 👋</h2>
                <p className="text-blue-100">Here's what's happening with your emergency response system today.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl text-white border border-white/30 hover:bg-white/30 transition flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh Data
              </motion.button>
            </div>
          </motion.div>

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
                <div className="relative bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/50 overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                      <div className="flex items-end gap-1">
                        <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                        {stat.suffix && (
                          <p className="text-sm text-gray-500 mb-1">{stat.suffix}</p>
                        )}
                      </div>
                    </div>
                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center text-2xl`}>
                      {stat.icon}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {stat.trend === 'up' ? (
                        <ArrowUpRight size={16} className="text-green-500" />
                      ) : (
                        <ArrowDownRight size={16} className="text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">vs last month</span>
                    </div>
                    
                    {/* Mini Chart */}
                    <MiniChart data={stat.chart} color={stat.color} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Incidents Table - Takes 2 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Active Incidents</h2>
                    <p className="text-sm text-gray-500 mt-1">Critical incidents requiring immediate attention</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                    >
                      <Filter size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                    >
                      <Download size={18} />
                    </motion.button>
                  </div>
                </div>

                {/* Selection Bar */}
                {selectedIncidents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-2 bg-blue-50 rounded-lg flex items-center justify-between"
                  >
                    <span className="text-sm text-blue-700">{selectedIncidents.length} incidents selected</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">Assign</button>
                      <button className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700">Bulk Update</button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 w-10">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIncidents(incidents.map(i => i.id));
                            } else {
                              setSelectedIncidents([]);
                            }
                          }}
                          checked={selectedIncidents.length === incidents.length}
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Incident</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {incidents.map((incident, index) => (
                      <motion.tr
                        key={incident.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.02)" }}
                        className="group"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedIncidents.includes(incident.id)}
                            onChange={() => toggleIncidentSelection(incident.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-medium text-gray-900">{incident.id}</span>
                          <div className="text-xs text-gray-400 mt-1">Priority {incident.priority}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800">{incident.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{incident.time}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Map size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{incident.location}</span>
                          </div>
                        </td>
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
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{incident.assignedTo}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-blue-100 rounded-lg text-blue-600">
                              <Eye size={16} />
                            </button>
                            <button className="p-1 hover:bg-green-100 rounded-lg text-green-600">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-1 hover:bg-red-100 rounded-lg text-red-600">
                              <Trash2 size={16} />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-600">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">Showing 1-5 of 24 incidents</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition">Previous</button>
                  {[1,2,3,4,5].map((page) => (
                    <button
                      key={page}
                      className={`w-8 h-8 rounded-lg text-sm ${
                        page === 1 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button className="px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition">Next</button>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Activity & Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <PlusCircle size={18} />, label: 'New Incident', color: 'from-blue-500 to-cyan-500' },
                    { icon: <UserPlus size={18} />, label: 'Add User', color: 'from-green-500 to-emerald-500' },
                    { icon: <Map size={18} />, label: 'View Map', color: 'from-purple-500 to-pink-500' },
                    { icon: <FileText size={18} />, label: 'Generate Report', color: 'from-orange-500 to-red-500' },
                  ].map((action, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 bg-gradient-to-br ${action.color} text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2`}
                    >
                      {action.icon}
                      <span className="text-xs font-medium">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{activity.time}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-xs text-gray-500">{activity.user}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded-lg transition">
                  View All Activity
                </button>
              </div>

              {/* System Status */}
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">System Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'API Services', status: 'Operational', color: 'bg-green-500' },
                    { label: 'Database', status: 'Healthy', color: 'bg-green-500' },
                    { label: 'WebSocket', status: 'Connected', color: 'bg-green-500' },
                    { label: 'Response Time', status: '124ms', color: 'bg-blue-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{item.status}</span>
                        <span className={`w-2 h-2 ${item.color} rounded-full animate-pulse`}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;