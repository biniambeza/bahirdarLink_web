import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Loader2,
  MapPin,
  ChevronRight,
  User,
  ShieldCheck,
  Activity,
  Filter,
  X,
  Maximize2,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import AddCasePage from "./AddCasePage";

const BASE_URL = "http://localhost:5000";

// --- Lightbox Component ---
const ImageViewer = ({ src, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[100] p-4 backdrop-blur-md cursor-zoom-out"
    onClick={onClose}
  >
    <motion.img
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      src={src}
      className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
    />
    <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
      <X size={32} />
    </button>
  </motion.div>
);

const ResponderCasesPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // State for Lightbox

  const storedUser = localStorage.getItem("user");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const responderTeamId = userData?.responderTeamId || userData?.id;

  const fetchCases = useCallback(async () => {
    if (!responderTeamId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/cases/team/${responderTeamId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setCases(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [responderTeamId]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const filteredCases = cases.filter((c) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      c.fullName?.toLowerCase().includes(searchStr) ||
      c.caseType?.name?.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* Lightbox Portal */}
      <AnimatePresence>
        {selectedImage && (
          <ImageViewer
            src={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>

      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">
                Case<span className="text-blue-600">Central</span>
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Unit: {userData?.name || "Responder"}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
          >
            <Plus size={18} strokeWidth={3} /> Create Report
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        {/* Search & Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 relative group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600"
              size={20}
            />
            <input
              type="text"
              placeholder="Search active cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none shadow-sm"
            />
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Records Found
              </p>
              <p className="text-lg font-black">{filteredCases.length}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCases.map((c) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 group flex flex-col"
                >
                  <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      REF: #{c.id}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>

                  {/* Improved Image Container with Hover Effects */}
                  <div className="h-64 w-full bg-slate-100 relative overflow-hidden group/img">
                    {c.mediaUrl ? (
                      <>
                        <img
                          src={`${BASE_URL}${c.mediaUrl}`}
                          alt={c.fullName}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                        />
                        {/* Interactive Overlay */}
                        <div
                          onClick={() =>
                            setSelectedImage(`${BASE_URL}${c.mediaUrl}`)
                          }
                          className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                        >
                          <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white">
                            <Maximize2 size={24} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <User size={64} strokeWidth={1} />
                        <span className="text-[10px] font-bold uppercase mt-2">
                          No Visual Record
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4">
                      <div className="px-4 py-1.5 bg-white/90 backdrop-blur text-blue-700 text-[10px] font-black uppercase rounded-full shadow-sm">
                        {c.caseType?.name || "Incident"}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-6 flex-grow">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                      {c.fullName || "Unidentified"}
                    </h2>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <MapPin size={18} className="text-rose-500" />
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">
                            Primary Location
                          </p>
                          <p className="text-sm font-bold text-slate-700 truncate">
                            {c.Kebele?.name || "Standard Jurisdiction"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-slate-200 hover:shadow-blue-200">
                      View Full Dossier{" "}
                      <ChevronRight
                        size={16}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl bg-white"
          >
            <AddCasePage
              onClose={() => setShowForm(false)}
              onSaved={() => {
                fetchCases();
                setShowForm(false);
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase() || "pending";
  const styles = {
    approved: "text-emerald-600 bg-emerald-50 border-emerald-100",
    pending: "text-amber-600 bg-amber-50 border-amber-100",
    rejected: "text-rose-600 bg-rose-50 border-rose-100",
  };
  return (
    <span
      className={`text-[9px] font-black px-3 py-1 rounded-lg border uppercase ${styles[s] || styles.pending}`}
    >
      {s}
    </span>
  );
};

export default ResponderCasesPage;
