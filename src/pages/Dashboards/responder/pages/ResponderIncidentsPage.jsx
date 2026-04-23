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
  LayoutGrid,
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

        const [emergencyRes, typesRes] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/emergencies/responder-team/${responderTeamId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          axios.get("http://localhost:5000/api/emergencyType", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const incidentData = emergencyRes.data.data || [];
        setEmergencies(incidentData);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* --- HEADER --- */}
        <header className="flex items-center justify-between mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Assigned Incidents
              </h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                Active Dispatch Feed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-700 uppercase">
              Live Sync
            </span>
          </div>
        </header>

        {/* --- CONTROLS AREA --- */}
        <div className="space-y-6 mb-10">
          {/* 1. Search at the Top */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by location, kebele, or street..."
              className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-medium text-slate-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 2. Categories Below Search (Wrapped, No Scrollbar) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400 ml-1">
              <LayoutGrid size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Filter Category
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === null
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white border-slate-200 text-slate-500 hover:border-blue-600 hover:text-blue-600"
                }`}
              >
                All Emergencies
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id || cat.id}
                  onClick={() => setSelectedCategory(cat._id || cat.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategory === (cat._id || cat.id)
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-white border-slate-200 text-slate-500 hover:border-blue-600 hover:text-blue-600"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- LIST SECTION --- */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Retrieving Data...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredIncidents.map((incident) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={incident._id || incident.id}
                  onClick={() => handleOpenDetail(incident)}
                  className="group bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between hover:border-blue-600 hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                      <Clock size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                          {incident.category?.name || "Incident"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300">
                          #
                          {String(incident._id || incident.id)
                            .slice(-5)
                            .toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {incident.kebele?.name}{" "}
                        <span className="text-slate-400 font-normal">
                          / {incident.subdivision}
                        </span>
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          <MapPin size={12} className="text-blue-500" />
                          Location Detail
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase">
                          {new Date(incident.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        Priority
                      </p>
                      <p className="text-xs font-bold text-blue-600 uppercase italic">
                        {incident.status || "High"}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!isLoading && filteredIncidents.length === 0 && (
            <div className="bg-white border-2 border-dashed border-slate-200 py-16 rounded-2xl text-center">
              <Activity className="mx-auto text-slate-200 mb-4" size={40} />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                No matching tasks found
              </p>
            </div>
          )}
        </div>
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
