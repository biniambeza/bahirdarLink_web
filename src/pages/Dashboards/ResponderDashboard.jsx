import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Menu, X, ChevronDown, MapPin, Phone } from 'lucide-react';

const ResponderDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {
    name: "Solomon Tadesse",
    role: "Emergency Responder",
    initials: "ST"
  };

  const stats = [
    { label: 'Total Incidents', value: '156', icon: '🚨' },
    { label: 'Active Now', value: '23', icon: '🔥' },
    { label: 'Resolved Today', value: '12', icon: '✅' },
    { label: 'Avg Response', value: '4.2 min', icon: '⏱️' }
  ];

  const myIncidents = [
    { 
      id: 'INC-001', 
      title: 'Structure Fire on Kebele 14', 
      location: 'Kebele 14, Near St. George Church', 
      severity: 'critical', 
      status: 'active',
      distance: '1.2 km',
      type: 'Fire'
    },
    { 
      id: 'INC-006', 
      title: 'Gas Leak at Restaurant', 
      location: 'Fasil Avenue, Kebele 11', 
      severity: 'high', 
      status: 'closed',
      distance: '2.5 km',
      type: 'Hazmat'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    };
    return colors[severity] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-blue-100 text-blue-700' 
      : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-blue-600">BahirLink</h1>
          ) : (
            <h1 className="text-xl font-bold text-blue-600 mx-auto">BL</h1>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-100 rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              {user.initials}
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
                <p className="text-xs text-gray-400">Fire & Rescue</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span>📊</span>
            {sidebarOpen && <span className="text-sm">Dashboard</span>}
          </button>
          <button 
            onClick={() => setActiveTab('incidents')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 ${activeTab === 'incidents' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span>🚨</span>
            {sidebarOpen && <span className="text-sm">My Incidents</span>}
          </button>
        </nav>

        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{user.name}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-lg">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Current Assignment - Active Incident */}
          {myIncidents.find(i => i.status === 'active') && (
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Current Assignment</h2>
                <span className="px-2 py-0.5 bg-white text-blue-700 rounded-full text-xs font-medium">
                  Active Now
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-100 text-xs">Incident ID</p>
                  <p className="font-medium">INC-001</p>
                </div>
                <div>
                  <p className="text-blue-100 text-xs">Type</p>
                  <p className="font-medium">Structure Fire</p>
                </div>
                <div className="col-span-2">
                  <p className="text-blue-100 text-xs">Location</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin size={12} />
                    Kebele 14, Near St. George Church
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-white text-blue-700 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-50">
                  Navigate
                </button>
                <button className="flex-1 bg-blue-500 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-blue-400">
                  Update Status
                </button>
                <button className="w-10 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-400">
                  <Phone size={16} />
                </button>
              </div>
            </div>
          )}

          {/* My Incidents List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">My Incidents</h2>
            </div>
            <div className="divide-y">
              {myIncidents.map((incident) => (
                <div key={incident.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{incident.id}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={12} />
                      {incident.distance}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mb-1">{incident.title}</p>
                  <p className="text-xs text-gray-500 mb-2">{incident.location}</p>
                  <div className="flex gap-2">
                    <button className="text-xs text-blue-600 hover:text-blue-800">View Details</button>
                    <button className="text-xs text-green-600 hover:text-green-800">Contact Citizen</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponderDashboard;