import React, { useState } from "react";
import { Lock, User, Shield, Building2, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const roles = [
    { 
      value: 'Administrator', 
      label: 'Administrator', 
      description: 'Full access to all features',
      icon: <Shield className="h-4 w-4" />
    },
    { 
      value: 'Agency Officer', 
      label: 'Agency Officer', 
      description: 'Manage agency incidents',
      icon: <Building2 className="h-4 w-4" />
    },
    { 
      value: 'Emergency Responder', 
      label: 'Emergency Responder', 
      description: 'View assigned tasks',
      icon: <Truck className="h-4 w-4" />
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    // Simple authentication with password 1234 for all users
    if (password === "1234") {
      let userData = null;
      let redirectPath = "";
      
      if (selectedRole === 'Administrator' && username === "admin") {
        userData = {
          name: "Abebe Kebede",
          role: "Administrator",
          initials: "AK"
        };
        redirectPath = "/dashboard/admin";
      } else if (selectedRole === 'Agency Officer' && username === "officer") {
        userData = {
          name: "Tigist Haile",
          role: "Agency Officer",
          initials: "TH"
        };
        redirectPath = "/dashboard/agency";
      } else if (selectedRole === 'Emergency Responder' && username === "responder") {
        userData = {
          name: "Solomon Tadesse",
          role: "Emergency Responder",
          initials: "ST"
        };
        redirectPath = "/dashboard/responder";
      } else {
        alert("Invalid username for selected role");
        return;
      }

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Navigate to the appropriate dashboard
      navigate(redirectPath);
    } else {
      alert("Invalid password. Use 1234 for all users");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-center">
          <h1 className="text-2xl font-bold text-white">BahirLink</h1>
          <p className="text-blue-100 text-xs mt-0.5">Emergency Management Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-0.5">Sign In</h2>
          <p className="text-gray-500 text-xs mb-4">Select role and enter credentials</p>

          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Role
            </label>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full px-3 py-2 text-left bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDropdownOpen ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={selectedRole ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedRole || 'Select role...'}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.value);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 border-b last:border-0 border-gray-100"
                    >
                      <span className="text-blue-600">{role.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{role.label}</div>
                        <div className="text-xs text-gray-400">{role.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-7 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-7 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={!selectedRole}
            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedRole
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Sign In
          </button>

          {/* Demo Credentials */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Demo:</p>
            <div className="flex justify-center gap-3 text-xs">
              <span className="text-gray-600">admin/1234</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">officer/1234</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">responder/1234</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 text-xs text-gray-400">
            Bahir Dar City Administration
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;