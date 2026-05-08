import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronRight,
  ShieldCheck,
  Activity,
  Flame,
  RefreshCw,
  Zap,
  Droplets,
  Building2,
} from "lucide-react";
import IncidentDetails from "./IncidentDetailPage";

const AGENCY_CONFIG = {
  police: {
    label: "Crime",
    icon: <ShieldCheck className="text-blue-600" />,
    color: "bg-blue-600",
  },
  fire: {
    label: "Fire",
    icon: <Flame className="text-red-600" />,
    color: "bg-red-600",
  },
  ambulance: {
    label: "Health",
    icon: <Activity className="text-green-600" />,
    color: "bg-green-600",
  },
  health: {
    label: "Health",
    icon: <Activity className="text-green-600" />,
    color: "bg-green-600",
  },
  electric: {
    label: "Electric",
    icon: <Zap className="text-yellow-600" />,
    color: "bg-yellow- yellow-600",
  },
  water: {
    label: "Water",
    icon: <Droplets className="text-cyan-600" />,
    color: "bg-cyan-600",
  },
  municipal: {
    label: "Municipal",
    icon: <Building2 className="text-emerald-600" />,
    color: "bg-emerald-600",
  },
};

const IncidentsPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Helper to extract language string (defaults to English)
  const getLangStr = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val.en || val.am || "";
  };

  const agencyTypeStr = getLangStr(agencyInfo?.agencyType?.name).toLowerCase();

  const isService = useMemo(() => {
    return ["municipal", "electric", "water"].some((t) =>
      agencyTypeStr.includes(t),
    );
  }, [agencyTypeStr]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const storedAgency = JSON.parse(localStorage.getItem("agency") || "{}");
      setAgencyInfo(storedAgency);

      const typeName = getLangStr(storedAgency?.agencyType?.name).toLowerCase();
      const localIsService = ["municipal", "electric", "water"].some((t) =>
        typeName.includes(t),
      );
      const agencyId = storedAgency.id;

      if (!agencyId) return;

      const headers = { Authorization: `Bearer ${token}` };

      const endpoints = localIsService
        ? {
            data: `http://localhost:5000/api/service/agency/${agencyId}`,
            categories: `http://localhost:5000/api/serviceCategory/agency/${agencyId}`,
          }
        : {
            data: `http://localhost:5000/api/emergencies/agency/${agencyId}/emergencies`,
            categories: `http://localhost:5000/api/categories/by-agency/${agencyId}`,
          };

      const [dataRes, catRes] = await Promise.all([
        axios.get(endpoints.data, { headers }),
        axios.get(endpoints.categories, { headers }),
      ]);

      // Handle the different backend key formats: result.services or result.data
      setEmergencies(
        dataRes.data.services || dataRes.data.data || dataRes.data || [],
      );
      setCategories(
        catRes.data.data || catRes.data.categories || catRes.data || [],
      );
    } catch (err) {
      console.error("Fetch Error:", err.response?.data || err.message);
      setEmergencies([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isService]);

  const filteredIncidents = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const dataArray = Array.isArray(emergencies) ? emergencies : [];

    return dataArray.filter((incident) => {
      const incidentCatId =
        incident.categoryId ||
        incident.serviceCategoryId ||
        incident.serviceCategory?.id;

      const selectedCatId = selectedCategory?.id;
      const matchCategory =
        !selectedCategory || String(incidentCatId) === String(selectedCatId);

      const kebele = getLangStr(incident.kebele?.name).toLowerCase();
      const street = getLangStr(incident.street).toLowerCase();
      const name = getLangStr(incident.name).toLowerCase();

      const matchSearch =
        kebele.includes(query) ||
        street.includes(query) ||
        name.includes(query);

      return matchCategory && matchSearch;
    });
  }, [emergencies, selectedCategory, searchQuery]);

  const configKey = useMemo(() => {
    return (
      Object.keys(AGENCY_CONFIG).find((key) => agencyTypeStr.includes(key)) ||
      null
    );
  }, [agencyTypeStr]);

  const currentUi = AGENCY_CONFIG[configKey] || {
    label: "Service",
    icon: <Building2 className="text-slate-600" />,
    color: "bg-slate-600",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-72 bg-white border-r border-slate-200 p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <div
            className={`p-2 rounded-lg bg-opacity-10 ${currentUi.color.replace("bg-", "text-")}`}
          >
            {currentUi.icon}
          </div>
          <div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Active Agency
            </h2>
            <p className="font-bold text-slate-800 leading-tight">
              {agencyInfo?.name || "Loading..."}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              !selectedCategory
                ? `${currentUi.color} text-white shadow-lg`
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            All {isService ? "Service Requests" : "Emergency Reports"}
          </button>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Categories
            </p>
            {Array.isArray(categories) &&
              categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all mb-1 ${
                    selectedCategory?.id === cat.id
                      ? `${currentUi.color} text-white shadow-md`
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {getLangStr(cat.name)}
                </button>
              ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isService ? "Service Request Feed" : "Incident Feed"}
            </h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
              {getLangStr(agencyInfo?.agencyType?.name)} Department
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-3 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-all group"
          >
            <RefreshCw
              size={20}
              className={`text-slate-400 group-hover:text-blue-600 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </header>

        <div className="relative mb-8">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            className="w-full bg-white border-none rounded-2xl py-5 pl-14 pr-6 outline-none shadow-sm"
            placeholder={`Search by location or street...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 animate-pulse font-black uppercase text-xs">
              Syncing Feed...
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => (
                  <motion.div
                    key={incident.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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
                          {getLangStr(incident.kebele?.name) ||
                            "Specific Location"}
                        </h3>
                        <p className="text-sm text-slate-500 font-bold uppercase">
                          {getLangStr(incident.street) || "Unknown Street"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase">
                        {getLangStr(incident.serviceCategory?.name) ||
                          getLangStr(incident.category?.name)}
                      </span>
                      <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 text-slate-400 font-medium">
                  No records found for this selection.
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      {selectedIncident && (
        <IncidentDetails
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          isService={isService}
        />
      )}
    </div>
  );
};

export default IncidentsPage;
