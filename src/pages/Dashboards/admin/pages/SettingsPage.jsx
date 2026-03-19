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
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSuccess("Agency type created successfully");
      setNewType("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg space-y-6">
      <h1 className="text-2xl font-bold text-[#0052CC] mb-4">
        System Settings
      </h1>
      <p>Configure system options and user preferences.</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-[#0052CC] mb-2">
          Add Agency Type
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New agency type"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#0052CC] flex-1"
          />
          <button
            onClick={handleAddType}
            disabled={loading}
            className="px-4 py-2 bg-[#0052CC] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Add"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
      </div>
    </div>
  );
};

export default SettingsPage;
