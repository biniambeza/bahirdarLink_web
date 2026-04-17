import { useState } from "react";
import axios from "axios";

const SettingsPage = () => {
  const [newType, setNewType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddType = async () => {
    if (!newType.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/agencyType",
        { name: newType },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSuccess("Service type created successfully!");
      setNewType("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            System Settings
          </h1>
          <p className="text-gray-500">
            Manage service types and system configurations.
          </p>
        </div>

        {/* Add Service Type */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-600">
            Add Service Type
          </h2>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="New service type (e.g. Electric Utility)"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-blue-50 text-gray-700 
                         placeholder-gray-400 focus:ring-2 focus:ring-blue-400 
                         focus:outline-none shadow-sm transition-all"
            />

            <button
              onClick={handleAddType}
              disabled={loading}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 
                         text-white font-semibold rounded-2xl hover:shadow-lg 
                         hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? "Creating..." : "Add"}
            </button>
          </div>

          {/* Messages */}
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          {success && (
            <p className="text-green-500 text-sm font-medium">{success}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
