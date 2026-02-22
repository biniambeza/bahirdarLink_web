import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  MapPin, 
  Phone,
  Navigation,
  Clock,
  CheckCircle,
  AlertTriangle,
  Radio,
  Compass,
  User,
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
  Users,
  Home,
  PieChart,
  RefreshCw,
  Wifi,
  Battery,
  Signal,
  Zap,
  Droplet,
  Wind,
  Thermometer,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock API service - replace with real API later
const mockResponderAPI = {
  getDashboardData: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      stats: [
        { 
          label: 'Total Responses', 
          value: '156', 
          change: '+12', 
          trend: 'up',
          color: 'from-blue-500 to-cyan-500',
          bg: 'bg-blue-50',
          chart: [40, 70, 50, 80, 60, 90, 75]
        },
        { 
          label: 'Active Now', 
          value: '1', 
          change: 'Critical', 
          trend: 'urgent',
          color: 'from-purple-500 to-pink-500',
          bg: 'bg-purple-50',
          chart: [90, 85, 95, 80, 90, 85, 95]
        },
        { 
          label: 'Resolved Today', 
          value: '12', 
          change: '+3', 
          trend: 'up',
          color: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50',
          chart: [30, 45, 60, 40, 70, 55, 80]
        },
        { 
          label: 'On Duty', 
          value: '8h', 
          change: '2h left', 
          trend: 'neutral',
          color: 'from-indigo-500 to-purple-500',
          bg: 'bg-indigo-50',
          chart: [80, 65, 70, 55, 60, 45, 40]
        }
      ],
      myIncidents: [
        { 
          id: 'INC-001', 
          title: 'Structure Fire on Kebele 14', 
          location: 'Kebele 14, Near St. George Church', 
          severity: 'critical', 
          status: 'active',
          distance: '1.2 km',
          type: 'Fire',
          eta: '4 min',
          priority: 1,
          units: ['Engine 7', 'Ladder 3'],
          reportedBy: 'Citizen',
          time: '2 min ago'
        },
        { 
          id: 'INC-006', 
          title: 'Gas Leak at Restaurant', 
          location: 'Fasil Avenue, Kebele 11', 
          severity: 'high', 
          status: 'resolved',
          distance: '2.5 km',
          type: 'Hazmat',
          eta: '-',
          priority: 2,
          units: ['Hazmat 2'],
          reportedBy: 'Restaurant Owner',
          time: '45 min ago'
        },
        { 
          id: 'INC-009', 
          title: 'Vehicle Accident with Injuries', 
          location: 'Ring Road, Junction 7', 
          severity: 'high', 
          status: 'responding',
          distance: '3.1 km',
          type: 'MVA',
          eta: '6 min',
          priority: 2,
          units: ['Rescue 1', 'Ambulance 4'],
          reportedBy: 'Dispatch',
          time: '8 min ago'
        }
      ],
      equipment: [
        { name: 'Air Tank', status: '85%', icon: <Wind />, color: 'from-green-500 to-green-600' },
        { name: 'Thermal Camera', status: 'Online', icon: <Thermometer />, color: 'from-blue-500 to-blue-600' },
        { name: 'Radio Battery', status: '92%', icon: <Battery />, color: 'from-green-500 to-green-600' },
        { name: 'Hydraulic Tools', status: 'Ready', icon: <Gauge />, color: 'from-yellow-500 to-yellow-600' }
      ],
      recentActivities: [
        { action: 'Dispatched to INC-001', location: 'Kebele 14', time: '2 min ago', icon: '🚒' },
        { action: 'Status update received', detail: 'Backup requested', time: '5 min ago', icon: '📻' },
        { action: 'New incident assigned', detail: 'INC-009 - MVA', time: '8 min ago', icon: '🚨' },
        { action: 'Equipment check completed', detail: 'All systems nominal', time: '15 min ago', icon: '🔧' },
        { action: 'Shift handoff reminder', detail: 'in 2 hours', time: '30 min ago', icon: '⏰' },
      ]
    };
  },

  refreshData: async () => {
    // Simulate refreshing data with slight variations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      stats: [
        { 
          label: 'Total Responses', 
          value: '158', 
          change: '+14', 
          trend: 'up',
          color: 'from-blue-500 to-cyan-500',
          bg: 'bg-blue-50',
          chart: [41, 71, 51, 81, 61, 91, 76]
        },
        { 
          label: 'Active Now', 
          value: '2', 
          change: 'Critical', 
          trend: 'urgent',
          color: 'from-purple-500 to-pink-500',
          bg: 'bg-purple-50',
          chart: [91, 86, 96, 81, 91, 86, 96]
        },
        { 
          label: 'Resolved Today', 
          value: '14', 
          change: '+5', 
          trend: 'up',
          color: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50',
          chart: [31, 46, 61, 41, 71, 56, 81]
        },
        { 
          label: 'On Duty', 
          value: '8h', 
          change: '1.5h left', 
          trend: 'neutral',
          color: 'from-indigo-500 to-purple-500',
          bg: 'bg-indigo-50',
          chart: [81, 66, 71, 56, 61, 46, 41]
        }
      ],
      myIncidents: [
        { 
          id: 'INC-001', 
          title: 'Structure Fire on Kebele 14', 
          location: 'Kebele 14, Near St. George Church', 
          severity: 'critical', 
          status: 'active',
          distance: '0.8 km',
          type: 'Fire',
          eta: '3 min',
          priority: 1,
          units: ['Engine 7', 'Ladder 3', 'Rescue 2'],
          reportedBy: 'Citizen',
          time: '5 min ago'
        },
        { 
          id: 'INC-009', 
          title: 'Vehicle Accident with Injuries', 
          location: 'Ring Road, Junction 7', 
          severity: 'high', 
          status: 'responding',
          distance: '2.8 km',
          type: 'MVA',
          eta: '5 min',
          priority: 2,
          units: ['Rescue 1', 'Ambulance 4'],
          reportedBy: 'Dispatch',
          time: '11 min ago'
        },
        { 
          id: 'INC-010', 
          title: 'Medical Emergency - Cardiac Arrest', 
          location: 'Residential Area, Block D', 
          severity: 'critical', 
          status: 'active',
          distance: '2.1 km',
          type: 'Medical',
          eta: '7 min',
          priority: 1,
          units: ['Ambulance 2'],
          reportedBy: 'Family',
          time: '1 min ago'
        },
        { 
          id: 'INC-006', 
          title: 'Gas Leak at Restaurant', 
          location: 'Fasil Avenue, Kebele 11', 
          severity: 'high', 
          status: 'resolved',
          distance: '2.5 km',
          type: 'Hazmat',
          eta: '-',
          priority: 2,
          units: ['Hazmat 2'],
          reportedBy: 'Restaurant Owner',
          time: '48 min ago'
        }
      ],
      equipment: [
        { name: 'Air Tank', status: '78%', icon: <Wind />, color: 'from-green-500 to-green-600' },
        { name: 'Thermal Camera', status: 'Online', icon: <Thermometer />, color: 'from-blue-500 to-blue-600' },
        { name: 'Radio Battery', status: '88%', icon: <Battery />, color: 'from-green-500 to-green-600' },
        { name: 'Hydraulic Tools', status: 'Ready', icon: <Gauge />, color: 'from-green-500 to-green-600' },
        { name: 'First Aid Kit', status: 'Full', icon: <Shield />, color: 'from-green-500 to-green-600' }
      ],
      recentActivities: [
        { action: 'New incident INC-010 assigned', detail: 'Medical Emergency', time: '1 min ago', icon: '🚨' },
        { action: 'Dispatched to INC-001', location: 'Kebele 14', time: '2 min ago', icon: '🚒' },
        { action: 'Status update received', detail: 'Backup requested', time: '5 min ago', icon: '📻' },
        { action: 'ETA updated for INC-009', detail: '5 minutes', time: '7 min ago', icon: '⏱️' },
        { action: 'Equipment check completed', detail: 'All systems nominal', time: '15 min ago', icon: '🔧' },
      ]
    };
  },

  updateIncidentStatus: async (incidentId, status) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: `Incident ${incidentId} status updated to ${status}` };
  },

  requestBackup: async (incidentId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: `Backup requested for incident ${incidentId}` };
  }
};

const ResponderDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  // State for data
  const [stats, setStats] = useState([]);
  const [myIncidents, setMyIncidents] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await mockResponderAPI.getDashboardData();
      setStats(data.stats);
      setMyIncidents(data.myIncidents);
      setEquipment(data.equipment);
      setRecentActivities(data.recentActivities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await mockResponderAPI.refreshData();
      setStats(data.stats);
      setMyIncidents(data.myIncidents);
      setEquipment(data.equipment);
      setRecentActivities(data.recentActivities);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (incidentId, status) => {
    try {
      await mockResponderAPI.updateIncidentStatus(incidentId, status);
      handleRefresh(); // Refresh data after update
    } catch (error) {
      console.error("Error updating incident status:", error);
    }
  };

  const handleRequestBackup = async (incidentId) => {
    try {
      await mockResponderAPI.requestBackup(incidentId);
      alert(`Backup requested for incident ${incidentId}`);
    } catch (error) {
      console.error("Error requesting backup:", error);
    }
  };

  const user = JSON.parse(localStorage.getItem('user')) || {
    name: "Solomon Tadesse",
    role: "Emergency Responder",
    initials: "ST",
    email: "solomon.tadesse@rescue.gov.et",
    department: "Emergency Response",
    badge: "ER-2024-0456",
    unit: "Unit 7",
    station: "Station 3",
    avatar: "https://ui-avatars.com/api/?name=Solomon+Tadesse&background=2563eb&color=fff&bold=true"
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
      high: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30',
      medium: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30',
      low: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
    };
    return badges[severity] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30',
      responding: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30',
      resolved: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30',
    };
    return badges[status] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeIncident = myIncidents.find(i => i.status === 'active');

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`${sidebarOpen ? 'w-80' : 'w-24'} 
          bg-gradient-to-b from-indigo-900/95 via-blue-900/95 to-indigo-900/95 
          backdrop-blur-xl text-white shadow-2xl transition-all duration-500 flex flex-col relative overflow-hidden border-r border-white/10`}
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 -right-40 w-80 h-80 bg-indigo-500 rounded-full blur-3xl animate-pulse-slower"></div>
        </div>

        {/* Logo Section */}
        <div className="relative p-6 flex items-center justify-between border-b border-white/10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold shadow-xl">
              ER
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  BahirLink
                </h1>
                <p className="text-xs text-blue-300/70">Emergency Response</p>
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
                <p className="text-xs text-blue-300/70 mt-1 truncate">{user.badge}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
          {[
            { id: 'dashboard', icon: <Compass size={20} />, label: 'Dashboard', count: null },
            { id: 'incidents', icon: <AlertTriangle size={20} />, label: 'My Incidents', count: myIncidents.filter(i => i.status !== 'resolved').length.toString(), color: 'bg-red-500' },
            { id: 'map', icon: <MapPin size={20} />, label: 'Live Map', count: null },
            { id: 'equipment', icon: <Gauge size={20} />, label: 'Equipment', count: equipment.length.toString(), color: 'bg-green-500' },
            { id: 'status', icon: <Radio size={20} />, label: 'Status', count: null },
            { id: 'profile', icon: <User size={20} />, label: 'Profile', count: null }
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: sidebarOpen ? 5 : 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group
                ${activeTab === item.id
                  ? 'bg-white/20 backdrop-blur-md shadow-lg border border-white/10'
                  : 'hover:bg-white/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className={activeTab === item.id ? 'text-white' : 'text-white/70 group-hover:text-white'}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </div>
              {sidebarOpen && item.count && (
                <span className={`px-2 py-1 ${item.color} rounded-lg text-xs font-bold animate-pulse`}>
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent capitalize">
                Responder Dashboard
              </h1>
              
              {/* Search Bar */}
              <div className="hidden md:flex items-center flex-1 max-w-md ml-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search incidents, locations..."
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

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition shadow-lg border border-gray-200 disabled:opacity-50"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
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
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{recentActivities.length} new</span>
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
                              <p className="text-xs text-gray-500 mt-1">{activity.time} • {activity.detail || activity.location}</p>
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

              {/* Status Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">On Duty · {user.unit}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white relative overflow-hidden"
          >
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
                <h2 className="text-2xl font-bold mb-2">Ready to respond, {user.name}! 🚨</h2>
                <p className="text-blue-100">{user.department} · {user.unit} · {user.station}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-lg px-3 py-1">
                  <Shield size={16} />
                  <span className="text-sm">Active Responder</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl text-white border border-white/30 hover:bg-white/30 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? 'Updating...' : 'Update Status'}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => {
              const IconComponent = 
                index === 0 ? AlertTriangle :
                index === 1 ? Radio :
                index === 2 ? CheckCircle : Clock;
              
              return (
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
                        </div>
                      </div>
                      <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center text-2xl`}>
                        <IconComponent className={`w-6 h-6 ${
                          index === 0 ? 'text-blue-500' :
                          index === 1 ? 'text-purple-500' :
                          index === 2 ? 'text-green-500' : 'text-indigo-500'
                        }`} />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {stat.trend === 'up' && <ArrowUpRight size={16} className="text-green-500" />}
                        {stat.trend === 'down' && <ArrowDownRight size={16} className="text-red-500" />}
                        {stat.trend === 'urgent' && <Zap size={16} className="text-purple-500 animate-pulse" />}
                        <span className={`text-xs font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 
                          stat.trend === 'down' ? 'text-red-600' : 
                          stat.trend === 'urgent' ? 'text-purple-600' : 'text-gray-600'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      
                      {/* Mini Chart */}
                      <MiniChart data={stat.chart} color={stat.color} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Current Active Incident */}
          {activeIncident && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">
                        ⚡ ACTIVE INCIDENT
                      </span>
                      <span className="px-3 py-1 bg-purple-500/30 backdrop-blur rounded-full text-xs font-semibold animate-pulse">
                        URGENT RESPONSE NEEDED
                      </span>
                    </div>
                    <span className="text-3xl animate-pulse">🚨</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-3xl font-bold">{activeIncident.id}</h2>
                        <span className="px-3 py-1 bg-red-500/30 backdrop-blur rounded-full text-xs font-semibold">
                          Priority {activeIncident.priority}
                        </span>
                      </div>
                      <p className="text-xl mb-4">{activeIncident.title}</p>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-white/80">
                          <MapPin size={16} />
                          {activeIncident.location} · {activeIncident.distance} away
                        </p>
                        <p className="flex items-center gap-2 text-white/80">
                          <Clock size={16} />
                          Reported {activeIncident.time}
                        </p>
                        <p className="flex items-center gap-2 text-white/80">
                          <Users size={16} />
                          Units: {activeIncident.units?.join(', ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                        <p className="text-xs opacity-80">Type</p>
                        <p className="font-semibold text-lg">{activeIncident.type === 'Fire' ? '🔥' : '🚑'} {activeIncident.type}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                        <p className="text-xs opacity-80">ETA</p>
                        <p className="font-semibold text-3xl text-yellow-300">{activeIncident.eta}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                        <p className="text-xs opacity-80">Severity</p>
                        <p className={`font-semibold ${activeIncident.severity === 'critical' ? 'text-red-300' : 'text-orange-300'}`}>
                          {activeIncident.severity}
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                        <p className="text-xs opacity-80">Responders</p>
                        <p className="font-semibold">{activeIncident.units?.length || 1} on scene</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Navigation size={18} />
                      Navigate
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRequestBackup(activeIncident.id)}
                      className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-400 transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Phone size={18} />
                      Request Backup
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 bg-indigo-500 rounded-xl flex items-center justify-center hover:bg-indigo-400 transition shadow-lg"
                    >
                      <Radio size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 bg-purple-500 rounded-xl flex items-center justify-center hover:bg-purple-400 transition shadow-lg"
                    >
                      <MoreVertical size={18} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Two Column Layout for Incidents and Equipment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Incidents List - Takes 2 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">My Incidents</h2>
                    <p className="text-sm text-gray-500 mt-1">History of your responses</p>
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
              </div>

              <div className="divide-y divide-gray-100">
                {myIncidents.map((incident, index) => (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition cursor-pointer group"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-mono text-sm font-medium text-gray-900">{incident.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityBadge(incident.severity)}`}>
                            {incident.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(incident.status)}`}>
                            {incident.status}
                          </span>
                          {incident.priority === 1 && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold animate-pulse">
                              Priority 1
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{incident.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                          <MapPin size={14} />
                          {incident.location}
                        </p>
                        <div className="flex items-center gap-4 text-xs flex-wrap">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {incident.time}
                          </span>
                          <span className="text-gray-500">Type: {incident.type}</span>
                          <span className="text-gray-500">Units: {incident.units?.join(', ')}</span>
                          {incident.eta !== '-' && incident.status === 'active' && (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                              <Navigation size={12} />
                              ETA: {incident.eta}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition opacity-0 group-hover:opacity-100">
                          View Details
                        </button>
                        {incident.status === 'active' && (
                          <button 
                            onClick={() => handleUpdateStatus(incident.id, 'responding')}
                            className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
                          >
                            Update
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* View All Link */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All Incidents →
                </button>
              </div>
            </motion.div>

            {/* Right Column - Equipment & Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* Equipment Status */}
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Equipment Status</h2>
                <div className="space-y-4">
                  {equipment.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center text-white`}>
                          {item.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className={`text-sm font-semibold ${
                        item.status.includes('%') ? 'text-green-600' : 
                        item.status === 'Online' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {item.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded-lg transition">
                  Check All Equipment
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Navigation />, label: 'Navigate', color: 'from-blue-500 to-cyan-500', onClick: () => console.log('Navigate') },
                    { icon: <Radio />, label: 'Radio', color: 'from-purple-500 to-pink-500', onClick: () => console.log('Radio') },
                    { icon: <Phone />, label: 'Call Dispatch', color: 'from-green-500 to-emerald-500', onClick: () => console.log('Call') },
                    { icon: <MapPin />, label: 'Mark Location', color: 'from-indigo-500 to-purple-500', onClick: () => console.log('Mark') },
                    { icon: <Users />, label: 'Request Backup', color: 'from-orange-500 to-red-500', onClick: () => handleRequestBackup('current') },
                    { icon: <CheckCircle />, label: 'Status Update', color: 'from-teal-500 to-green-500', onClick: () => handleUpdateStatus('current', 'responding') }
                  ].map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={action.onClick}
                      className={`p-4 bg-gradient-to-br ${action.color} text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2`}
                    >
                      {action.icon}
                      <span className="text-xs font-medium">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/50 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Updates</h2>
                <div className="space-y-3">
                  {recentActivities.slice(0, 3).map((activity, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded-lg transition">
                  View All Activity
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponderDashboard;