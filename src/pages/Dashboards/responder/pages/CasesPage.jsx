import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  MapPin,
  ChevronRight,
  User,
  ShieldCheck,
  X,
  AlertTriangle,
  Loader2,
  Clock,
  Database,
  Hash,
  AlertCircle,
  Trash2,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import AddCasePage from "./AddCasePage";

// Dynamic Environment Base Routing Strategy
const LOCAL_URL = "http://localhost:5000";
const RENDER_URL = "https://bahirlink-backend-1.onrender.com"; // Replace with your actual Render URL

let BASE_URL = LOCAL_URL;
let API_URL = `${BASE_URL}/api/caseType`;

const parseEnglish = (val) => {
  if (!val) return "";
  if (typeof val === "object") {
    const target = val.name || val;
    if (typeof target === "object") return target.en || "—";
    return String(val.name || val);
  }
  if (typeof val === "string" && val.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(val);
      const target = parsed.name || parsed;
      if (typeof target === "object") return target.en || "—";
      return String(target);
    } catch (e) {}
  }
  return String(val);
};

const ResponderCasesPage = () => {
  // --- CASES STATES ---
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // --- CATEGORY STATES ---
  const [caseTypes, setCaseTypes] = useState([]);
  const [name, setName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryFetchLoading, setCategoryFetchLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");

  const navigate = useNavigate();

  // --- DYNAMIC HEALTH CHECK SYNC ---
  const verifyBackendConnectivity = useCallback(async () => {
    try {
      // Fast timeout ping to check local server availability
      await axios.get(`${LOCAL_URL}/api/caseType`, { timeout: 1500 });
      BASE_URL = LOCAL_URL;
      API_URL = `${LOCAL_URL}/api/caseType`;
    } catch (err) {
      // If local is rejected or timed out, route permanently to Render
      if (!err.response) {
        BASE_URL = RENDER_URL;
        API_URL = `${RENDER_URL}/api/caseType`;
      }
    }
  }, []);

  // --- FETCH CASES LOGIC ---
  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/cases/team/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || res.data;
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- CATEGORIES FETCH LOGIC ---
  const fetchCaseTypes = async () => {
    try {
      setCategoryFetchLoading(true);
      const res = await axios.get(API_URL);
      const incomingData = res.data?.data || res.data;
      setCaseTypes(Array.isArray(incomingData) ? incomingData : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setCategoryError("Sync failed. Check system logs.");
      setCaseTypes([]);
    } finally {
      setCategoryFetchLoading(false);
    }
  };

  // --- MAIN SYSTEM SYNC ---
  useEffect(() => {
    const initializePortalData = async () => {
      await verifyBackendConnectivity();
      await fetchCases();
      await fetchCaseTypes();
    };
    initializePortalData();
  }, [fetchCases, verifyBackendConnectivity]);

  // --- CATEGORY SUBMIT LOGIC ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCategoryLoading(true);
    try {
      const res = await axios.post(API_URL, { name: name.trim() });
      const newType = res.data?.data || res.data;
      setCaseTypes((prev) => [...prev, newType]);
      setName("");
      setCategoryError("");
    } catch (err) {
      setCategoryError("Registration failed.");
    } finally {
      setCategoryLoading(false);
    }
  };

  // --- FILTER MATRICES ---
  const filteredCases = (cases || []).filter((c) => {
    const searchStr = searchTerm.toLowerCase();
    const fullName = parseEnglish(c.fullName).toLowerCase();
    const locationName = parseEnglish(
      c.lastSeenLocation?.name || c.lastSeenLocation,
    ).toLowerCase();
    const caseTypeStr = parseEnglish(
      c.caseType?.name || c.caseType,
    ).toLowerCase();
    return (
      fullName.includes(searchStr) ||
      locationName.includes(searchStr) ||
      caseTypeStr.includes(searchStr)
    );
  });

  const filteredTypes = (caseTypes || []).filter((t) => {
    const searchStr = categorySearchTerm.toLowerCase();
    const nameEn = (t.name?.en || t.name || "").toLowerCase();
    return nameEn.includes(searchStr);
  });

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-x-hidden">
      <AnimatePresence>
        {showForm && (
          <AddCasePage
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              fetchCases();
            }}
          />
        )}
        {selectedImage && (
          <ImageViewer
            src={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>

      {/* --- HEADER CONTROLS --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-slate-900 uppercase">
                Bahir<span className="text-blue-600">Link</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Case Management Portal
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 group"
          >
            <Plus
              size={18}
              className="group-hover:rotate-90 transition-transform"
            />
            New Case
          </button>
        </div>
      </header>

      {/* --- MAIN INTERFACE WORKSPACE --- */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-16">
        {/* SECTION 1: CASES LOGS MANAGEMENT SYSTEM */}
        <section className="space-y-6">
          <div className="relative">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search active data registry via keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">
                Syncing Live Records...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {/* LIVE FILTERED CASE REGISTRY INTERFACE LIST */}
              {filteredCases.map((c) => (
                <CaseCard
                  key={c.id || c._id}
                  c={c}
                  onViewImage={setSelectedImage}
                  onViewDetail={() => navigate(`/cases/${c.id || c._id}`)}
                />
              ))}

              {filteredCases.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col justify-center items-center bg-white shadow-sm">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Search size={24} />
                  </div>
                  <p className="text-sm font-bold uppercase text-slate-400">
                    No active cases found
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <hr className="border-slate-200" />

        {/* --- SECTION 2: CONSOLIDATED SETTINGSPAGE AT BOTTOM --- */}
        <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          {/* --- HEADER --- */}
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-medium tracking-tight text-slate-900">
                Case <span className="text-blue-600">Categories</span>
              </h1>
              <p className="text-slate-500 mt-2">
                Manage and organize your case matrix classification.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <Database size={14} />
              <span>Database Online</span>
            </div>
          </header>

          {/* --- INTERACTION BAR --- */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-12">
            <form
              onSubmit={handleCategorySubmit}
              className="lg:col-span-3 flex bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:ring-4 focus-within:ring-blue-500/5 transition-all"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name..."
                className="flex-1 px-5 py-3 bg-transparent outline-none text-sm"
              />
              <button
                disabled={categoryLoading || !name.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-50"
              >
                {categoryLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
                <span>Add Type</span>
              </button>
            </form>

            <div className="lg:col-span-2 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Filter list..."
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-100/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-200 transition-all text-sm"
              />
            </div>
          </div>

          {categoryError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm"
            >
              <AlertCircle size={18} />
              {categoryError}
            </motion.div>
          )}

          {/* --- GRID --- */}
          {categoryFetchLoading ? (
            <div className="py-20 flex flex-col items-center justify-center opacity-40">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
              <p className="text-sm font-medium">Loading classifications...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredTypes.map((type) => (
                  <motion.div
                    key={type.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -5 }}
                    className="group bg-white border border-slate-100 p-6 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Hash size={20} />
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                      {type.name?.en || type.name || "Unknown"}
                    </h3>

                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                      ID: {type.id}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          System Ready
                        </span>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-slate-300 -translate-x-2 group-hover:translate-x-0 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTypes.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                    <Search size={32} />
                  </div>
                  <h3 className="text-slate-500 font-medium">
                    No categories found
                  </h3>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */
const CaseCard = ({ c, onViewImage, onViewDetail }) => {
  const englishName = parseEnglish(c.fullName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all group flex flex-col justify-between h-auto min-h-[540px]"
    >
      <div>
        <div className="relative h-64 bg-slate-100 overflow-hidden">
          {c.mediaUrl ? (
            <img
              src={`${BASE_URL}${c.mediaUrl}`}
              alt={englishName}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 cursor-pointer"
              onClick={() => onViewImage(`${BASE_URL}${c.mediaUrl}`)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <User size={64} strokeWidth={1} />
            </div>
          )}
          <div className="absolute top-5 left-5 flex flex-col gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200 shadow-sm">
              {parseEnglish(c.caseType?.name || c.caseType) || "Standard"}
            </span>
            {c.isDangerous && (
              <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase flex items-center gap-1 rounded-lg shadow-lg">
                <AlertTriangle size={10} /> High Risk
              </span>
            )}
          </div>
        </div>

        <div className="p-6 pb-0 space-y-4">
          <div>
            <div className="flex justify-between items-start mb-1 gap-2">
              <h3
                className="font-black text-slate-900 text-lg tracking-tight uppercase truncate"
                title={englishName}
              >
                {englishName}
              </h3>
              <span
                className={`text-[8px] font-black uppercase px-2 py-1 rounded-md h-fit ${
                  c.status === "open"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {c.status}
              </span>
            </div>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
              Priority: <span className="text-slate-600">{c.priority}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
            <div className="flex gap-2 min-w-0">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl h-fit flex-shrink-0">
                <MapPin size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1">
                  Last Known
                </p>
                <p className="text-xs font-black text-slate-900 truncate">
                  {parseEnglish(c.lastSeenLocation?.name || c.lastSeenLocation)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="p-2 bg-slate-50 text-slate-400 rounded-xl h-fit flex-shrink-0">
                <Clock size={14} />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1">
                  Reported
                </p>
                <p className="text-xs font-black text-slate-900 whitespace-nowrap">
                  {new Date(c.createdAt).toLocaleDateString("en-US")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4">
        <button
          onClick={onViewDetail}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group/btn"
        >
          View Full Dossier
          <ChevronRight
            size={14}
            className="group-hover/btn:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </motion.div>
  );
};

const ImageViewer = ({ src, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-slate-900/95 z-[100] flex items-center justify-center p-8 backdrop-blur-lg"
    onClick={onClose}
  >
    <div
      className="relative max-w-4xl w-full flex justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.img
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        src={src}
        className="max-h-[80vh] rounded-3xl shadow-2xl border-4 border-white/10 object-contain"
        alt="Evidence"
      />
      <button
        onClick={onClose}
        className="absolute -top-16 right-0 text-white/50 hover:text-white p-3 transition-all"
      >
        <X size={40} strokeWidth={1.5} />
      </button>
    </div>
  </motion.div>
);

export default ResponderCasesPage;
