import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Clock, ChevronRight, ShieldCheck, Layers, 
  MapPin, Loader2, Activity, Zap, CheckCircle2, Filter, Info
} from "lucide-react";
import EmergencyDetailDrawer from "./EmergencyDetailDrawer";

const API_BASE = "http://localhost:5000";

const ResponderIncidentsPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForMerge, setSelectedForMerge] = useState([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const decoded = jwtDecode(token);
      
      const [emergencyRes, typesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/emergencies/responder-team/${decoded.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/emergencyType`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const incidentData = emergencyRes.data?.data || [];
      setEmergencies(incidentData);
      const teamTypeId = incidentData[0]?.emergencyTypeId;
      const emergencyTypes = typesRes.data?.emergencyTypes || typesRes.data?.data || [];
      const targetType = emergencyTypes.find(t => t._id === teamTypeId || t.id === teamTypeId);
      setCategories(targetType?.categories || []);
    } catch (err) {
      console.error("Critical: Data Sync Failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredIncidents = useMemo(() => {
    const map = new Map();
    emergencies.forEach((item) => {
      const key = item.emergedId || (item._id || item.id);
      if (!map.has(key)) map.set(key, { ...item, mergedCount: 1 });
      else map.get(key).mergedCount += 1;
    });

    return Array.from(map.values()).filter((incident) => {
      const matchesCat = !selectedCategory || incident.categoryId === (selectedCategory._id || selectedCategory.id);
      const query = searchQuery.toLowerCase();
      const location = `${incident.kebele?.name || ""} ${incident.subdivision || ""}`.toLowerCase();
      return matchesCat && location.includes(query);
    });
  }, [emergencies, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col antialiased selection:bg-blue-100 selection:text-blue-700">
      
      {/* ENTERPRISE TOP NAV */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-slate-900 p-2 rounded-lg">
              <ShieldCheck className="text-blue-400" size={22} />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-black tracking-tighter text-slate-900 uppercase">Incident Command</h1>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Active</span>
              </div>
            </div>
          </div>

          <div className="relative flex-1 max-w-xl group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search by geo-coordinates, sector, or ID..."
              className="w-full bg-slate-100/50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
             <button onClick={fetchData} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                <Activity size={18} />
             </button>
             <div className="h-8 w-[1px] bg-slate-200 mx-2" />
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold">
                OP
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto w-full px-6 py-6 grid grid-cols-12 gap-6 flex-1">
        
        {/* LEFT FILTER SIDEBAR (Hidden on mobile, Pro layout) */}
        <aside className="col-span-3 space-y-6 hidden lg:block">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Filter size={14} /> Dispatch Categories
            </h2>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  !selectedCategory ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>All Assignments</span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">{emergencies.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id || cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedCategory?._id === cat._id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
            <Zap className="absolute -right-4 -bottom-4 text-white/10" size={100} />
            <h3 className="text-sm font-black uppercase tracking-tighter opacity-80">Pro Tip</h3>
            <p className="text-xs mt-2 leading-relaxed font-medium">Select multiple reports from the same location to consolidate them into a single incident thread.</p>
          </div>
        </aside>

        {/* MAIN LIST AREA */}
        <section className="col-span-12 lg:col-span-9">
          {isLoading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
              <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Initializing Live Feed...</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredIncidents.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border border-slate-200 shadow-sm">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Zero Active Incidents</h3>
                  <p className="text-sm text-slate-500 mt-1">Status normal for the selected criteria.</p>
                </div>
              ) : (
                filteredIncidents.map((incident) => {
                  const id = incident._id || incident.id;
                  const isSelected = selectedForMerge.includes(id);

                  return (
                    <motion.div
                      layout
                      key={id}
                      className={`group bg-white border rounded-2xl transition-all overflow-hidden ${
                        isSelected ? "border-blue-600 ring-4 ring-blue-50 shadow-lg" : "border-slate-200 hover:border-slate-300 shadow-sm"
                      }`}
                    >
                      <div className="flex items-stretch">
                        <div className={`w-1.5 ${incident.mergedCount > 1 ? 'bg-amber-400' : 'bg-blue-600'}`} />
                        <div className="p-4 flex items-center gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setSelectedForMerge(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                          />
                          
                          <div 
                            className="flex flex-1 items-center gap-6 cursor-pointer"
                            onClick={() => { setSelectedIncident(incident); setIsDrawerOpen(true); }}
                          >
                            <div className="hidden sm:flex flex-col items-center justify-center min-w-[60px] border-r border-slate-100 pr-4">
                               <p className="text-[10px] font-black text-slate-400 uppercase">Received</p>
                               <p className="text-sm font-black text-slate-700">
                                 {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </p>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-900 truncate tracking-tight uppercase text-sm">
                                  {incident.kebele?.name || "Unmapped Sector"}
                                </h3>
                                {incident.mergedCount > 1 && (
                                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1">
                                    <Layers size={10} /> {incident.mergedCount} Reports
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                <span className="flex items-center gap-1"><MapPin size={12}/> {incident.subdivision || "N/A"}</span>
                                <span className="flex items-center gap-1 text-blue-600"><Info size={12}/> {incident.category?.name}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                               <div className="text-right hidden md:block">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Severity Score</p>
                                  <p className="text-xs font-black text-slate-900">PRIORITY A-1</p>
                               </div>
                               <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </section>
      </main>

      {/* COMPACT CONSOLIDATION TOAST */}
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
                {selectedForMerge.length} items selected for merge
              </span>
              <div className="flex gap-1">
                <button onClick={() => setSelectedForMerge([])} className="px-3 py-2 text-xs font-bold hover:bg-white/10 rounded-lg transition-colors">Dismiss</button>
                <button 
                  onClick={() => {/* handleMerge call */}}
                  className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-black hover:bg-blue-500 shadow-lg shadow-blue-900/40"
                >
                  Confirm Merge
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
      />
    </div>
  );
};

export default ResponderIncidentsPage;