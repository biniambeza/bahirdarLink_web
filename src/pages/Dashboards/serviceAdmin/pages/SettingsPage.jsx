import { useState, useEffect } from "react";
import axios from "axios";

const SettingsPage = () => {
  const [token] = useState(localStorage.getItem("token"));

  // --- SERVICE TYPE STATES ---
  const [newType, setNewType] = useState("");
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // --- AGENCY TYPE STATES ---
  const [newAgencyType, setNewAgencyType] = useState("");
  const [agencyTypes, setAgencyTypes] = useState([]);
  const [agencyLoading, setAgencyLoading] = useState(false);
  const [agencyListLoading, setAgencyListLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- FETCH LOGIC ---
  const fetchServiceTypes = async () => {
    setListLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/serviceType", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServiceTypes(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch service types:", err);
    } finally {
      setListLoading(false);
    }
  };

  const fetchAgencyTypes = async () => {
    setAgencyListLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/agencyType/my-agents",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAgencyTypes(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch agency types:", err);
    } finally {
      setAgencyListLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchServiceTypes();
      fetchAgencyTypes();
    }
  }, [token]);

  // --- POST LOGIC ---
  const handleAddType = async (
    endpoint,
    value,
    setter,
    setLoader,
    refreshFn,
    typeLabel,
  ) => {
    if (!value.trim()) return;

    setLoader(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(
        `http://localhost:5000/api/${endpoint}`,
        { name: value },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSuccess(`${typeLabel} created successfully!`);
      setter(""); // Clear the specific input
      refreshFn(); // Refresh the specific list
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            System Settings
          </h1>
          <p className="text-gray-500">
            Manage classification and system configurations.
          </p>
        </div>

        {/* --- SERVICE TYPES SECTION --- */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
            Service Types
          </h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. Electric Utility"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-blue-50 border-none focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button
              onClick={() =>
                handleAddType(
                  "serviceType",
                  newType,
                  setNewType,
                  setLoading,
                  fetchServiceTypes,
                  "Service type",
                )
              }
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-2xl disabled:opacity-50"
            >
              {loading ? "Creating..." : "Add"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listLoading ? (
              <p className="text-gray-400 animate-pulse">Loading...</p>
            ) : (
              serviceTypes.map((type) => (
                <div
                  key={type._id || type.id}
                  className="p-3 bg-gray-50 border rounded-2xl text-gray-700 flex items-center"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  {type.name}
                </div>
              ))
            )}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* --- AGENCY TYPES SECTION --- */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-l-4 border-indigo-500 pl-3">
            Agency Types (My Agents)
          </h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. Tactical Unit"
              value={newAgencyType}
              onChange={(e) => setNewAgencyType(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-indigo-50 border-none focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <button
              onClick={() =>
                handleAddType(
                  "agencyType",
                  newAgencyType,
                  setNewAgencyType,
                  setAgencyLoading,
                  fetchAgencyTypes,
                  "Agency type",
                )
              }
              disabled={agencyLoading}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-2xl disabled:opacity-50"
            >
              {agencyLoading ? "Creating..." : "Add"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agencyListLoading ? (
              <p className="text-gray-400 animate-pulse">Loading...</p>
            ) : (
              agencyTypes.map((type) => (
                <div
                  key={type.id || type._id}
                  className="p-3 bg-gray-50 border rounded-2xl text-gray-700 flex items-center"
                >
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                  {type.name}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Notifications */}
        <div className="fixed bottom-6 right-6 space-y-2">
          {error && (
            <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
