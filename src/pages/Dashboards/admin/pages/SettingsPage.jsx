import { useState } from "react";
import axios from "axios";

const SettingsPage = () => {
  // States for Agency Type
  const [agencyType, setAgencyType] = useState("");
  const [agencyLoading, setAgencyLoading] = useState(false);
  const [agencyFeedback, setAgencyFeedback] = useState({ error: "", success: "" });

  // States for Emergency Type
  const [emergencyType, setEmergencyType] = useState("");
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencyFeedback, setEmergencyFeedback] = useState({ error: "", success: "" });

  const handlePost = async (endpoint, value, setter, setLoader, setFeedback, successMsg) => {
    if (!value.trim()) return;
    setLoader(true);
    setFeedback({ error: "", success: "" });

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/${endpoint}`,
        { name: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFeedback({ error: "", success: successMsg });
      setter(""); // Clear the specific input
    } catch (err) {
      setFeedback({ error: err.response?.data?.message || err.message, success: "" });
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="w-full bg-white rounded-3xl shadow-2xl p-8 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">System Settings</h1>
          <p className="text-gray-500">Configure global classification types for the tactical network.</p>
        </div>

        {/* --- ADD AGENCY TYPE SECTION --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-blue-600 rounded-full" />
            <h2 className="text-xl font-semibold text-gray-800">Agency Classification</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g., Police, Fire Department, Medical"
              value={agencyType}
              onChange={(e) => setAgencyType(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-blue-50 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm transition-all"
            />
            <button
              onClick={() => handlePost("agencyType", agencyType, setAgencyType, setAgencyLoading, setAgencyFeedback, "Agency type created!")}
              disabled={agencyLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-lg transform active:scale-95 transition-all disabled:opacity-50"
            >
              {agencyLoading ? "Processing..." : "Add Agency"}
            </button>
          </div>
          {agencyFeedback.error && <p className="text-red-500 text-sm font-medium">{agencyFeedback.error}</p>}
          {agencyFeedback.success && <p className="text-green-600 text-sm font-medium">{agencyFeedback.success}</p>}
        </section>

        <hr className="border-gray-100" />

        {/* --- ADD EMERGENCY TYPE SECTION --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-red-500 rounded-full" />
            <h2 className="text-xl font-semibold text-gray-800">Emergency Categories</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g., Fire, Road Accident, Armed Robbery"
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-red-50 text-gray-700 focus:ring-2 focus:ring-red-400 focus:outline-none shadow-sm transition-all"
            />
            <button
              onClick={() => handlePost("emergencyType", emergencyType, setEmergencyType, setEmergencyLoading, setEmergencyFeedback, "Emergency category added!")}
              disabled={emergencyLoading}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-2xl hover:shadow-lg transform active:scale-95 transition-all disabled:opacity-50"
            >
              {emergencyLoading ? "Processing..." : "Add Category"}
            </button>
          </div>
          {emergencyFeedback.error && <p className="text-red-500 text-sm font-medium">{emergencyFeedback.error}</p>}
          {emergencyFeedback.success && <p className="text-green-600 text-sm font-medium">{emergencyFeedback.success}</p>}
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;