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
import IncidentDetails from "./IncidentDetailPage";

const IncidentsPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const agency = JSON.parse(localStorage.getItem("agency") || "{}");

        const [emergenciesRes, typesRes] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/emergencies/agency/${agency.id}/emergencies`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          axios.get("http://localhost:5000/api/emergencyType"),
        ]);

        setEmergencies(emergenciesRes?.data?.data || []);
        const targetType = typesRes.data.emergencyTypes.find(
          (t) => t.name === "Crime" || t.name === "Service",
        );
        setCategories(targetType?.categories || []);
      } catch (err) {
        console.error("Data fetch failed:", err);
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
      const location = [incident.kebele, incident.subdivision, incident.street]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return location.includes(query) && matchesCategory;
    });
  }, [emergencies, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* --- HEADER --- */}
        <header className="flex items-center justify-between mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Incident Logs
              </h1>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Agency Management Portal
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
              System Live
            </span>
            <Activity size={14} className="text-blue-500 ml-1" />
          </div>
        </header>

        {/* --- CONTROLS AREA --- */}
        <div className="space-y-6 mb-10">
          {/* 1. Search Bar at the Top */}
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by kebele, subdivision, or street..."
              className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 2. Categories Below (Wrapped, No Scrollbar) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400 ml-1">
              <LayoutGrid size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Filter by Classification
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === null
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                    : "bg-white border-slate-200 text-slate-500 hover:border-blue-600 hover:text-blue-600"
                }`}
              >
                All Records
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
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
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Accessing Secure Database...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredIncidents.map((incident, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  key={incident._id || incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className="group bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    {/* Icon Slot */}
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                      <Clock size={22} />
                    </div>

                    {/* Text Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                          {categories.find((c) => c.id === incident.categoryId)
                            ?.name || "General"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300">
                          REF-
                          {String(incident._id || incident.id)
                            .slice(-6)
                            .toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {[incident.kebele, incident.subdivision]
                          .filter(Boolean)
                          .join(" • ")}
                      </h3>

                      <div className="flex items-center gap-4 mt-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          <MapPin size={12} className="text-blue-500" />
                          {incident.street || "Zone Undefined"}
                        </div>
                        <div className="text-[11px] font-bold text-slate-400">
                          {new Date(incident.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right hidden sm:block border-r border-slate-100 pr-5">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        Entry Status
                      </p>
                      <p className="text-xs font-bold text-blue-600 uppercase italic">
                        Pending Review
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!isLoading && filteredIncidents.length === 0 && (
            <div className="bg-white border-2 border-dashed border-slate-200 py-20 rounded-[2rem] text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                No matching records
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- DETAIL OVERLAY --- */}
      <AnimatePresence>
        {selectedIncident && (
          <IncidentDetails
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default IncidentsPage;
