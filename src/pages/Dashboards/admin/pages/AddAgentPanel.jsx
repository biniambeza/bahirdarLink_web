import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { X } from "lucide-react";

const AddAgentPanel = ({ closePanel, refreshAgents }) => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    location: "",
    agencyTypeId: "",
    status: "active",
  });

  const [agencyTypes, setAgencyTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agencyLoading, setAgencyLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Agency Types
  useEffect(() => {
    const fetchAgencyTypes = async () => {
      setAgencyLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/agencyType", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setAgencyTypes(res.data.data);
      } catch (err) {
        console.error("Error fetching agency types:", err);
      } finally {
        setAgencyLoading(false);
      }
    };
    fetchAgencyTypes();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAgencyTypeChange = (e) => {
    setForm({ ...form, agencyTypeId: Number(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/agency", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshAgents();
      closePanel();
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data?.error || err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.35 }}
      className="fixed top-0 right-0 w-full md:w-96 h-screen bg-gradient-to-b from-blue-50 to-white shadow-2xl z-50 p-6 overflow-y-auto flex flex-col rounded-l-3xl"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600 bg-white px-4 py-2 rounded-xl shadow-md">
          Add New Agent
        </h2>
        <button
          onClick={closePanel}
          className="p-2 rounded-full hover:bg-blue-100 transition-all"
        >
          <X size={24} className="text-blue-600" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-center mb-4 font-medium">{error}</p>
      )}

      {/* Form */}
      <form className="space-y-4 flex-1" onSubmit={handleSubmit}>
        {[
          { name: "name", placeholder: "Full Name", required: true },
          { name: "username", placeholder: "Username", required: true },
          {
            name: "password",
            placeholder: "Password",
            type: "password",
            required: true,
          },
          { name: "email", placeholder: "Email" },
          { name: "phone", placeholder: "Phone" },
          { name: "location", placeholder: "Location" },
        ].map((field) => (
          <input
            key={field.name}
            name={field.name}
            type={field.type || "text"}
            placeholder={field.placeholder}
            value={form[field.name]}
            onChange={handleChange}
            required={field.required || false}
            className="w-full px-4 py-3 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700 placeholder-gray-400 transition-all bg-white"
          />
        ))}

        {/* Agency Type */}
        <select
          name="agencyTypeId"
          value={form.agencyTypeId}
          onChange={handleAgencyTypeChange}
          required
          disabled={agencyLoading}
          className="w-full px-4 py-3 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700 bg-white transition-all"
        >
          <option value="">
            {agencyLoading ? "Loading Agency Types..." : "Select Agency Type"}
          </option>
          {agencyTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-2xl shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700 bg-white transition-all"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Agent"}
        </button>
      </form>
    </motion.div>
  );
};

export default AddAgentPanel;
