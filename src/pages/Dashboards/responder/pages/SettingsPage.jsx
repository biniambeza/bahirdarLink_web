import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Hash,
  Loader2,
  AlertCircle,
  Trash2,
  Search,
  ChevronRight,
  Database,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SettingsPage = () => {
  const [caseTypes, setCaseTypes] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = "http://localhost:5000/api/caseType";

  const fetchCaseTypes = async () => {
    try {
      const res = await axios.get(API_URL);
      setCaseTypes(res.data);
    } catch (err) {
      setError("Sync failed. Check system logs.");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(API_URL, { name: name.trim() });
      setCaseTypes([...caseTypes, res.data]);
      setName("");
      setError("");
    } catch (err) {
      setError("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTypes = caseTypes.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-800 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* --- SIMPLE HEADER --- */}
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
          {/* Add Form - Prominent */}
          <form
            onSubmit={handleSubmit}
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
              disabled={loading || !name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              <span>Add Type</span>
            </button>
          </form>

          {/* Search Bar - Subtle */}
          <div className="lg:col-span-2 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Filter list..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-slate-100/50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-200 transition-all text-sm"
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {/* --- GRID --- */}
        {fetchLoading ? (
          <div className="py-20 flex flex-col items-center justify-center opacity-40">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
            <p className="text-sm font-medium">Loading classifications...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTypes.map((type) => (
                <motion.div
                  key={type.id || type.name}
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

                  <h3 className="text-lg font-semibold text-slate-800">
                    {type.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                    ID: {type.id || "---"}
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
                <h3 className="text-slate-500 font-medium">No results found</h3>
                <p className="text-slate-400 text-sm">
                  Try adjusting your search filters.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
