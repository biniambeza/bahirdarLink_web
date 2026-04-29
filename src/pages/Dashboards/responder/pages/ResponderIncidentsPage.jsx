import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, ChevronRight, ShieldCheck } from "lucide-react";
import EmergencyDetailDrawer from "./EmergencyDetailDrawer";

const API_BASE = "http://localhost:5000";

const ResponderIncidentsPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForMerge, setSelectedForMerge] = useState([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const responderTeamId = decoded.id;

      const [emergencyRes, typesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/emergencies/responder-team/${responderTeamId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/emergencyType`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const incidentData = emergencyRes.data?.data || [];
      setEmergencies(incidentData);

      const teamTypeId = incidentData[0]?.emergencyTypeId;
      const emergencyTypes = typesRes.data?.emergencyTypes || [];

      const targetType = emergencyTypes.find(
        (t) => t._id === teamTypeId || t.id === teamTypeId,
      );

      setCategories(targetType?.categories || []);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectMerge = (incidentId) => {
    setSelectedForMerge((prev) =>
      prev.includes(incidentId)
        ? prev.filter((i) => i !== incidentId)
        : [...prev, incidentId],
    );
  };

  const handleMerge = async () => {
    if (selectedForMerge.length < 2) {
      alert("Select at least 2 emergencies to merge");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Missing token");

      const mainId = selectedForMerge[0];

      await axios.post(
        `${API_BASE}/api/emerged/merge`,
        { mainId, mergeIds: selectedForMerge },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await fetchData();
      setSelectedForMerge([]);
      alert("Merged successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Merge failed");
    }
  };

  const groupedEmergencies = useMemo(() => {
    const map = new Map();

    emergencies.forEach((item) => {
      const itemId = item._id || item.id;
      const key = item.emergedId ? item.emergedId : itemId;

      if (!map.has(key)) {
        map.set(key, { ...item, mergedCount: 1 });
      } else {
        const existing = map.get(key);
        map.set(key, { ...existing, mergedCount: existing.mergedCount + 1 });
      }
    });

    return Array.from(map.values());
  }, [emergencies]);

  const filteredIncidents = useMemo(() => {
    return groupedEmergencies.filter((incident) => {
      const matchesCategory =
        !selectedCategory || incident.categoryId === selectedCategory;

      const query = searchQuery.toLowerCase();
      const location = `${incident.kebele?.name || ""} ${incident.subdivision || ""}`.toLowerCase();

      return matchesCategory && location.includes(query);
    });
  }, [groupedEmergencies, selectedCategory, searchQuery]);

  const handleOpenDetail = (incident) => {
    setSelectedIncident(incident);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8">
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

          <button
            onClick={handleMerge}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
          >
            Merge Selected ({selectedForMerge.length})
          </button>
        </header>

        <div className="space-y-6 mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by location, kebele, or street..."
              className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold border ${
                selectedCategory === null
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-500"
              }`}
            >
              All Emergencies
            </button>

            {categories.map((cat) => {
              const id = cat._id || cat.id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border ${
                    selectedCategory === id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <AnimatePresence>
              {filteredIncidents.map((incident) => {
                const incidentId = incident._id || incident.id;
                return (
                  <motion.div
                    key={incidentId}
                    className="bg-white p-5 rounded-2xl flex items-center justify-between border"
                  >
                    <input
                      type="checkbox"
                      checked={selectedForMerge.includes(incidentId)}
                      onChange={() => handleSelectMerge(incidentId)}
                      className="mr-3"
                    />

                    <div
                      className="flex items-center gap-5 flex-1 cursor-pointer"
                      onClick={() => handleOpenDetail(incident)}
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Clock size={20} />
                      </div>

                      <div>
                        <h3 className="font-bold">
                          {incident.kebele?.name} / {incident.subdivision}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {incident.category?.name}
                        </p>
                        {incident.mergedCount > 1 && (
                          <p className="text-[10px] font-bold text-green-600">
                            Merged ({incident.mergedCount})
                          </p>
                        )}
                      </div>
                    </div>

                    <ChevronRight />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      <EmergencyDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        emergency={selectedIncident}
        onRefresh={fetchData}
      />
    </div>
  );
};

export default ResponderIncidentsPage;