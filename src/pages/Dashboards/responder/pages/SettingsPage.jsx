import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Settings,
  Hash,
  FileText,
  Loader2,
  AlertCircle,
  Trash2,
  Search,
  Filter,
  Layers,
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
      setError("Failed to sync system categories.");
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
    } catch (err) {
      setError("Addition failed. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTypes = caseTypes.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Integrated Header & Action Bar */}
      <div className="bg-white rounded-[2.5rem] p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 px-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Case Architecture
            </h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Protocol Configuration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm font-medium focus:outline-none"
            />
          </div>
          <button className="p-2.5 bg-white shadow-sm rounded-xl text-slate-600 hover:text-blue-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* 2. Main Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Quick Add Panel */}
        <div className="xl:col-span-1">
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 sticky top-6">
            <h2 className="text-lg font-bold mb-2">Registration</h2>
            <p className="text-blue-100 text-xs mb-8 font-medium leading-relaxed">
              New categories will be instantly propagated to all dispatch units.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category Title"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm placeholder:text-blue-200 focus:outline-none focus:bg-white focus:text-slate-900 transition-all font-bold"
              />
              <button
                disabled={loading || !name.trim()}
                className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Plus size={18} /> Add Type
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-white/10 rounded-2xl flex gap-3 items-center border border-white/10">
                <AlertCircle size={16} className="shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="xl:col-span-3">
          {fetchLoading ? (
            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-200 border-dashed">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                Accessing Secure Records...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTypes.map((type) => (
                  <motion.div
                    layout
                    key={type.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-900/5 transition-all relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <Hash size={20} />
                      </div>
                      <button className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-6 relative z-10">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                        Index #{type.id}
                      </p>
                      <h3 className="text-xl font-bold text-slate-800 truncate">
                        {type.name}
                      </h3>
                    </div>

                    {/* Decorative background element */}
                    <div className="absolute -right-4 -bottom-4 text-slate-50 group-hover:text-blue-50 transition-colors duration-500">
                      <FileText size={100} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTypes.length === 0 && (
                <div className="col-span-full h-80 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400">
                  <FileText
                    size={48}
                    strokeWidth={1.5}
                    className="mb-4 opacity-20"
                  />
                  <p className="font-bold text-sm uppercase tracking-widest">
                    No matching records found
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
