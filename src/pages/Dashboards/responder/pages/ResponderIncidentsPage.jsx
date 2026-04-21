import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Clock,
  ChevronRight,
  Activity,
  ShieldCheck,
} from "lucide-react";
import EmergencyDetailDrawer from "./EmergencyDetailDrawer";

const ResponderIncidentsPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("responderToken");
        if (!token) return;

        const decoded = jwtDecode(token);
        const responderTeamId = decoded.id;

        // Fetch Emergencies and Emergency Types in parallel
        const [emergencyRes, typesRes] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/emergencies/responder-team/${responderTeamId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          axios.get("http://localhost:5000/api/emergencyType", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const incidentData = emergencyRes.data.data || [];
        setEmergencies(incidentData);

        // Logic to find all categories belonging to the team's specific type
        // We look at the first incident to see what type this team handles
        if (incidentData.length > 0) {
          const teamTypeId = incidentData[0].emergencyTypeId;
          const targetType = typesRes.data.emergencyTypes.find(
            (t) => t._id === teamTypeId || t.id === teamTypeId,
          );
          setCategories(targetType?.categories || []);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredIncidents = useMemo(() => {
    return emergencies.filter((incident) => {
      const matchesCategory =
        !selectedCategory || incident.categoryId === selectedCategory;
      const query = searchQuery.toLowerCase();
      const location =
        `${incident.kebele?.name} ${incident.subdivision}`.toLowerCase();
      return location.includes(query) && matchesCategory;
    });
  }, [emergencies, selectedCategory, searchQuery]);

  const handleOpenDetail = (incident) => {
    setSelectedIncident(incident);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* --- HEADER --- */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Responder Unit
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Assigned <span className="text-blue-600">Tasks</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                On Duty
              </span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <Activity size={16} className="text-blue-500" />
          </div>
        </header>

        {/* --- CONTROLS --- */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 pl-12 pr-4 py-3.5 rounded-2xl transition-all outline-none text-sm font-medium"
              placeholder="Search by location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === null
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-blue-200"
              }`}
            >
              All Tasks
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id || cat.id}
                onClick={() => setSelectedCategory(cat._id || cat.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === (cat._id || cat.id)
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-blue-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* --- LIST --- */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">
              Syncing Dispatch...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredIncidents.map((incident, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: index * 0.02 }}
                  key={incident._id || incident.id}
                  onClick={() => handleOpenDetail(incident)}
                  className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                      <Clock size={20} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {incident.category?.name || "Emergency"}
                        </span>
                        <span className="text-[10px] font-medium text-slate-300 italic">
                          REF: #
                          {String(incident._id || incident.id)
                            .slice(-5)
                            .toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {incident.kebele?.name} • {incident.subdivision}
                      </h3>
                      <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1 text-[11px] font-medium">
                          <MapPin size={12} className="text-blue-400" />
                          View Map Path
                        </div>
                        <div className="text-[11px] font-medium">
                          {new Date(incident.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right">
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">
                        Urgency
                      </p>
                      <p className="text-[11px] font-bold text-blue-600 uppercase italic">
                        {incident.status || "Active"}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!isLoading && filteredIncidents.length === 0 && (
              <div className="bg-white py-20 rounded-3xl border-2 border-dashed border-slate-100 text-center">
                <p className="text-sm font-semibold text-slate-400">
                  No assigned tasks found.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <EmergencyDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        emergency={selectedIncident}
      />
    </div>
  );
};

export default ResponderIncidentsPage;
