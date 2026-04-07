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
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans selection:bg-blue-100">
      {/* 1. Dynamic Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200">
            <Layers size={26} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              Case Architecture
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                Active Dispatch Protocols
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search category matrix..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* 2. Main Body */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Registration Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-black text-slate-900 mb-2">
                Initialize Type
              </h2>
              <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">
                Add a new classification to the central dispatch database.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Title Designation
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rapid Response"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold placeholder:text-slate-300"
                  />
                </div>

                <button
                  disabled={loading || !name.trim()}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Deploy Category <Plus size={18} strokeWidth={3} />
                    </>
                  )}
                </button>
              </form>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-rose-50 text-rose-600 rounded-2xl flex gap-3 items-center border border-rose-100"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-[11px] font-bold uppercase tracking-tight leading-tight">
                    {error}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative group">
            <Database
              className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-700"
              size={120}
            />
            <div className="relative z-10">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">
                Storage Status
              </p>
              <h4 className="text-lg font-bold">System Load</h4>
              <p className="text-xs text-slate-400 mt-1 font-medium italic">
                All nodes synchronized.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Grid */}
        <section className="lg:col-span-8 xl:col-span-9">
          {fetchLoading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-inner">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-50 rounded-full border-t-blue-600 animate-spin" />
                <Layers
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600"
                  size={20}
                />
              </div>
              <p className="mt-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
                Fetching Data Matrix
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredTypes.map((type, idx) => (
                  <motion.div
                    layout
                    key={type.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white p-6 rounded-[2.5rem] border border-slate-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 relative flex flex-col justify-between min-h-[180px]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                        <Hash size={18} strokeWidth={2.5} />
                      </div>
                      <button className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-8">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">
                        Node Cluster #{type.id?.toString().slice(-4) || "N/A"}
                      </p>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-slate-900">
                        {type.name}
                      </h3>
                    </div>

                    <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                      <ChevronRight className="text-blue-600" size={20} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTypes.length === 0 && !fetchLoading && (
                <div className="col-span-full h-96 bg-white border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-400">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FileText
                      size={32}
                      strokeWidth={1}
                      className="opacity-20"
                    />
                  </div>
                  <p className="font-black text-[11px] uppercase tracking-widest text-slate-300">
                    No results found in current scope
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
