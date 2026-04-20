import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import axios from "axios";

const CrewMissionsPage = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("crewToken");

        if (!token) {
          setError("No token found");
          return;
        }

        const decoded = jwtDecode(token);
        const crewId = decoded.id;

        const response = await axios.get(
          `http://localhost:5000/api/emergencies/crew/${crewId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMissions(response.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load missions");
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("crewToken");

      await axios.patch(
        `http://localhost:5000/api/emergencies/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // update UI instantly
      setMissions((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status: newStatus } : m
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-4">My Missions</h1>

      {/* STATES */}
      {loading ? (
        <p className="text-gray-500">Loading missions...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : missions.length === 0 ? (
        <p className="text-gray-500">No missions assigned yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm text-left">
            {/* HEADER */}
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Description</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {missions.map((m, index) => (
                <tr key={m.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{index + 1}</td>

                  <td className="p-3 font-semibold">
                    {m.emergencyType?.name || "Unknown"}
                  </td>

                  <td className="p-3">{m.category?.name || "-"}</td>

                  <td className="p-3 text-gray-600">
                    {m.kebele?.name || "Unknown"}, {m.subdivision}
                  </td>

                  <td className="p-3 max-w-[200px] truncate">
                    {m.description || "-"}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        m.status
                      )}`}
                    >
                      {m.status}
                    </span>
                  </td>

                  <td className="p-3 text-gray-500">
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleString()
                      : "-"}
                  </td>

                  {/* 🚑 ACTIONS */}
                  <td className="p-3 space-x-2">
                    {m.status === "pending" && (
                      <button
                        onClick={() =>
                          updateStatus(m.id, "in-progress")
                        }
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Start
                      </button>
                    )}

                    {m.status === "in-progress" && (
                      <button
                        onClick={() =>
                          updateStatus(m.id, "resolved")
                        }
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CrewMissionsPage;