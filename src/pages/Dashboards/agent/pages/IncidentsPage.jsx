import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import IncidentDetails from "./IncidentDetailPage";

const IncidentsPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔥 FETCH DATA
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

        // 🔥 LOCK TO "Crime"
        const crimeType = typesRes.data.emergencyTypes.find(
          (t) => t.name === "Crime",
        );

        setCategories(crimeType?.categories || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // 🔥 FILTER INCIDENTS
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* 🔍 SEARCH */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            className="w-full border pl-10 pr-4 py-2 rounded"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 🔥 CATEGORIES (ONLY CRIME) */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full border ${
            selectedCategory === null ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-full border ${
              selectedCategory === cat.id
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 🔥 INCIDENT LIST */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredIncidents.map((incident, index) => (
            <motion.div
              key={
                incident._id ?? incident.id ?? `${incident.categoryId}-${index}`
              }
              onClick={() => setSelectedIncident(incident)}
              className="p-4 border rounded bg-white cursor-pointer hover:shadow"
            >
              {/* ❌ NO EmergencyType displayed (as requested) */}

              {/* Category */}
              <p className="font-semibold">
                {categories.find((c) => c.id === incident.categoryId)?.name ||
                  "Unknown"}
              </p>

              {/* Location */}
              <p className="text-xs text-gray-500">
                {[incident.kebele, incident.subdivision, incident.street]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {/* Time */}
              <p className="text-xs text-gray-400">
                {new Date(incident.createdAt).toLocaleTimeString()}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 🔥 MODAL */}
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
