import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (password === "1234") {
        const users = {
          admin: { name: "Abebe Kebede", role: "Administrator" },
          officer: { name: "Tigist Haile", role: "Agency Officer" },
          responder: { name: "Solomon Tadesse", role: "Emergency Responder" }
        };
        
        localStorage.setItem("user", JSON.stringify(users[role]));
        navigate(role === 'admin' ? '/dashboard/admin' : 
                 role === 'officer' ? '/dashboard/agency' : '/dashboard/responder');
      } else {
        alert("Use password: 1234");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-xl font-bold text-white">BL</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">BahirLink</h1>
            <p className="text-sm text-gray-500">Emergency Command Center</p>
          </div>

          {/* Role Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { id: 'admin', label: 'Admin', color: 'from-blue-600 to-indigo-600' },
              { id: 'officer', label: 'Agency', color: 'from-cyan-600 to-blue-600' },
              { id: 'responder', label: 'Responder', color: 'from-indigo-600 to-purple-600' }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`py-2 rounded-lg text-sm font-medium transition ${
                  role === r.id 
                    ? `bg-gradient-to-r ${r.color} text-white shadow-md`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            
            <button
              type="submit"
              disabled={!role || !username || !password || loading}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-4 text-center text-xs text-gray-400">
            <p>Demo: admin/1234 • officer/1234 • responder/1234</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;