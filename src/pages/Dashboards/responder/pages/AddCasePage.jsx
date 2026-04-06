import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

const AddCasePage = ({ onClose, onSaved }) => {
  const [newCase, setNewCase] = useState({
    incidentType: "",
    location: "",
    fullName: "",
    age: "",
    gender: "",
    description: "",
    lastSeenLocation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api/cases";

  const handleAddCase = async (e) => {
    e.preventDefault();
    if (!newCase.incidentType || !newCase.location) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(API_URL, newCase);
      onSaved(res.data);
      onClose();
      setNewCase({
        incidentType: "",
        location: "",
        fullName: "",
        age: "",
        gender: "",
        description: "",
        lastSeenLocation: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add case");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full w-1/2 bg-white shadow-2xl z-50 p-6 overflow-y-auto transition-transform transform translate-x-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add New Case</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleAddCase} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Incident Type"
          value={newCase.incidentType}
          onChange={(e) =>
            setNewCase({ ...newCase, incidentType: e.target.value })
          }
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="text"
          placeholder="Location"
          value={newCase.location}
          onChange={(e) => setNewCase({ ...newCase, location: e.target.value })}
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="text"
          placeholder="Full Name"
          value={newCase.fullName}
          onChange={(e) => setNewCase({ ...newCase, fullName: e.target.value })}
          className="p-3 border border-gray-300 rounded"
        />
        <input
          type="number"
          placeholder="Age"
          value={newCase.age}
          onChange={(e) => setNewCase({ ...newCase, age: e.target.value })}
          className="p-3 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Gender"
          value={newCase.gender}
          onChange={(e) => setNewCase({ ...newCase, gender: e.target.value })}
          className="p-3 border border-gray-300 rounded"
        />
        <textarea
          placeholder="Description"
          value={newCase.description}
          onChange={(e) =>
            setNewCase({ ...newCase, description: e.target.value })
          }
          className="p-3 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Last Seen Location"
          value={newCase.lastSeenLocation}
          onChange={(e) =>
            setNewCase({ ...newCase, lastSeenLocation: e.target.value })
          }
          className="p-3 border border-gray-300 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {loading ? "Saving..." : "Save Case"}
        </button>
      </form>
    </div>
  );
};

export default AddCasePage;
