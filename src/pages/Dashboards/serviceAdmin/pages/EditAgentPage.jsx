import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";
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

  // Fetch agent
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

  // Fetch agency types (Service Admin context)
  const fetchAgencyTypes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/agencyType", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setAgencyTypes(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAgent();
    fetchAgencyTypes();
  }, [id]);

  // handle change
  const handleChange = (e) => {
    setAgent({ ...agent, [e.target.name]: e.target.value });
  };

  // update agent
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `http://localhost:5000/api/agency/${id}`,
        agent,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        alert("Service agent updated successfully");
        navigate("/agents");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 120 }}
          className="w-full md:w-1/2 h-full bg-white shadow-2xl p-6 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Edit Service Agent
            </h2>

            <button
              onClick={() => navigate("/agents")}
              className="p-2 rounded-full hover:bg-slate-100"
            >
              <X size={22} />
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading agent...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm text-slate-600">Name</label>
                <input
                  type="text"
                  name="name"
                  value={agent.name}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 mt-1"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <input
                  type="email"
                  name="email"
                  value={agent.email}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 mt-1"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-slate-600">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={agent.phone}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 mt-1"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-sm text-slate-600">Location</label>
                <input
                  type="text"
                  name="location"
                  value={agent.location}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 mt-1"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-sm text-slate-600">Status</label>
                <select
                  name="status"
                  value={agent.status}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 mt-1"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Agency Type */}
              <div>
                <label className="text-sm text-slate-600">
                  Service Type (Agency Type)
                </label>

                <select
                  name="agencyTypeId"
                  value={agent.agencyTypeId}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 mt-1"
                >
                  <option value="">Select type</option>

                  {agencyTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save */}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl mt-6 hover:scale-105 transition"
              >
                <Save size={18} />
                {saving ? "Updating..." : "Update Service Agent"}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditAgentPage;
