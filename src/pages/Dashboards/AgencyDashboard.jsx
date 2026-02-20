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
  Car,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Radio,
  BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AgencyDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const user = JSON.parse(localStorage.getItem('user')) || {
    name: "Tigist Haile",
    role: "Agency Officer",
    initials: "TH"
  };

  const stats = [
    { label: 'Active Incidents', value: '8', icon: <AlertTriangle />, change: '+2', color: 'from-red-500 to-orange-500' },
    { label: 'Available Units', value: '12', icon: <Car />, change: '+3', color: 'from-blue-500 to-cyan-500' },
    { label: 'Response Time', value: '3.8 min', icon: <Clock />, change: '-0.5', color: 'from-green-500 to-emerald-500' },
    { label: 'Resolved Today', value: '7', icon: <CheckCircle />, change: '+2', color: 'from-purple-500 to-pink-500' }
  ];

  const incidents = [
    { id: 'INC-002', title: 'Multi-Vehicle Accident on Ring Road', location: 'Ring Road, Near Ghion Hotel', severity: 'high', status: 'responding', time: '5 min ago' },
    { id: 'INC-005', title: 'Theft Report at Market Area', location: 'Central Market, Kebele 7', severity: 'low', status: 'resolved', time: '30 min ago' },
    { id: 'INC-007', title: 'Suspicious Activity at Bus Station', location: 'Main Bus Station, Kebele 5', severity: 'medium', status: 'active', time: '15 min ago' }
  ];

  const units = [
    { id: 'UNIT-01', type: 'Patrol Car', status: 'available', location: 'Kebele 12', eta: '2 min' },
    { id: 'UNIT-02', type: 'Rapid Response', status: 'responding', location: 'Ring Road', eta: '5 min' },
    { id: 'UNIT-03', type: 'K9 Unit', status: 'available', location: 'HQ', eta: '-' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      high: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      medium: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      low: 'bg-gradient-to-r from-green-500 to-green-600 text-white'
    };
    return badges[severity] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      responding: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      resolved: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
      available: 'bg-gradient-to-r from-green-500 to-green-600 text-white'
    };
    return badges[status] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`${sidebarOpen ? 'w-72' : 'w-24'} 
          bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900
          text-white shadow-2xl transition-all duration-500 flex flex-col relative overflow-hidden`}
      >
        {/* Decorative elements */}
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
                  {user.role} · Police Dept
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="relative flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: <BarChart2 size={20} />, label: 'Dashboard' },
            { id: 'incidents', icon: <AlertTriangle size={20} />, label: 'Incidents', badge: '3' },
            { id: 'requests', icon: <FileText size={20} />, label: 'Requests' },
            { id: 'units', icon: <Car size={20} />, label: 'Units', badge: '12' },
            { id: 'dispatch', icon: <Radio size={20} />, label: 'Dispatch' },
            { id: 'team', icon: <Users size={20} />, label: 'Team' }
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
                <span className="px-2 py-1 bg-red-500 rounded-lg text-xs font-bold">{item.badge}</span>
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
              {activeTab}
            </h1>
            <p className="text-sm text-gray-500">Police Department · Bahir Dar Division</p>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.1 }} className="relative p-2 hover:bg-gray-100 rounded-xl">
              <Bell size={22} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>
            
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/50">
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
                    <p className={`text-xs mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from yesterday
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Incidents Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Active Incidents</h2>
                <p className="text-sm text-gray-500 mt-1">Incidents requiring police response</p>
              </div>

              <div className="divide-y divide-gray-100">
                {incidents.map((incident, index) => (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 hover:bg-gray-50 transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-gray-900">{incident.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityBadge(incident.severity)}`}>
                          {incident.severity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(incident.status)}`}>
                          {incident.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{incident.time}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">{incident.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} />
                      {incident.location}
                    </p>
                    <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">Dispatch Unit</button>
                      <button className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50">View Details</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Units & Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Available Units */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800">Available Units</h2>
                  <p className="text-sm text-gray-500 mt-1">Ready for dispatch</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {units.map((unit, index) => (
                    <motion.div
                      key={unit.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-medium text-gray-900">{unit.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(unit.status)}`}>
                          {unit.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{unit.type}</p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          <MapPin size={12} />
                          {unit.location}
                        </span>
                        {unit.eta !== '-' && (
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            ETA: {unit.eta}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View All Units →
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Car />, label: 'Dispatch Unit', color: 'from-blue-500 to-cyan-500' },
                    { icon: <Radio />, label: 'Broadcast', color: 'from-purple-500 to-pink-500' },
                    { icon: <FileText />, label: 'New Report', color: 'from-green-500 to-emerald-500' },
                    { icon: <Users />, label: 'Team Status', color: 'from-orange-500 to-red-500' }
                  ].map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 bg-gradient-to-br ${action.color} text-white rounded-xl text-center hover:shadow-lg transition-all`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {action.icon}
                        <span className="text-xs font-medium">{action.label}</span>
                      </div>
                    </motion.button>
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

export default AgencyDashboard;