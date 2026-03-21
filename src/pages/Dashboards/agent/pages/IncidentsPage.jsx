import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import IncidentDetails from "./IncidentDetailPage";

const IncidentsPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch emergencies and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const agency = JSON.parse(localStorage.getItem("agency") || "{}");
        if (!token || !agency?.id) throw new Error("Agency not logged in");

        // Fetch emergencies
        const { data: emergenciesRes } = await axios.get(
          `http://localhost:5000/api/emergencies/agency/${agency.id}/emergencies`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const emergenciesData = emergenciesRes?.data || [];

        // Fetch categories
        const { data: categoriesRes } = await axios.get(
          "http://localhost:5000/api/categories",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const categoriesMap = {};
        categoriesRes.forEach((c) => (categoriesMap[c.id] = c.name));

        setEmergencies(emergenciesData);
        setCategories(categoriesMap);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCardClick = useCallback((incident) => {
    setSelectedIncident(incident);
  }, []);

  const handleClose = () => setSelectedIncident(null);

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Incidents</h2>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && emergencies.length === 0 && (
        <p className="text-gray-500">No incidents found.</p>
      )}

      {/* Compact Emergency Rows */}
      <div className="space-y-3">
        {emergencies.map((incident) => {
          const reporterType = incident.citizenId
            ? "Registered User"
            : incident.guestId
              ? "Guest"
              : "Unknown";

          const location =
            [incident.kebele, incident.subdivision, incident.street]
              .filter(Boolean)
              .join(", ") || "N/A";

          return (
            <motion.div
              key={incident.id}
              layout
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer flex flex-col justify-center transition-all h-24"
              onClick={() => handleCardClick(incident)}
            >
              {/* Top Row: Type and Reporter */}
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-gray-800">
                  {incident.emergencyType?.name || "Unknown Type"}
                </h3>
                <span
                  className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                    reporterType === "Guest"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {reporterType}
                </span>
              </div>

              {/* Bottom Row: Category and Location */}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <p>{categories[incident.categoryId] || "Unknown Category"}</p>
                <p className="truncate max-w-[50%]">{location}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sliding Panel for full incident details */}
      <AnimatePresence>
        {selectedIncident && (
          <IncidentDetails
            incident={selectedIncident}
            onClose={handleClose}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default IncidentsPage;
