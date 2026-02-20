import React, { useState } from 'react';
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
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResponderDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user')) || {
    name: "Solomon Tadesse",
    role: "Emergency Responder",
    initials: "ST"
  };

  const stats = [
    { label: 'Total Responses', value: '156', icon: <AlertTriangle />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Now', value: '1', icon: <Radio />, color: 'from-red-500 to-orange-500' },
    { label: 'Resolved Today', value: '12', icon: <CheckCircle />, color: 'from-green-500 to-emerald-500' },
    { label: 'On Duty', value: '8h', icon: <Clock />, color: 'from-purple-500 to-pink-500' }
  ];

  const myIncidents = [
    { 
      id: 'INC-001', 
      title: 'Structure Fire on Kebele 14', 
      location: 'Kebele 14, Near St. George Church', 
      severity: 'critical', 
      status: 'active',
      distance: '1.2 km',
      type: 'Fire',
      eta: '4 min'
    },
    { 
      id: 'INC-006', 
      title: 'Gas Leak at Restaurant', 
      location: 'Fasil Avenue, Kebele 11', 
      severity: 'high', 
      status: 'closed',
      distance: '2.5 km',
      type: 'Hazmat',
      eta: '-'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      high: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
      medium: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      low: 'bg-gradient-to-r from-green-500 to-green-600 text-white'
    };
    return badges[severity] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`${sidebarOpen ? 'w-72' : 'w-24'} 
          bg-gradient-to-b from-blue-800 via-blue-900 to-indigo-900
          text-white shadow-2xl transition-all duration-500 flex flex-col relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative p-6 flex items-center justify-between border-b border-white/20">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center text-xl font-bold">
              BL
            </div>
            {sidebarOpen && (
              <h1 className="text-2xl font-bold tracking-wider">BahirLink</h1>
            )}
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
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
              <div>
                <p className="font-semibold text-lg">{user.name}</p>
                <p className="text-xs text-blue-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {user.role} · Fire & Rescue
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="relative flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: <Compass size={20} />, label: 'Dashboard' },
            { id: 'incidents', icon: <AlertTriangle size={20} />, label: 'My Incidents', badge: '1' },
            { id: 'map', icon: <MapPin size={20} />, label: 'Live Map' },
            { id: 'status', icon: <Radio size={20} />, label: 'Status' },
            { id: 'profile', icon: <User size={20} />, label: 'Profile' }
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: sidebarOpen ? 5 : 0 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} gap-3 px-4 py-3 rounded-xl transition-all relative group
                ${activeTab === item.id ? 'bg-white/20 backdrop-blur-md shadow-lg' : 'hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-3">
                <span className={activeTab === item.id ? 'text-white' : 'text-white/70 group-hover:text-white'}>
                  {item.icon}
                </span>
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </div>
              {sidebarOpen && item.badge && (
                <span className="px-2 py-1 bg-red-500 rounded-lg text-xs font-bold animate-pulse">
                  {item.badge}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="relative p-4 border-t border-white/20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-all group"
          >
            <LogOut size={20} className="group-hover:text-red-300" />
            {sidebarOpen && <span className="text-sm font-medium group-hover:text-red-300">Logout</span>}
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent capitalize">
              Responder Dashboard
            </h1>
            <p className="text-sm text-gray-500">Fire & Rescue Unit 7 · Station 3</p>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.1 }} className="relative p-2 hover:bg-gray-100 rounded-xl">
              <Bell size={22} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">On Duty</span>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Current Active Incident */}
          {myIncidents.find(i => i.status === 'active') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <div className="relative bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 text-white shadow-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">
                        ACTIVE INCIDENT
                      </span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold animate-pulse">
                        URGENT RESPONSE NEEDED
                      </span>
                    </div>
                    <span className="text-2xl">🚨</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">INC-001</h2>
                      <p className="text-xl mb-4">Structure Fire on Kebele 14</p>
                      <p className="flex items-center gap-2 text-white/80">
                        <MapPin size={16} />
                        Kebele 14, Near St. George Church · 1.2 km away
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                        <p className="text-xs opacity-80">Type</p>
                        <p className="font-semibold">Fire Emergency</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                        <p className="text-xs opacity-80">ETA</p>
                        <p className="font-semibold text-2xl">4 min</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                        <p className="text-xs opacity-80">Severity</p>
                        <p className="font-semibold text-red-300">Critical</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                        <p className="text-xs opacity-80">Units</p>
                        <p className="font-semibold">3 Responding</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-white text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2"
                    >
                      <Navigation size={18} />
                      Navigate
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-400 transition flex items-center justify-center gap-2"
                    >
                      <Phone size={18} />
                      Contact Citizen
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 bg-red-500 rounded-xl flex items-center justify-center hover:bg-red-400 transition"
                    >
                      <Radio size={18} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* My Incidents List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">My Incidents</h2>
              <p className="text-sm text-gray-500 mt-1">History of your responses</p>
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
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm font-medium text-gray-900">{incident.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityBadge(incident.severity)}`}>
                          {incident.severity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${incident.status === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}`}>
                          {incident.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{incident.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                        <MapPin size={14} />
                        {incident.location}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {incident.distance}
                        </span>
                        <span className="text-gray-500">Type: {incident.type}</span>
                        {incident.eta !== '-' && (
                          <span className="text-green-600 font-medium">ETA: {incident.eta}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition opacity-0 group-hover:opacity-100">
                        View Details
                      </button>
                      {incident.status === 'active' && (
                        <button className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition">
                          Update
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResponderDashboard;