import React, { useState, useEffect } from "react";
import { FileText, Plus } from "lucide-react";
import axios from "axios";
import AddCasePage from "./AddCasePage"; // sliding panel

const ResponderCasesPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const API_URL = "http://localhost:5000/api/cases";

  // Fetch all cases from backend
  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setCases(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Callback when a new case is added
  const handleNewCaseSaved = (newCase) => {
    setCases([newCase, ...cases]); // add to top of the table
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen relative">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-700 w-6 h-6" />
          <h1 className="text-2xl font-bold text-gray-800">Cases</h1>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Case
        </button>
      </div>

      {/* Cases Table */}
      <div className="bg-white shadow-md rounded-xl p-6">
        {loading ? (
          <p>Loading cases...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-3 border-b">Case ID</th>
                  <th className="p-3 border-b">Incident Type</th>
                  <th className="p-3 border-b">Location</th>
                  <th className="p-3 border-b">Status</th>
                  <th className="p-3 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No cases found
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50">
                      <td className="p-3 border-b">{c.id}</td>
                      <td className="p-3 border-b">
                        {c.incidentType || c.caseType?.name}
                      </td>
                      <td className="p-3 border-b">
                        {c.location || c.lastSeenLocation}
                      </td>
                      <td
                        className={`p-3 border-b font-bold ${
                          c.status === "approved"
                            ? "text-green-600"
                            : c.status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {c.status || "Pending"}
                      </td>
                      <td className="p-3 border-b">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sliding AddCasePage */}
      {showForm && (
        <AddCasePage
          onClose={() => setShowForm(false)}
          onSaved={handleNewCaseSaved}
        />
      )}
    </div>
  );
};

export default ResponderCasesPage;
