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
  ShieldCheck,
  BadgeCheck,
  Search,
} from "lucide-react";

const AddResponseTeamDrawer = ({ isOpen, onClose, onSave, agencyId = 1 }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    status: "active",
    kebeles: [],
    agencyId,
  });

  const [allKebeles, setAllKebeles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchKebeles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/kebele");
        setAllKebeles(res.data);
      } catch (err) {
        console.error("Failed to fetch kebeles:", err);
      }
    };
    if (isOpen) fetchKebeles();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleKebele = (kebeleName) => {
    setFormData((prev) => ({
      ...prev,
      kebeles: prev.kebeles.includes(kebeleName)
        ? prev.kebeles.filter((k) => k !== kebeleName)
        : [...prev.kebeles, kebeleName],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.kebeles.length === 0)
      return alert("Select at least one kebele.");

    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:5000/api/responderTeam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save team");
      onSave(data.data);
      onClose();
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
    } catch (err) {
      alert(err.message);
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
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full max-w-lg h-screen bg-slate-50 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="text-blue-600" />
                  New Response Team
                </h3>
                <p className="text-sm text-slate-500">
                  Register a team for emergency dispatch
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Form Content */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-8"
            >
              {/* Section: Basic Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Team Profile
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <InputField
                    icon={BadgeCheck}
                    label="Team Display Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alpha Unit 1"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      icon={User}
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="alpha_01"
                    />
                    <InputField
                      icon={Phone}
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+251..."
                    />
                  </div>
                  <InputField
                    icon={Mail}
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="team@agency.com"
                  />
                  <InputField
                    icon={Lock}
                    label="Access Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Section: Status & Assignments */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Dispatch Assignment
                </h4>

                {/* Custom Status Toggle */}
                <div className="flex gap-4">
                  {["active", "inactive"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, status: s }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition ${
                        formData.status === s
                          ? "bg-blue-50 border-blue-600 text-blue-700"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Kebele Multi-Selector */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500" /> Operational
                    Kebeles
                  </label>

                  {/* Search inner */}
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Search kebeles..."
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {filteredKebeles.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => toggleKebele(k.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          formData.kebeles.includes(k.name)
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {k.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Response Team</>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper Input Component
const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
        <Icon size={18} />
      </div>
      <input
        {...props}
        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
      />
    </div>
  </div>
);

export default AddResponseTeamDrawer;
