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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = "http://localhost:5000/api/kebele";

  // Fetch kebeles
  const fetchKebeles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setKebeles(res.data);
    } catch (err) {
      setFetchError("Failed to load territories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKebeles();
  }, []);

  // Open Add
  const handleOpenAdd = () => {
    setEditMode(false);
    setFormData({ name: "", description: "" });
    setFormError("");
    setShowPanel(true);
  };

  // Open Edit
  const handleOpenEdit = (kebele) => {
    setEditMode(true);
    setSelectedId(kebele.id);
    setFormData({
      name: kebele.name,
      description: kebele.description || "",
    });
    setFormError("");
    setShowPanel(true);
  };

  // Submit (Add / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError("Territory name is required");
      return;
    }

    try {
      setSaving(true);

      if (editMode) {
        await axios.put(`${API_URL}/${selectedId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }

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
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-600 rounded-xl">
                <MapIcon className="text-white w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black">Territory Management</h1>
            </div>
            <p className="text-slate-500 text-sm">
              Manage kebeles and operational zones
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={16}
              />
              <input
                className="pl-10 pr-4 py-2 bg-white border rounded-xl w-64"
                placeholder="Search kebele..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl"
            >
              <Plus size={16} /> Add Kebele
            </button>
          </div>
        </header>

        {/* Table */}
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredKebeles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400">
                    No kebeles found
                  </td>
                </tr>
              ) : (
                filteredKebeles.map((k, i) => (
                  <tr key={k.id} className="border-t hover:bg-blue-50/40">
                    <td className="p-4 font-bold text-slate-400">#{i + 1}</td>

                    <td className="p-4 font-semibold">{k.name}</td>

                    <td className="p-4 text-slate-500">
                      {k.description || "—"}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(k)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
            />

            <motion.div
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white p-6 z-50"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
            >
              <h2 className="text-xl font-bold mb-6">
                {editMode ? "Edit Kebele" : "Add Kebele"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  className="w-full border p-3 rounded-xl"
                  placeholder="Kebele name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />

                <textarea
                  className="w-full border p-3 rounded-xl"
                  placeholder="Description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                {formError && (
                  <p className="text-red-500 text-sm">{formError}</p>
                )}

                <button
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl"
                >
                  {saving ? "Saving..." : editMode ? "Update" : "Create"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KebelePage;
