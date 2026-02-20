import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Menu, X, ChevronDown } from 'lucide-react';

const AgencyDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {
    name: "Tigist Haile",
    role: "Agency Officer",
    initials: "TH"
  };

  const stats = [
    { label: 'Active Incidents', value: '8', icon: '🚨' },
    { label: 'Available Units', value: '12', icon: '👮' },
    { label: 'Response Time', value: '3.8 min', icon: '⏱️' },
    { label: 'Resolved Today', value: '7', icon: '✅' }
  ];

  const incidents = [
    { id: 'INC-002', title: 'Multi-Vehicle Accident on Ring Road', location: 'Ring Road, Near Ghion Hotel', severity: 'high', status: 'responding' },
    { id: 'INC-005', title: 'Theft Report at Market Area', location: 'Central Market, Kebele 7', severity: 'low', status: 'resolved' },
    { id: 'INC-007', title: 'Suspicious Activity at Bus Station', location: 'Main Bus Station, Kebele 5', severity: 'medium', status: 'active' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    };
    return badges[severity] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-blue-100 text-blue-700',
      responding: 'bg-purple-100 text-purple-700',
      resolved: 'bg-gray-100 text-gray-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
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
                <p className="text-xs text-gray-400">Police Department</p>
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
            {sidebarOpen && <span className="text-sm">Incidents</span>}
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 ${activeTab === 'requests' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span>📋</span>
            {sidebarOpen && <span className="text-sm">Service Requests</span>}
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

          {/* Department Incidents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-800">Department Incidents</h2>
                <p className="text-xs text-gray-400 mt-0.5">Police Department · Bahir Dar Division</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Filter</button>
                <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ New</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Severity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-800">{incident.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{incident.title}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{incident.location}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(incident.status)}`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button className="text-xs text-blue-600 hover:text-blue-800 mr-2">View</button>
                        <button className="text-xs text-green-600 hover:text-green-800">Assign</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <button className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 text-left hover:bg-gray-50">
              <span className="text-xl block mb-1">🚔</span>
              <span className="text-sm font-medium text-gray-800">Dispatch Units</span>
              <p className="text-xs text-gray-400 mt-0.5">Assign responders to incidents</p>
            </button>
            <button className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 text-left hover:bg-gray-50">
              <span className="text-xl block mb-1">📋</span>
              <span className="text-sm font-medium text-gray-800">View Reports</span>
              <p className="text-xs text-gray-400 mt-0.5">Generate department reports</p>
            </button>
            <button className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 text-left hover:bg-gray-50">
              <span className="text-xl block mb-1">👥</span>
              <span className="text-sm font-medium text-gray-800">Team Status</span>
              <p className="text-xs text-gray-400 mt-0.5">Check responder availability</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;