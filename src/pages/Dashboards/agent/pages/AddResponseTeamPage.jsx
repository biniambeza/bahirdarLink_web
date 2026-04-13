import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2 } from "lucide-react";
import axios from "axios";
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ShieldCheck,
  BadgeCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldPlus,
  ArrowRight,
} from "lucide-react";

const API = "http://localhost:5000/api";

const AddResponseTeamDrawer = ({ isOpen, onClose, onSave, agencyId }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    status: "active", // ✅ default active
    kebeles: [],
    agencyId: agencyId || "",
  });

  const [allKebeles, setAllKebeles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(""); // For showing backend errors

  useEffect(() => {
    setFormData((prev) => ({ ...prev, agencyId }));
  }, [agencyId]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchKebeles = async () => {
      try {
        const res = await axios.get(`${API}/kebele`);
        setAllKebeles(res.data);
      } catch (err) {
        console.error("Failed to fetch kebeles:", err);
      }
    };
    fetchKebeles();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleKebele = (kebeleId) => {
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
      setError(""); // clear previous errors
      const res = await axios.post(`${API}/responderTeam`, formData);
      onSave(res.data.data || res.data);
      resetForm();
      onClose();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message); // show backend message
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredKebeles = allKebeles.filter((k) =>
    k.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

 

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 w-full max-w-xl h-screen bg-white shadow-2xl z-[70] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white px-8 py-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <ShieldPlus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    Create Response Team
                  </h3>
                  <p className="text-xs text-slate-400 font-medium tracking-tight">
                    System Node Registration
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              {/* Show backend error if exists */}
              {error && (
                <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md mb-4">
                  {error}
                </div>
              )}
              <div className="p-8 space-y-10">
                {/* Account Credentials */}
                <section className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                      Account Credentials
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <InputField
                      label="Team Designation"
                      icon={BadgeCheck}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Alpha-One"
                    />
                    <InputField
                      label="System Username"
                      icon={User}
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="alpha_01"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <InputField
                      label="Email Address"
                      icon={Mail}
                      name="email"
                      type="email"
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
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                  />
                </section>

                {/* ✅ STATUS SECTION (NEW — MATCHES STYLE) */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                      Team Status
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase
                        ${
                          formData.status === "active"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-red-50 text-red-600"
                        }`}
                    >
                      {formData.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          status: "active",
                        }))
                      }
                      className={`p-2.5 rounded-lg border text-xs font-bold transition-all
                        ${
                          formData.status === "active"
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-50"
                            : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"
                        }`}
                    >
                      Active
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          status: "inactive",
                        }))
                      }
                      className={`p-2.5 rounded-lg border text-xs font-bold transition-all
                        ${
                          formData.status === "inactive"
                            ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-50"
                            : "bg-white border-slate-200 text-slate-500 hover:border-red-300"
                        }`}
                    >
                      Inactive
                    </button>
                  </div>
                </section>

                {/* Geographic Assignment */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                      Geographic Assignment
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded uppercase">
                      {formData.kebeles.length} Selected
                    </span>
                  </div>

                  <div className="relative group">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Filter available kebeles..."
                      className="w-full bg-slate-50 border border-slate-100 pl-10 pr-4 py-2.5 rounded-lg text-xs focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-400 outline-none transition-all"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {filteredKebeles.map((k) => {
                      const isSelected = formData.kebeles.includes(k.id);

                      return (
                        <button
                          key={k.id}
                          type="button"
                          onClick={() => toggleKebele(k.id)}
                          className={`group p-2.5 rounded-lg border text-left transition-all flex items-center gap-2
                            ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-50"
                                : "bg-white border-slate-200 hover:border-blue-300 text-slate-600"
                            }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[11px] font-bold truncate ${
                                isSelected ? "text-white" : "text-slate-700"
                              }`}
                            >
                              {k.name}
                            </p>
                          </div>

                          {isSelected ? (
                            <CheckCircle2
                              size={12}
                              className="text-white shrink-0"
                            />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full border border-slate-300 group-hover:border-blue-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 mt-auto">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs tracking-[0.1em] shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all disabled:bg-slate-300 flex items-center justify-center gap-2 group"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>FINALIZE REGISTRATION</span>
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="flex-1 space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
        <Icon size={16} />
      </div>
      <input
        {...props}
        className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 outline-none transition-all shadow-sm"
      />
    </div>
  </div>
);

export default AddResponseTeamDrawer;
