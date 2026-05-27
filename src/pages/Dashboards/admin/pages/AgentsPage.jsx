import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { PlusCircle, Users, Edit2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AddAgentPanel from "./AddAgentPanel";

// Production Render Server Fallback Configuration
const LOCAL_API = "http://localhost:5000";
const RENDER_API = "https://bahirlink-backend-1.onrender.com";

let API_BASE = window.location.hostname === "localhost" ? LOCAL_API : RENDER_API;

// Self-executing optimization fallback rule to check if localhost is down
if (window.location.hostname === "localhost") {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  fetch(`${LOCAL_API}/api/agency/my-agents`, { method: "HEAD", signal: controller.signal })
    .then(() => {
      clearTimeout(timeoutId);
    })
    .catch(() => {
      clearTimeout(timeoutId);
      console.warn("⚠️ Localhost server unreachable. Automatically routing payload requests to Render Production Environment.");
      API_BASE = RENDER_API;
    });
}

const AgentsPage = () => {
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/api/agency/my-agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setAgents(data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const filteredAgents = useMemo(
    () =>
      agents.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.phone || "").includes(searchQuery) ||
          (a.AgencyType?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    [searchQuery, agents],
  );

  return (
    <div className="p-6 space-y-6 relative bg-slate-50 text-slate-800 min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Agents Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, coordinate, and review active field agents.
          </p>
        </div>
        <button
          onClick={() => setShowAddPanel(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-blue-500/10 hover:scale-[1.01] transition-all duration-200 text-sm font-medium"
        >
          <PlusCircle size={18} /> Add Agent
        </button>
      </div>

      {/* Filter / Search Controls */}
      <div className="relative w-full max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, phone or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <Users
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {/* Core Agents Cards Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm font-medium">Fetching directory records...</p>
          </div>
        ) : error ? (
          <div className="col-span-full bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3 text-rose-600 text-sm">
            <ShieldAlert size={18} className="shrink-0" />
            <span>Failed to load agents: {error}</span>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-slate-200 bg-white rounded-2xl p-12 text-center">
            <p className="text-slate-400 text-sm font-medium">No agents match your current search criteria.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredAgents.map((agent, idx) => (
              <motion.div
                key={agent.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 flex flex-col gap-4 transition-all cursor-pointer relative"
                onClick={() => navigate(`/edit-agent/${agent.id}`)}
              >
                {/* Header Information Element inside Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight">
                      {agent.name}
                    </h4>
                    <span
                      className={`text-[10px] inline-flex items-center gap-1 font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                        agent.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${agent.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                      {agent.status}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit-agent/${agent.id}`);
                    }}
                    className="p-2 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>

                {/* Registry Details Sub-Box */}
                <div className="space-y-1.5 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
                  <p className="truncate font-medium text-xs text-slate-700">{agent.email}</p>
                  <p className="text-xs text-slate-500">{agent.phone}</p>
                  {agent.location && (
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      📍 {agent.location}
                    </p>
                  )}
                </div>

                {/* Footer Section Tag */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    Assignment Type
                  </p>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50/70 px-2 py-0.5 border border-blue-100/50 rounded-md">
                    {agent.AgencyType?.name || "Unassigned"}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Slide Overlay Panels */}
      <AnimatePresence>
        {showAddPanel && (
          <AddAgentPanel
            closePanel={() => setShowAddPanel(false)}
            refreshAgents={fetchAgents}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentsPage;