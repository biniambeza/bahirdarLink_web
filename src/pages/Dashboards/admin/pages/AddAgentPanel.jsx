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
    agencyTypeId: "", // store selected ID
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
        // Make sure backend returns { success: true, data: [...] }
        if (res.data.success) {
          setAgencyTypes(res.data.data);
        } else {
          console.error("Failed to fetch agency types");
        }
      } catch (err) {
        console.error("Error fetching agency types:", err);
      } finally {
        setAgencyLoading(false);
      }
    };
    fetchAgencyTypes();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      setError(err.response?.data?.message || err.message);
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
      className="fixed top-6 right-6 w-full md:w-96 h-[calc(100%-3rem)] bg-white shadow-3xl z-50 p-6 overflow-y-auto 
                 rounded-3xl border border-gray-200 flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 rounded-lg shadow-md">
          Add New Agent
        </h2>
        <button
          onClick={closePanel}
          className="p-2 rounded-full hover:bg-gray-200 transition-all"
        >
          <X size={24} className="text-gray-600 hover:text-gray-900" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm mb-4 text-center font-medium">
          {error}
        </p>
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
            className="w-full px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm hover:shadow-md transition-all text-gray-700 placeholder-gray-400"
          />
        ))}

        {/* Agency Type Select */}
        <select
          name="agencyTypeId"
          value={form.agencyTypeId}
          onChange={handleChange}
          required
          disabled={agencyLoading}
          className="w-full px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm hover:shadow-md transition-all text-gray-700"
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

        {/* Status Select */}
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm hover:shadow-md transition-all text-gray-700"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold 
                     rounded-2xl hover:shadow-xl hover:scale-105 transform transition-all disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Agent"}
        </button>
      </form>
    </motion.div>
  );
};

export default AddAgentPanel;
