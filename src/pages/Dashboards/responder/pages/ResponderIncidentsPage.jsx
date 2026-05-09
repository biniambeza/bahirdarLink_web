import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Loader2,
  CheckCircle2,
  Filter,
  RefreshCw,
  Layers,
  Zap,
  Info,
} from "lucide-react";
import EmergencyDetailDrawer from "./EmergencyDetailDrawer";

const API_BASE = "http://localhost:5000";

/**
 * STRICT ENGLISH HELPER - FIXED
 * Handles objects and raw JSON strings like {"en":"poly","am":"ፖሊ"}
 */
const renderEnglish = (val) => {
  if (val === null || val === undefined || val === "") return "—";

  // Handle Objects
  if (typeof val === "object") {
    return val.en || val.name?.en || val.label?.en || val.name || "—";
  }

  // Handle JSON Strings (Fixes the raw string issue)
  if (
    typeof val === "string" &&
    (val.includes('{"en":') || val.includes('{"am":'))
  ) {
    try {
      const parsed = JSON.parse(val);
      return parsed.en || "—";
    } catch (e) {
      return val;
    }
  }

  return String(val);
};

const ResponderIncidentsPage = () => {
  // --- STATE ---
  const [incidents, setIncidents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForMerge, setSelectedForMerge] = useState([]);
  const [isServiceMode, setIsServiceMode] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState(null);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Team Profile to get Agency context
      const teamRes = await axios.get(
        `${API_BASE}/api/responderTeam/${decoded.id}`,
        { headers },
      );
      const teamData = teamRes.data?.data || teamRes.data;
      const agencyId = teamData.agencyId;

      // 2. Fetch Agency details
      const agencyRes = await axios.get(`${API_BASE}/api/agency/${agencyId}`, {
        headers,
      });
      const agency = agencyRes.data?.data || agencyRes.data;
      setAgencyInfo(agency);

      // 3. Mode Detection Logic (Using fixed helper)
      const agencyName = (renderEnglish(agency?.name) || "").toLowerCase();
      const serviceKeywords = [
        "municipal",
        "electric",
        "water",
        "health",
        "utility",
        "medical",
        "service",
      ];
      const localIsService = serviceKeywords.some((kw) =>
        agencyName.includes(kw),
      );
      setIsServiceMode(localIsService);

      // 4. Dynamic Endpoint Routing
      const endpoints = localIsService
        ? {
            incidents: `${API_BASE}/api/service/responder-team/${decoded.id}`,
            categories: `${API_BASE}/api/serviceCategory/agency/${agencyId}`,
          }
        : {
            incidents: `${API_BASE}/api/emergencies/responder-team/${decoded.id}`,
            categories: `${API_BASE}/api/categories/by-agency/${agencyId}`,
          };

      // 5. Parallel Fetch
      const [incRes, catRes] = await Promise.all([
        axios.get(endpoints.incidents, { headers }),
        axios.get(endpoints.categories, { headers }),
      ]);

      setIncidents(incRes.data?.data || incRes.data || []);
      setCategories(catRes.data?.data || catRes.data || []);
    } catch (err) {
      console.error("Critical: Data Sync Failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTERING & MERGING LOGIC ---
  const filteredIncidents = useMemo(() => {
    const map = new Map();
    // Use emergedId (Emergency) or simple ID (Service) as key for merging duplicates in view
    incidents.forEach((item) => {
      const key = item.emergedId || item._id || item.id;
      if (!map.has(key)) map.set(key, { ...item, mergedCount: 1 });
      else map.get(key).mergedCount += 1;
    });

    return Array.from(map.values()).filter((incident) => {
      // FIXED: Exclude resolved/completed incidents
      const status = (incident.status || "").toLowerCase();
      if (
        status === "resolved" ||
        status === "completed" ||
        status === "cancelled"
      ) {
        return false;
      }

      const incidentCatId =
        incident.serviceCategoryId ||
        incident.categoryId ||
        incident.serviceCategory?.id ||
        incident.category?.id;

      const selectedCatId = selectedCategory?.id || selectedCategory?._id;
      const matchesCat =
        !selectedCategory || String(incidentCatId) === String(selectedCatId);

      const query = searchQuery.toLowerCase();
      const searchSpace =
        `${renderEnglish(incident.kebele)} ${renderEnglish(incident.subdivision)} ${renderEnglish(incident.street)}`.toLowerCase();

      return matchesCat && searchSpace.includes(query);
    });
  }, [incidents, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col antialiased selection:bg-blue-100 selection:text-blue-700">
      {/* ENTERPRISE TOP NAV */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-slate-900 p-2 rounded-lg">
              <ShieldCheck
                className={isServiceMode ? "text-emerald-400" : "text-blue-400"}
                size={22}
              />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-black tracking-tighter text-slate-900 uppercase">
                {isServiceMode ? "Service Command" : "Incident Command"}
              </h1>
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-2 w-2 rounded-full animate-pulse ${isServiceMode ? "bg-emerald-500" : "bg-blue-500"}`}
                />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {renderEnglish(agencyInfo?.name) || "System Active"}
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex-1 max-w-xl group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search sector, subdivision, or street..."
              className="w-full bg-slate-100/50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <RefreshCw
                size={18}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2" />
            <div
              className={`w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold bg-gradient-to-tr ${isServiceMode ? "from-emerald-600 to-teal-600" : "from-blue-600 to-indigo-600"}`}
            >
              RP
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto w-full px-6 py-6 grid grid-cols-12 gap-6 flex-1">
        {/* SIDEBAR */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Filter size={14} /> Dispatch Categories
            </h2>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  !selectedCategory
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>All Assignments</span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                  {incidents.length}
                </span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id || cat._id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    (selectedCategory?.id || selectedCategory?._id) ===
                    (cat.id || cat._id)
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {/* FIXED: Wrapped category name in renderEnglish */}
                  {renderEnglish(cat.name)}
                </button>
              ))}
            </div>

            <div
              className={`mt-6 rounded-xl p-4 text-white shadow-lg relative overflow-hidden ${isServiceMode ? "bg-emerald-600" : "bg-blue-600"}`}
            >
              <Zap
                className="absolute -right-2 -bottom-2 text-white/10"
                size={60}
              />
              <h3 className="text-[10px] font-black uppercase opacity-80">
                Operational Tip
              </h3>
              <p className="text-[11px] mt-1 leading-relaxed font-medium">
                Check urgent tags for priority response. Consolidate reports
                from the same sector.
              </p>
            </div>
          </div>
        </aside>

        {/* INCIDENT LIST */}
        <section className="col-span-12 lg:col-span-9">
          {isLoading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
              <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">
                Initializing Live Feed...
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredIncidents.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border border-slate-200 shadow-sm">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">
                    Status Normal
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    No active reports found in your assigned sector.
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredIncidents.map((incident) => {
                    const id = incident._id || incident.id;
                    const isSelected = selectedForMerge.includes(id);

                    return (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`group bg-white border rounded-2xl transition-all overflow-hidden ${
                          isSelected
                            ? "border-blue-600 ring-4 ring-blue-50 shadow-lg"
                            : "border-slate-200 hover:border-slate-300 shadow-sm"
                        }`}
                      >
                        <div className="flex items-stretch">
                          <div
                            className={`w-1.5 ${incident.mergedCount > 1 ? "bg-amber-400" : isServiceMode ? "bg-emerald-500" : "bg-blue-600"}`}
                          />
                          <div className="p-4 flex items-center gap-4 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                setSelectedForMerge((prev) =>
                                  prev.includes(id)
                                    ? prev.filter((i) => i !== id)
                                    : [...prev, id],
                                )
                              }
                              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                            />

                            <div
                              className="flex flex-1 items-center gap-6 cursor-pointer"
                              onClick={() => {
                                setSelectedIncident(incident);
                                setIsDrawerOpen(true);
                              }}
                            >
                              <div className="hidden sm:flex flex-col items-center justify-center min-w-[70px] border-r border-slate-100 pr-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase">
                                  Received
                                </p>
                                <p className="text-sm font-black text-slate-700">
                                  {new Date(
                                    incident.createdAt,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {/* FIXED: Wrapped Kebele in renderEnglish */}
                                  <h3 className="font-bold text-slate-900 truncate tracking-tight uppercase text-sm">
                                    {renderEnglish(incident.kebele) ||
                                      "Standard Sector"}
                                  </h3>
                                  {incident.status === "urgent" && (
                                    <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                      Urgent
                                    </span>
                                  )}
                                  {incident.mergedCount > 1 && (
                                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1">
                                      <Layers size={10} />{" "}
                                      {incident.mergedCount} Reports
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} />{" "}
                                    {/* FIXED: Wrapped street and subdivision in renderEnglish */}
                                    {renderEnglish(incident.street) ||
                                      renderEnglish(incident.subdivision) ||
                                      "Area Zone"}
                                  </span>
                                  <span
                                    className={`flex items-center gap-1 ${isServiceMode ? "text-emerald-600" : "text-blue-600"}`}
                                  >
                                    <Info size={12} />{" "}
                                    {/* FIXED: Wrapped category labels in renderEnglish */}
                                    {renderEnglish(incident.serviceCategory) ||
                                      renderEnglish(incident.category) ||
                                      "General"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 shrink-0">
                                <div className="text-right hidden md:block">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                    Status
                                  </p>
                                  <p className="text-xs font-black text-slate-900 uppercase">
                                    {incident.status || "Assigned"}
                                  </p>
                                </div>
                                <ChevronRight
                                  className="text-slate-300 group-hover:text-blue-600 transition-colors"
                                  size={20}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          )}
        </section>
      </main>

      {/* CONSOLIDATION TOAST */}
      <AnimatePresence>
        {selectedForMerge.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[60]"
          >
            <div className="bg-slate-900 text-white p-2 pl-4 rounded-xl shadow-2xl flex items-center gap-6 border border-white/10">
              <span className="text-xs font-bold tracking-tight">
                {selectedForMerge.length} items selected
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedForMerge([])}
                  className="px-3 py-2 text-xs font-bold hover:bg-white/10 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {}}
                  className={`px-4 py-2 rounded-lg text-xs font-black shadow-lg shadow-blue-900/40 ${isServiceMode ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500"}`}
                >
                  Consolidate
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EmergencyDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        emergency={selectedIncident}
        onRefresh={fetchData}
        isService={isServiceMode}
      />
    </div>
  );
};

export default ResponderIncidentsPage;
