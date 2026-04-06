import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  AlertTriangle,
  ChevronRight,
  Clock,
  MapPin,
  ShieldCheck,
  User,
  Activity,
} from "lucide-react";
import IncidentDetails from "./IncidentDetailPage";

const IncidentsPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const agency = JSON.parse(localStorage.getItem("agency") || "{}");
        if (!token || !agency?.id) throw new Error("Agency not logged in");

        const [emergenciesRes, categoriesRes] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/emergencies/agency/${agency.id}/emergencies`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          axios.get("http://localhost:5000/api/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const categoriesMap = {};
        categoriesRes.data.forEach((c) => (categoriesMap[c.id] = c.name));
        setEmergencies(emergenciesRes?.data?.data || []);
        setCategories(categoriesMap);
      } catch (err) {
        setError(err?.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredIncidents = useMemo(() => {
    return emergencies.filter((incident) => {
      const type = incident.emergencyType?.name?.toLowerCase() || "";
      const category = categories[incident.categoryId]?.toLowerCase() || "";
      const location = [incident.kebele, incident.subdivision, incident.street]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const query = searchQuery.toLowerCase();
      return (
        type.includes(query) ||
        category.includes(query) ||
        location.includes(query)
      );
    });
  }, [searchQuery, emergencies, categories]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-50/50 blur-[120px]" />
      </div>

      <div className="relative z-10 p-6 lg:p-12 max-w-7xl mx-auto">
        {/* Compact Header Section */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-200/60 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">
                  Live Command Center
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Incident{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Control
                </span>
              </h1>
            </div>

            {/* Styled Search Bar */}
            <div className="relative w-full md:w-[450px]">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by location, incident type, or status..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 shadow-sm shadow-slate-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <main>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
              <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
              <h3 className="text-lg font-bold text-red-900">
                System Sync Failed
              </h3>
              <p className="text-red-600/80">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredIncidents.length > 0 ? (
                  filteredIncidents.map((incident) => (
                    <IncidentCard
                      key={incident._id}
                      incident={incident}
                      categoryName={categories[incident.categoryId]}
                      onClick={() => setSelectedIncident(incident)}
                    />
                  ))
                ) : (
                  <EmptyState query={searchQuery} />
                )}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

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

const IncidentCard = ({ incident, categoryName, onClick }) => {
  const location =
    [incident.kebele, incident.subdivision, incident.street]
      .filter(Boolean)
      .join(", ") || "Location Pending";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group bg-white border border-slate-200 p-6 rounded-[2rem] cursor-pointer hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-6">
          <div className="relative shrink-0">
            <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
              <Activity size={24} />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                {incident.emergencyType?.name || "Unclassified Report"}
              </h3>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-widest">
                {categoryName || "General"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-slate-500">
              <div className="flex items-center gap-2 text-xs font-medium">
                <MapPin size={14} className="text-slate-300" />
                {location}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <Clock size={14} className="text-slate-300" />
                {new Date(incident.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-10 border-t lg:border-t-0 pt-4 lg:pt-0">
          <div className="flex flex-col items-start lg:items-end gap-1">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                incident.citizenId
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {incident.citizenId ? (
                <ShieldCheck size={12} />
              ) : (
                <User size={12} />
              )}
              {incident.citizenId ? "Verified User" : "Guest Reporter"}
            </div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
              Status:{" "}
              <span className="text-slate-900">
                {incident.status || "Active"}
              </span>
            </p>
          </div>
          <ChevronRight
            size={20}
            className="text-slate-300 group-hover:text-blue-600 transition-colors"
          />
        </div>
      </div>
    </motion.div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-sm rounded-[3rem] border border-white">
    <div className="h-12 w-12 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
    <p className="mt-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
      Syncing Records...
    </p>
  </div>
);

const EmptyState = ({ query }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm"
  >
    <Search size={40} className="mx-auto mb-4 text-slate-200" />
    <h3 className="text-xl font-bold text-slate-800">No results found</h3>
    <p className="text-slate-400 text-sm mt-1">
      Refine your search for <span className="text-blue-600">"{query}"</span>
    </p>
  </motion.div>
);

export default IncidentsPage;
