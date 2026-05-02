import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, ShieldCheck } from "lucide-react";
import IncidentDetails from "./IncidentDetailPage";

const IncidentsPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [crimeType, setCrimeType] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    try {
      setIsLoading(true);

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

      const crime = (typesRes?.data?.data || []).find(
        (t) => t.name.toLowerCase() === "crime",
      );

      setCrimeType(crime || null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // GROUPING
  // =========================
  const groupedEmergencies = useMemo(() => {
    const map = new Map();

    emergencies.forEach((item) => {
      const key = item.emergedId || item._id || item.id;

      if (!map.has(key)) {
        map.set(key, { ...item, mergedCount: 1 });
      } else {
        const existing = map.get(key);
        map.set(key, {
          ...existing,
          mergedCount: existing.mergedCount + 1,
        });
      }
    });

    return Array.from(map.values());
  }, [emergencies]);

  // =========================
  // FILTERING
  // =========================
  const filteredIncidents = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return groupedEmergencies.filter((incident) => {
      const matchCategory =
        !selectedCategory || incident.categoryId === selectedCategory.id;

      const location =
        incident.kebele?.name ||
        incident.kebele ||
        incident.lastSeenLocation ||
        "";

      const searchable = `${location} ${incident.street || ""}`.toLowerCase();

      return searchable.includes(query) && matchCategory;
    });
  }, [groupedEmergencies, selectedCategory, searchQuery]);

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* =========================
          LEFT SIDEBAR (CATEGORIES)
      ========================= */}
      <div className="w-72 bg-white border-r border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="text-blue-600" />
          <h2 className="font-bold text-lg">Crime Categories</h2>
        </div>

        <button
          onClick={() => setSelectedCategory(null)}
          className={`w-full text-left px-3 py-2 rounded-lg mb-2 text-sm font-semibold ${
            !selectedCategory
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          All Categories
        </button>

        {(crimeType?.categories || []).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat)}
            className={`w-full text-left px-3 py-2 rounded-lg mb-2 text-sm ${
              selectedCategory?.id === cat.id
                ? "bg-green-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <div className="flex-1 p-6">
        {/* HEADER */}
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="text-blue-600" />
          <h1 className="text-2xl font-bold">Crime Incidents</h1>
        </div>

        {/* SEARCH */}
        <div className="mb-4 flex items-center border rounded-lg p-2 bg-white">
          <Search className="text-gray-400 mr-2" />
          <input
            className="w-full outline-none"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <AnimatePresence>
              {filteredIncidents.map((incident) => (
                <motion.div
                  key={incident.id || incident._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedIncident(incident)}
                  className="bg-white p-4 rounded-lg flex justify-between cursor-pointer hover:shadow"
                >
                  <div>
                    <h3 className="font-bold">
                      {incident.kebele?.name || incident.kebele || "Unknown"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {incident.street || "-"}
                    </p>
                  </div>

                  {incident.mergedCount > 1 && (
                    <span className="text-xs bg-green-100 px-2 py-1 rounded">
                      {incident.mergedCount} merged
                    </span>
                  )}

                  <ChevronRight />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedIncident && (
        <IncidentDetails
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          categories={crimeType?.categories || []}
        />
      )}
    </div>
  );
};

export default IncidentsPage;
