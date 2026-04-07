import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  X,
  Search,
  Edit3,
  Map as MapIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const KebelePage = () => {
  const [kebeles, setKebeles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = "http://localhost:5000/api/kebele";

  // Fetch all kebeles
  const fetchKebeles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setKebeles(res.data);
    } catch (err) {
      setFetchError("Database synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKebeles();
  }, []);

  // Open panel for adding a new kebele
  const handleOpenAdd = () => {
    setEditMode(false);
    setFormData({ name: "", description: "" });
    setFormError("");
    setShowPanel(true);
  };

  // Open panel for editing a kebele
  const handleOpenEdit = (kebele) => {
    setEditMode(true);
    setSelectedId(kebele.id);
    setFormData({ name: kebele.name, description: kebele.description || "" });
    setFormError("");
    setShowPanel(true);
  };

  // Submit handler for add/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Kebele designation name is required");
      return;
    }

    try {
      setSaving(true);
      if (editMode) {
        // Update kebele
        await axios.put(`${API_URL}/${selectedId}`, formData);
      } else {
        // Add new kebele
        await axios.post(API_URL, formData);
      }

      // Close panel and refresh kebeles
      setShowPanel(false);
      fetchKebeles();
    } catch (err) {
      setFormError(err.response?.data?.message || "Submission failed");
    } finally {
      setSaving(false);
    }
  };

  const filteredKebeles = kebeles.filter((k) =>
    k.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <MapIcon className="text-white w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Territory Management
              </h1>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Manage jurisdictional kebeles and boundaries
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search territory..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/5 w-64 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> Add Kebele
            </button>
          </div>
        </header>

        {/* Table */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Index
                  </th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Kebele Designation
                  </th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Operational Description
                  </th>
                  <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td
                        colSpan={4}
                        className="px-8 py-6 h-16 bg-slate-50/30"
                      ></td>
                    </tr>
                  ))
                ) : filteredKebeles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <MapPin
                        className="mx-auto text-slate-200 mb-4"
                        size={48}
                      />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        No Territories Found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredKebeles.map((kebele, index) => (
                    <tr
                      key={kebele.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-8 py-5 text-sm font-black text-slate-400">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                            KB
                          </div>
                          <span className="font-bold text-slate-800">
                            {kebele.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-500 font-medium line-clamp-1">
                          {kebele.description || "—"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(kebele)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit Record"
                          >
                            <Edit3 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Panel for Add/Edit */}
      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editMode ? "Modify Kebele" : "New Kebele"}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {editMode
                      ? `Updating ID: ${selectedId}`
                      : "Entry Registration"}
                  </p>
                </div>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Official Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Kebele 01"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Operational Description
                  </label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe territorial boundaries..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-medium text-slate-700 resize-none"
                  />
                </div>

                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3"
                  >
                    <AlertCircle
                      className="text-rose-600 shrink-0 mt-0.5"
                      size={16}
                    />
                    <p className="text-xs font-bold text-rose-700 leading-normal">
                      {formError}
                    </p>
                  </motion.div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin" />
                    ) : editMode ? (
                      "Save Changes"
                    ) : (
                      "Authorize Entry"
                    )}
                  </button>
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => setShowPanel(false)}
                      className="w-full mt-3 py-4 bg-white text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                    >
                      Discard Changes
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KebelePage;
