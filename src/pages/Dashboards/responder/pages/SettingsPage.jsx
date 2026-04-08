import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Hash,
  FileText,
  Loader2,
  AlertCircle,
  Trash2,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Database,
  Settings2,
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
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* --- 1. PRO-TIER HEADER --- */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-slate-300 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Settings2 size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tightest">
                System <span className="text-indigo-600">Config</span>
              </h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Database Protocol: Active
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-96 group">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search case matrix..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-[1.25rem] text-sm font-bold focus:outline-none focus:ring-0 focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-300"
              />
            </div>
          </div>
        </header>

        {/* --- 2. DUAL-PANE LAYOUT --- */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* SIDEBAR: ACTION CENTER */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Add Category
                  </h2>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-1">
                    New Data Entry
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Emergency"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.1rem] text-sm focus:bg-white focus:border-indigo-500 transition-all font-bold"
                    />
                  </div>

                  <button
                    disabled={loading || !name.trim()}
                    className="w-full py-4 bg-indigo-600 text-white rounded-[1.1rem] font-black text-sm hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:grayscale"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Plus size={20} strokeWidth={3} /> Deploy Type
                      </>
                    )}
                  </button>
                </form>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                    <AlertCircle size={18} />
                    <p className="text-[10px] font-black uppercase tracking-tight">
                      {error}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <Database
                className="absolute -right-6 -bottom-6 text-white/5 group-hover:text-indigo-500/20 transition-colors duration-700"
                size={140}
              />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">
                  Sync Engine
                </p>
                <h4 className="text-2xl font-black tracking-tighter">
                  Operational
                </h4>
                <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                    }}
                    className="h-full w-1/3 bg-indigo-500"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT: DATA GRID */}
          <section className="lg:col-span-8 xl:col-span-9">
            {fetchLoading ? (
              <div className="h-[400px] flex flex-col items-center justify-center bg-white border-2 border-slate-100 rounded-[3rem]">
                <Loader2
                  className="animate-spin text-indigo-600 mb-4"
                  size={40}
                />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Downloading Schema
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredTypes.map((type, idx) => (
                    <motion.div
                      layout
                      key={type.id || idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group bg-white p-7 rounded-[2.2rem] border-2 border-slate-100 hover:border-indigo-500 transition-all duration-300 relative"
                    >
                      <div className="flex justify-between items-center mb-10">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12 transition-all duration-300">
                          <Hash size={20} strokeWidth={3} />
                        </div>
                        <button className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-indigo-400">
                          Cluster ID: {type.id || "N/A"}
                        </p>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight italic">
                          {type.name}
                        </h3>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Status: Read_Only
                        </span>
                        <ChevronRight
                          size={18}
                          className="text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredTypes.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
                    <FileText
                      size={48}
                      className="mx-auto text-slate-100 mb-4"
                    />
                    <p className="font-black text-slate-300 uppercase tracking-widest text-xs">
                      No Categories Detected
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
