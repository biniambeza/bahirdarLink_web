import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import axios from "axios";

const ResponderIncidentsPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("responderToken");

        if (!token) {
          setError("No token found");
          return;
        }

        const decoded = jwtDecode(token);
        const responderTeamId = decoded.id;

        const response = await axios.get(
          `http://localhost:5000/api/emergencies/responder-team/${responderTeamId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setEmergencies(response.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load emergencies");
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencies();
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

  return (
    <div className="p-6">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-4">Responder Dashboard</h1>

      {/* STATES */}
      {loading ? (
        <p className="text-gray-500">Loading emergencies...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : emergencies.length === 0 ? (
        <p className="text-gray-500">No emergencies assigned yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm text-left">
            {/* HEADER */}
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Description</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Media</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {emergencies.map((e, index) => (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{index + 1}</td>

                  <td className="p-3 font-semibold">
                    {e.emergencyType?.name || "Unknown"}
                  </td>

                  <td className="p-3">{e.category?.name || "-"}</td>

                  <td className="p-3 text-gray-600">
                    {e.kebele?.name || "Unknown"}, {e.subdivision}
                  </td>

                  <td className="p-3 text-gray-600 max-w-[200px] truncate">
                    {e.description || "-"}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        e.status,
                      )}`}
                    >
                      {e.status}
                    </span>
                  </td>

                  <td className="p-3 text-gray-500">
                    {e.createdAt ? new Date(e.createdAt).toLocaleString() : "-"}
                  </td>

                  <td className="p-3">
                    {e.mediaUrl ? (
                      <img
                        src={`http://localhost:5000${e.mediaUrl}`}
                        alt="media"
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      "-"
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

export default ResponderIncidentsPage;
