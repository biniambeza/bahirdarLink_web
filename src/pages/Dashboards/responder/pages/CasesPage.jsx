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
  Calendar,
  Loader2,
  Clock,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import AddCasePage from "./AddCasePage";

const BASE_URL = "http://localhost:5000";

// Helper to handle localized objects {en: "...", am: "..."}
const renderEnglish = (val) => {
  if (!val) return "—";
  if (typeof val === "object") return val.en || val.name?.en || val.name || "—";
  if (typeof val === "string" && val.startsWith("{")) {
    try {
      const parsed = JSON.parse(val);
      return parsed.en || "—";
    } catch (e) {
      return val;
    }
  }
  return String(val);
};

const ResponderCasesPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const filteredCases = (cases || []).filter((c) => {
    const searchStr = searchTerm.toLowerCase();
    const fullName = renderEnglish(c.fullName).toLowerCase();
    const locationName = renderEnglish(
      c.lastSeenLocation?.name || c.lastSeenLocation,
    ).toLowerCase();
    const caseType = renderEnglish(
      c.caseType?.name || c.caseType,
    ).toLowerCase();

    return (
      fullName.includes(searchStr) ||
      locationName.includes(searchStr) ||
      caseType.includes(searchStr)
    );
  });

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-x-hidden">
      {/* 
          DRAWER LOGIC 
          The AddCasePage now sits inside AnimatePresence.
          Because it has its own internal motion.div, it will slide over this list.
      */}
      <AnimatePresence>
        {showForm && (
          <AddCasePage
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              fetchCases(); // Refresh list after saving
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

      {/* Main Page Header */}
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
                Case Management
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 group"
          >
            <Plus
              size={18}
              className="group-hover:rotate-90 transition-transform"
            />
            New Case
          </button>
        </div>
      </header>

      {/* Content Body */}
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="relative mb-10">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, kebele, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest">
              Retrieving Secure Data...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCases.length > 0 ? (
              filteredCases.map((c) => (
                <CaseCard
                  key={c.id || c._id}
                  c={c}
                  onViewImage={setSelectedImage}
                  onViewDetail={() => navigate(`/cases/${c.id || c._id}`)}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search size={24} />
                </div>
                <p className="text-sm font-bold uppercase text-slate-400">
                  No active cases found in the registry
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const CaseCard = ({ c, onViewImage, onViewDetail }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all group"
    >
      <div className="relative h-72 bg-slate-100 overflow-hidden">
        {c.mediaUrl ? (
          <img
            src={`${BASE_URL}${c.mediaUrl}`}
            alt={renderEnglish(c.fullName)}
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
            {renderEnglish(c.caseType?.name || c.caseType) || "Standard"}
          </span>
          {c.isDangerous && (
            <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase flex items-center gap-1 rounded-lg shadow-lg">
              <AlertTriangle size={10} /> High Risk
            </span>
          )}
        </div>
      </div>

      <div className="p-7 space-y-6">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight uppercase truncate mr-2">
              {renderEnglish(c.fullName)}
            </h3>
            <span
              className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                c.status === "open"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {c.status}
            </span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Priority: {c.priority}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
          <div className="flex gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl h-fit">
              <MapPin size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1">
                Last Known
              </p>
              <p className="text-xs font-black text-slate-900 truncate">
                {renderEnglish(c.lastSeenLocation?.name || c.lastSeenLocation)}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="p-2 bg-slate-50 text-slate-400 rounded-xl h-fit">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1">
                Reported
              </p>
              <p className="text-xs font-black text-slate-900">
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

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
    <div className="relative max-w-4xl w-full flex justify-center">
      <motion.img
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        src={src}
        className="max-h-[80vh] rounded-3xl shadow-2xl border-4 border-white/10"
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
