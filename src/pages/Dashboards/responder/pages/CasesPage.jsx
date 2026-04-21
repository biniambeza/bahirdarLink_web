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
      const res = await axios.get(`${BASE_URL}/api/cases/team/all`);
      setCases(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const filteredCases = cases.filter((c) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      c.fullName?.toLowerCase().includes(searchStr) ||
      c.lastSeenLocation?.name?.toLowerCase().includes(searchStr) || // Updated alias for search
      c.caseType?.name?.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <AnimatePresence>
        {selectedImage && (
          <ImageViewer
            src={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
        {showForm && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <AddCasePage
              onClose={() => {
                setShowForm(false);
                fetchCases();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
          >
            <Plus size={18} /> New Case
          </button>
        </div>
      </header>

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
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest">
              Retrieving Secure Data...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((c) => (
              <CaseCard
                key={c.id}
                c={c}
                onViewImage={setSelectedImage}
                onViewDetail={() => navigate(`/cases/${c.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const CaseCard = ({ c, onViewImage, onViewDetail }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all group"
    >
      <div className="relative h-64 bg-slate-100 overflow-hidden">
        {c.mediaUrl ? (
          <img
            src={`${BASE_URL}${c.mediaUrl}`}
            alt={c.fullName}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 cursor-pointer"
            onClick={() => onViewImage(`${BASE_URL}${c.mediaUrl}`)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <User size={60} />
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200 shadow-sm">
            {c.caseType?.name || "Standard Case"}
          </span>
          {c.isDangerous && (
            <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase flex items-center gap-1 rounded-lg shadow-lg">
              <AlertTriangle size={10} /> High Risk
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight uppercase">
              {c.fullName}
            </h3>
            <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {c.status}
            </span>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Priority: {c.priority}
          </p>
        </div>

        {/* Location Display - Matched to Detail Page Style */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
          <div className="flex gap-3">
            <div className="p-2 bg-slate-50 text-blue-600 rounded-lg h-fit">
              <MapPin size={16} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1">
                Last Known
              </p>
              <p className="text-xs font-black text-slate-900 truncate">
                {c.lastSeenLocation?.name || "Unknown"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="p-2 bg-slate-50 text-blue-600 rounded-lg h-fit">
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
          className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
        >
          View Full Dossier <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

const ImageViewer = ({ src, onClose }) => (
  <div
    className="fixed inset-0 bg-slate-900/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
    onClick={onClose}
  >
    <img
      src={src}
      className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border-4 border-white"
      alt="Evidence"
    />
    <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-all">
      <X size={32} />
    </button>
  </div>
);

export default ResponderCasesPage;
