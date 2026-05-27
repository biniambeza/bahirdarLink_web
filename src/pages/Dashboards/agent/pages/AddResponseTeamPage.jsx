import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  BadgeCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  ShieldPlus,
  ArrowRight,
} from "lucide-react";

// Pointed strictly to production instance
const API = "https://bahirlink-backend.onrender.com/api";

/* ═══════════════════════════════════════════════════════
   LOCALIZATION HELPER (Amharic Safe Rendering)
═══════════════════════════════════════════════════════ */
const renderEnglish = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "object") return val.en || val.name?.en || val.label?.en || val.name || "—";
  if (typeof val === "string" && (val.includes('{"en":') || val.includes('{"am":'))) {
    try { return JSON.parse(val).en || "—"; } catch { return val; }
  }
  return String(val);
};

const AddResponseTeamDrawer = ({ isOpen, onClose, onSave, agencyId }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    status: "active",
    kebeles: [],
    agencyId: agencyId || "",
  });

  const [allKebeles, setAllKebeles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData((prev) => ({ ...prev, agencyId }));
  }, [agencyId]);

  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;
    const fetchKebeles = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/kebele`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (isMounted) setAllKebeles(res.data || []);
      } catch (err) {
        console.error("Failed to fetch kebeles:", err);
      }
    };
    fetchKebeles();
    
    return () => { isMounted = false; };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleKebele = (id) => {
    const kebeleId = String(id);
    setFormData((prev) => ({
      ...prev,
      kebeles: prev.kebeles.includes(kebeleId)
        ? prev.kebeles.filter((id) => id !== kebeleId)
        : [...prev.kebeles, kebeleId],
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      status: "active",
      kebeles: [],
      agencyId,
    });
    setSearchTerm("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.username ||
      !formData.email ||
      !formData.password
    )
      return;

    try {
      setSubmitting(true);
      setError("");
      
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/responderTeam`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onSave(res.data.data || res.data);
      resetForm();
      onClose();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected network error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredKebeles = allKebeles.filter((k) => {
    const nameStr = renderEnglish(k?.name || k);
    return nameStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlays */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[60]"
          />

          {/* Right Sided Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 w-full max-w-xl h-screen bg-[#F8FAFC] shadow-2xl z-[70] flex flex-col overflow-hidden border-l border-slate-200"
          >
            {/* Header section */}
            <div className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/10">
                  <ShieldPlus size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider leading-tight">
                    Create Response Team
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono font-medium tracking-tight">
                    SYSTEM NODE REGISTRATION
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Scroller Container */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Error Banner Injection */}
                {error && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fadeIn">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Account Credentials Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Account Credentials
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Team Designation"
                      icon={BadgeCheck}
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Alpha-One"
                    />
                    <InputField
                      label="System Username"
                      icon={User}
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="alpha_01"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Email Address"
                      icon={Mail}
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="team@agency.gov"
                    />
                    <InputField
                      label="Emergency Contact"
                      icon={Phone}
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+251..."
                    />
                  </div>

                  <InputField
                    label="Access Password"
                    icon={Lock}
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                  />
                </section>

                {/* Team Status Section */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Team Status
                    </h4>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        formData.status === "active"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {formData.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, status: "active" }))}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        formData.status === "active"
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      Active Deployment
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, status: "inactive" }))}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        formData.status === "inactive"
                          ? "bg-slate-800 border-slate-800 text-white shadow-md"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      Standby / Inactive
                    </button>
                  </div>
                </section>

                {/* Geographic Allocation Grid */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Geographic Assignment
                    </h4>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100 uppercase tracking-wider">
                      {formData.kebeles.length} Sectors Selected
                    </span>
                  </div>

                  <div className="relative group">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      size={15}
                    />
                    <input
                      type="text"
                      placeholder="Filter available jurisdiction sectors..."
                      className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {allKebeles.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4 bg-white border border-dashed border-slate-200 rounded-xl">
                      No jurisdictional sectors synced to portal.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                      {filteredKebeles.map((k) => {
                        const idStr = String(k.id ?? k._id);
                        const isSelected = formData.kebeles.includes(idStr);

                        return (
                          <button
                            key={idStr}
                            type="button"
                            onClick={() => toggleKebele(idStr)}
                            className={`group p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-1.5 ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10"
                                : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                            }`}
                          >
                            <span className="truncate">{renderEnglish(k.name || k)}</span>
                            {isSelected ? (
                              <CheckCircle2 size={13} className="text-white shrink-0" />
                            ) : (
                              <div className="w-2.5 h-2.5 rounded-full border border-slate-300 group-hover:border-slate-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>

              {/* Drawer Sticky Footer controls */}
              <div className="p-4 bg-white border-t border-slate-200 mt-auto flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 border border-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] bg-slate-900 text-white rounded-xl font-bold text-xs tracking-wider hover:bg-blue-600 transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2 group"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>FINALIZE REGISTRATION</span>
                      <ArrowRight
                        size={15}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════
   SUB-COMPONENT INPUT FIELD ARCHITECTURE
═══════════════════════════════════════════════════════ */
const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="flex-1 space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Icon size={15} />
      </div>
      <input
        {...props}
        className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-slate-900 placeholder-slate-400"
      />
    </div>
  </div>
);

export default AddResponseTeamDrawer;