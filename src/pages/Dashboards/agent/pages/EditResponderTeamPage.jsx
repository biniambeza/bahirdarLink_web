import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { X, Shield, Mail, User, Phone, MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// Shift structural layout from localhost endpoints to Render
const API = "https://bahirlink-backend.onrender.com/api";

const renderEnglish = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "object") return val.en || val.name?.en || val.label?.en || val.name || "—";
  if (typeof val === "string" && (val.includes('{"en":') || val.includes('{"am":'))) {
    try { return JSON.parse(val).en || "—"; } catch { return val; }
  }
  return String(val);
};

const EditResponderTeamDrawer = ({ isOpen, onClose, teamId, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    status: "active",
    kebeles: [],
    password: "",
  });
  const [allKebeles, setAllKebeles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !teamId) return;

    let isMounted = true;
    setError("");

    const fetchTeamAndKebeles = async () => {
      try {
        setLoadingData(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [teamRes, kebeleRes] = await axios.all([
          axios.get(`${API}/responderTeam/${teamId}`, { headers }),
          axios.get(`${API}/kebele`, { headers })
        ]);

        if (!isMounted) return;

        const team = teamRes.data.data || teamRes.data;
        setAllKebeles(kebeleRes.data || []);

        setFormData({
          name: team.name || "",
          username: team.username || "",
          email: team.email || "",
          phone: team.phone || "",
          status: team.status || "active",
          kebeles: team.kebeles ? team.kebeles.map((k) => String(k.id || k._id)) : [],
          password: "",
        });
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to initialize structural data.");
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };

    fetchTeamAndKebeles();
    return () => { isMounted = false; };
  }, [isOpen, teamId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleKebele = (id) => {
    const targetId = String(id);
    setFormData((prev) => ({
      ...prev,
      kebeles: prev.kebeles.includes(targetId)
        ? prev.kebeles.filter((k) => k !== targetId)
        : [...prev.kebeles, targetId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const token = localStorage.getItem("token");
      
      await axios.put(`${API}/responderTeam/${teamId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onSave(); 
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to sync structural updates.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#F8FAFC] shadow-2xl z-50 flex flex-col overflow-hidden border-l border-slate-200"
          >
            {/* Header */}
            <div className="bg-white px-6 py-5 flex justify-between items-center border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Shield size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Edit Dispatch Unit</h2>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {teamId.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
                <X size={18} className="text-slate-400 group-hover:text-slate-900" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loadingData ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className="text-xs font-bold tracking-widest uppercase">Fetching System Records...</span>
              </div>
            ) : (
              <form className="flex-1 flex flex-col overflow-hidden" onSubmit={handleSubmit}>
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                  
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Official Team Designation</span>
                      <div className="relative flex items-center">
                        <User size={16} className="absolute left-3 text-slate-400" />
                        <input
                          type="text" name="name" required
                          value={formData.name} onChange={handleChange}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                          placeholder="e.g., Fire & Rescue Alpha"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">System Authentication Alias</span>
                      <div className="relative flex items-center">
                        <Shield size={16} className="absolute left-3 text-slate-400" />
                        <input
                          type="text" name="username" required
                          value={formData.username} onChange={handleChange}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                          placeholder="username_alias"
                        />
                      </div>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Secure Gateway Phone</span>
                        <div className="relative flex items-center">
                          <Phone size={16} className="absolute left-3 text-slate-400" />
                          <input
                            type="tel" name="phone" required
                            value={formData.phone} onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                            placeholder="+251..."
                          />
                        </div>
                      </label>

                      <label className="block">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Operational Status</span>
                        <select
                          name="status" value={formData.status} onChange={handleChange}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all shadow-sm appearance-none cursor-pointer"
                        >
                          <option value="active">🟢 Active Deployment</option>
                          <option value="inactive">🔴 Standby / Inactive</option>
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Notification Center Email</span>
                      <div className="relative flex items-center">
                        <Mail size={16} className="absolute left-3 text-slate-400" />
                        <input
                          type="email" name="email" required
                          value={formData.email} onChange={handleChange}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                          placeholder="unit@domain.com"
                        />
                      </div>
                    </label>
                  </div>

                  {/* Sectors */}
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Jurisdiction Sectors (Kebeles)</span>
                    </div>
                    
                    {allKebeles.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-white rounded-xl p-4 text-center border border-dashed border-slate-200">No sectors found on host network.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                        {allKebeles.map((k) => {
                          const idStr = String(k.id ?? k._id);
                          const isSelected = formData.kebeles.includes(idStr);
                          return (
                            <button
                              type="button" key={idStr} onClick={() => toggleKebele(idStr)}
                              className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between group ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              <span className="truncate">{renderEnglish(k.name)}</span>
                              {isSelected && <CheckCircle size={14} className="shrink-0 ml-1.5 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-white border-t border-slate-200 flex gap-3">
                  <button
                    type="button" onClick={onClose} disabled={submitting}
                    className="flex-1 border border-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors active:scale-[0.99]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    className="flex-[2] bg-blue-600 text-white text-xs font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/10 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> COMMITTING...
                      </>
                    ) : (
                      "SAVE CHANGES"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditResponderTeamDrawer;