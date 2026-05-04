import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, ShieldCheck, Activity, Flame, RefreshCw } from "lucide-react";
import IncidentDetails from "./IncidentDetailPage";

const AGENCY_CONFIG = {
  "Police": { label: "Crime", icon: <ShieldCheck className="text-blue-600" />, color: "bg-blue-600" },
  "Fire":   { label: "Fire",  icon: <Flame className="text-red-600" />,       color: "bg-red-600"  },
  "Health": { label: "Health",icon: <Activity className="text-green-600" />,  color: "bg-green-600"},
  "Ambulance": { label: "Health", icon: <Activity className="text-green-600" />, color: "bg-green-600" },
};

const IncidentsPage = () => {
  const [emergencies, setEmergencies]   = useState([]);
  const [categories, setCategories]     = useState([]);  // already filtered by agency on backend
  const [agencyInfo, setAgencyInfo]     = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery]           = useState("");
  const [isLoading, setIsLoading]               = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token        = localStorage.getItem("token");
      const storedAgency = JSON.parse(localStorage.getItem("agency") || "{}");
      setAgencyInfo(storedAgency);

      const headers = { Authorization: `Bearer ${token}` };

      // ✅ categories now come pre-filtered for this agency's type from the backend
      const [incRes, catRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/emergencies/agency/${storedAgency.id}/emergencies`,
          { headers }
        ),
        axios.get(
          `http://localhost:5000/api/categories/by-agency/${storedAgency.id}`,
          { headers }
        ),
      ]);

      setEmergencies(incRes.data.data || incRes.data || []);
      setCategories(catRes.data.data  || catRes.data  || []);
    } catch (err) {
      console.error("Critical Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ No client-side filtering needed — backend already scoped categories to agency type
  // Filter incidents by selected sidebar category + search query
  const filteredIncidents = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return emergencies.filter((incident) => {
      const incidentCatId = incident.categoryId?._id || incident.categoryId?.id || incident.categoryId;
      const selectedCatId = selectedCategory?._id   || selectedCategory?.id;

      const matchCategory  = !selectedCategory || String(incidentCatId) === String(selectedCatId);
      const matchLocation  =
        (incident.kebele?.name || "").toLowerCase().includes(query) ||
        (incident.street       || "").toLowerCase().includes(query);

      return matchCategory && matchLocation;
    });
  }, [emergencies, selectedCategory, searchQuery]);

  // UI theme derived from logged-in agency type
  const currentUi = AGENCY_CONFIG[agencyInfo?.agencyType?.name] || {
    label: "Emergency", icon: <Activity />, color: "bg-slate-600",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── SIDEBAR ───────────────────────────────────────────────── */}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className={`p-2 rounded-lg bg-opacity-10 ${currentUi.color.replace("bg-", "text-")}`}>
            {currentUi.icon}
          </div>
          <div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Agency</h2>
            <p className="font-bold text-slate-800 leading-tight">{agencyInfo?.name || "Loading..."}</p>
          </div>
        </div>

        <div className="space-y-1">
          {/* "All" button */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              !selectedCategory
                ? `${currentUi.color} text-white shadow-lg`
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            All {currentUi.label} Reports
          </button>

          {/* Category list — already correct for this agency */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Categories
            </p>

            {categories.length > 0 ? (
              categories.map((cat) => {
                const catId      = cat._id || cat.id;
                const isSelected =
                  selectedCategory &&
                  (selectedCategory._id === catId || selectedCategory.id === catId);

                return (
                  <button
                    key={catId}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all mb-1 ${
                      isSelected
                        ? `${currentUi.color} text-white shadow-md`
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })
            ) : (
              <p className="px-4 text-xs text-slate-400 italic py-2">
                No categories defined for this agency type.
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN FEED ─────────────────────────────────────────────── */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Incident Feed</h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
              Service: {agencyInfo?.agencyType?.name}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-3 bg-white hover:shadow-md rounded-2xl border border-slate-200 transition-all group"
          >
            <RefreshCw
              size={20}
              className={`text-slate-400 group-hover:text-blue-600 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </header>

        {/* Search */}
        <div className="relative mb-8 shadow-sm">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            className="w-full bg-white border-none rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-700 font-medium shadow-sm"
            placeholder="Search by kebele or street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Incident cards */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 animate-pulse font-black uppercase text-xs">
              Syncing Dispatch...
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-bold text-sm">
              No incidents found.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredIncidents.map((incident) => (
                <motion.div
                  key={incident._id || incident.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedIncident(incident)}
                  className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-12 h-12 rounded-2xl ${currentUi.color} bg-opacity-10 flex items-center justify-center`}
                    >
                      {currentUi.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg">
                        {incident.kebele?.name || "Kebele N/A"}
                      </h3>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-tighter">
                        {incident.street || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black py-1 px-3 bg-slate-100 text-slate-500 rounded-full uppercase">
                      {incident.categoryId?.name || "General"}
                    </span>
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* ── INCIDENT DETAIL DRAWER ────────────────────────────────── */}
      {selectedIncident && (
        <IncidentDetails
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          categories={categories}
        />
      )}
    </div>
  );
};

export default IncidentsPage;