import { useState, useEffect, useMemo } from "react";
import axios from "axios";
// Added Edit2 to imports
import { PlusCircle, Users, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AddAgentPanel from "./AddAgentPanel";

const AgentsPage = () => {
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);

  // Fetch agents
  const fetchAgents = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/agency/my-agents",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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

  // Filter agents
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
    <div className="p-6 space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Agents Management
          </h1>
          <p className="text-sm text-slate-500">
            Manage field agents efficiently.
          </p>
        </div>
        <button
          onClick={() => setShowAddPanel(true)}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition"
        >
          <PlusCircle size={20} /> Add Agent
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, phone or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-slate-200 rounded-full px-4 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <Users
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500 col-span-full">Loading agents...</p>
        ) : error ? (
          <p className="text-red-500 col-span-full">{error}</p>
        ) : filteredAgents.length === 0 ? (
          <p className="text-slate-500 col-span-full">No agents found.</p>
        ) : (
          <AnimatePresence>
            {filteredAgents.map((agent, idx) => (
              <motion.div
                key={agent.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-lg flex flex-col gap-3 transition-all hover:scale-[1.02] cursor-pointer relative"
                onClick={() => navigate(`/edit-agent/${agent.id}`)}
              >
                {/* Header with Status and Edit Icon */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-lg text-slate-800 leading-tight">
                      {agent.name}
                    </h4>
                    <span
                      className={`text-[10px] inline-block font-black uppercase px-2 py-0.5 rounded-md ${
                        agent.status === "active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>

                  {/* Dedicated Edit Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents double navigation
                      navigate(`/edit-agent/${agent.id}`);
                    }}
                    className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>

                <div className="space-y-1 mt-2">
                  <p className="text-slate-500 text-sm flex items-center gap-2">
                    {agent.email}
                  </p>
                  <p className="text-slate-500 text-sm">{agent.phone}</p>
                  <p className="text-slate-400 text-xs italic">
                    {agent.location}
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Type:{" "}
                    <span className="text-blue-600">
                      {agent.AgencyType?.name || "N/A"}
                    </span>
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Agent Panel */}
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
