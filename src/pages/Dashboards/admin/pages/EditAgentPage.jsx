import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react"; // Added Loader2
import { useNavigate, useParams } from "react-router-dom";

const EditAgentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [agent, setAgent] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    status: "active",
    agencyTypeId: "",
  });

  const [agencyTypes, setAgencyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAgent = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/agency/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const data = res.data.data;
        setAgent({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          status: data.status || "active",
          agencyTypeId: data.agencyTypeId || "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch agent");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencyTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/agency-types", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setAgencyTypes(res.data.data);
    } catch (err) {
      console.error("Type fetch error:", err);
    }
  };

  useEffect(() => {
    fetchAgent();
    fetchAgencyTypes();
  }, [id]);

  const handleChange = (e) => {
    setAgent({ ...agent, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/agency/${id}`, agent, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        // Option: Replace alert with a toast library later
        navigate("/dashboard/agency"); // Navigate back to the list
      }
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Helper for input styling to keep JSX clean
  const inputStyles = "w-full border border-slate-200 rounded-xl px-4 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50";

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => navigate("/dashboard/agency")}
      />

      {/* Side Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
        className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Agent</h2>
            <p className="text-xs text-slate-500">Update agent credentials and status</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/agency")}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="animate-spin" />
              <p className="text-sm">Retrieving agent data...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm">{error}</div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Full Name</label>
                  <input type="text" name="name" value={agent.name} onChange={handleChange} className={inputStyles} required />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Email Address</label>
                  <input type="email" name="email" value={agent.email} onChange={handleChange} className={inputStyles} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Phone</label>
                    <input type="text" name="phone" value={agent.phone} onChange={handleChange} className={inputStyles} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Status</label>
                    <select name="status" value={agent.status} onChange={handleChange} className={inputStyles}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Location / Zone</label>
                  <input type="text" name="location" value={agent.location} onChange={handleChange} className={inputStyles} />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Agency Assignment</label>
                  <select name="agencyTypeId" value={agent.agencyTypeId} onChange={handleChange} className={inputStyles}>
                    <option value="">Select type</option>
                    {agencyTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {saving ? "Saving Changes..." : "Save Agent Details"}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EditAgentPage;