import { useState, useEffect } from "react";
import axios from "axios";

const SettingsPage = () => {
  // --- AGENCY TYPE STATES ---
  const [agencyTypeInput, setAgencyTypeInput] = useState("");
  const [agencyTypeList, setAgencyTypeList] = useState([]); // State name is agencyTypeList
  const [agencyLoading, setAgencyLoading] = useState(false);

  // --- EMERGENCY TYPE STATES ---
  const [emergencyTypeInput, setEmergencyTypeInput] = useState("");
  const [emergencyTypeList, setEmergencyTypeList] = useState([]);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  // --- 1. FETCH LOGIC ---
  const fetchAgencyTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found in localStorage");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/agencyType/my-agents",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // FIXED: Changed setAgencyTypes to setAgencyTypeList to match your state
      if (response.data.success) {
        setAgencyTypeList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching agency types:", error);
    }
  };

  const fetchEmergencyTypes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/emergencyType");
      // Use logical OR to ensure we always set an array
      setEmergencyTypeList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching emergency types:", err);
    }
  };

  useEffect(() => {
    fetchAgencyTypes();
    fetchEmergencyTypes();
  }, []);

  // --- 2. POST LOGIC ---
  const handlePost = async (endpoint, value, setter, setLoader, refreshFn) => {
    if (!value.trim()) return;
    setLoader(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/${endpoint}`,
        { name: value },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setter(""); // Clear input
      refreshFn(); // Re-fetch the specific list (this calls fetchAgencyTypes/fetchEmergencyTypes)
    } catch (err) {
      console.error("Post Error:", err);
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Classification Settings
        </h1>

        {/* --- AGENCY TYPES SECTION --- */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Agency Types
          </h2>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Add Agency Type (e.g., Tactical, Medical)"
              value={agencyTypeInput}
              onChange={(e) => setAgencyTypeInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-50 border focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button
              onClick={() =>
                handlePost(
                  "agencyType",
                  agencyTypeInput,
                  setAgencyTypeInput,
                  setAgencyLoading,
                  fetchAgencyTypes, // This passes the function to re-fetch after saving
                )
              }
              disabled={agencyLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {agencyLoading ? "Saving..." : "Add Type"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {agencyTypeList.length > 0 ? (
              agencyTypeList.map((item) => (
                <span
                  key={item.id}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100"
                >
                  {item.name}
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No agency types found.</p>
            )}
          </div>
        </section>

        {/* --- EMERGENCY TYPES SECTION --- */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Emergency Types
          </h2>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Add Emergency Type (e.g., Critical, Routine)"
              value={emergencyTypeInput}
              onChange={(e) => setEmergencyTypeInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-50 border focus:ring-2 focus:ring-red-400 outline-none"
            />
            <button
              onClick={() =>
                handlePost(
                  "emergencyType",
                  emergencyTypeInput,
                  setEmergencyTypeInput,
                  setEmergencyLoading,
                  fetchEmergencyTypes,
                )
              }
              disabled={emergencyLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {emergencyLoading ? "Saving..." : "Add Type"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {emergencyTypeList.length > 0 ? (
              emergencyTypeList.map((item) => (
                <span
                  key={item.id}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-semibold border border-red-100"
                >
                  {item.name}
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No emergency types found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
