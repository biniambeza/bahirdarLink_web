import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  MapPin,
  ChevronRight,
  User,
  ShieldCheck,
  X,
  Maximize2,
  Hash,
  UserCircle,
  Info,
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

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/cases/team/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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
      c.Kebele?.name?.toLowerCase().includes(searchStr) ||
      c.caseType?.name?.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <AnimatePresence>
        {selectedImage && (
          <ImageViewer
            src={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white">
              <ShieldCheck size={18} />
            </div>
            <span className="font-bold text-slate-800">CaseCentral</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
          >
            <Plus size={16} className="inline mr-1" /> New Case
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Search by Kebele included here */}
        <div className="relative mb-8">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search name or Kebele name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 bg-white rounded-2xl animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((c) => (
              <CaseCard key={c.id} c={c} onViewImage={setSelectedImage} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const CaseCard = ({ c, onViewImage }) => {
  const type = c.caseType?.name?.toLowerCase();

  const typeTheme = {
    wanted: "border-t-rose-500 text-rose-700 bg-rose-50",
    missing: "border-t-amber-500 text-amber-700 bg-amber-50",
    default: "border-t-indigo-500 text-indigo-700 bg-indigo-50",
  };

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm border-t-4 ${typeTheme[type]?.split(" ")[0] || typeTheme.default.split(" ")[0]}`}
    >
      {/* Image Section */}
      <div className="relative h-44 bg-slate-100">
        {c.mediaUrl ? (
          <img
            src={`${BASE_URL}/${c.mediaUrl.replace(/^\//, "")}`}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <User size={48} />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm ${typeTheme[type] || typeTheme.default}`}
          >
            {c.caseType?.name}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-slate-800 text-lg mb-4 truncate">
          {c.fullName}
        </h3>

        {/* --- Highlighted Kebele --- */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <MapPin size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">
              Last Seen Kebele
            </p>
            <p className="text-sm font-bold text-slate-800">
              {c.Kebele?.name || "Not Recorded"}
            </p>
          </div>
        </div>

        {/* Age & Gender Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-slate-400" />
            <span className="text-xs text-slate-600">
              <strong>Age:</strong> {c.age || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <UserCircle size={14} className="text-slate-400" />
            <span className="text-xs text-slate-600 capitalize">
              <strong>Gender:</strong> {c.gender || "—"}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
            <Info size={12} /> Description
          </p>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 italic">
            "{c.description || "No further details provided."}"
          </p>
        </div>

        <button className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors">
          Open Case File <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

const ImageViewer = ({ src, onClose }) => (
  <div
    className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
    onClick={onClose}
  >
    <img src={src} className="max-w-full max-h-full rounded-lg" alt="" />
    <button className="absolute top-6 right-6 text-white">
      <X size={30} />
    </button>
  </div>
);

export default ResponderCasesPage;
