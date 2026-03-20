import React, { useState, useEffect } from "react";
import AddResponseTeamDrawer from "./AddResponseTeamPage";

// Utility: Get logged-in agency ID from JWT stored in localStorage
const getLoggedAgencyId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id; // agency ID from JWT
  } catch (err) {
    console.error("Failed to get agency ID from token:", err);
    return null;
  }
};

const ResponseTeamPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [agencyId, setAgencyId] = useState(null);

  useEffect(() => {
    const id = getLoggedAgencyId();
    setAgencyId(id);
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!agencyId) return;
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/responderTeam/agency/${agencyId}`,
        );
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data = await res.json();
        setTeams(data.data || []);
      } catch (err) {
        console.error(err);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [agencyId]);

  const handleAddTeam = (newTeam) => {
    setTeams((prev) => [newTeam, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800">
          Response Teams
        </h2>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold shadow-lg hover:scale-105 transition transform duration-300"
        >
          + Add Response Team
        </button>
      </div>

      {/* Teams Table */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <table className="w-full min-w-[600px] text-left">
          <thead className="bg-gradient-to-r from-blue-100 to-cyan-100 text-gray-700">
            <tr>
              <th className="p-4">No</th>
              <th className="p-4">Name</th>
              <th className="p-4">Status</th>
              <th className="p-4">Kebeles</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : teams.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No response teams found.
                </td>
              </tr>
            ) : (
              teams.map((team, index) => (
                <tr
                  key={team.id}
                  className="transition transform hover:scale-[1.01] hover:shadow-lg rounded-xl bg-gray-50 even:bg-white mb-2"
                  style={{ display: "table-row", borderSpacing: "0 8px" }}
                >
                  {/* Row number */}
                  <td className="p-4 font-medium">{index + 1}</td>
                  <td className="p-4">{team.name}</td>
                  <td
                    className={`p-4 font-semibold ${
                      team.status === "active"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                  </td>
                  <td className="p-4">
                    {team.kebeles && team.kebeles.length > 0
                      ? team.kebeles.join(", ")
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {agencyId && (
        <AddResponseTeamDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSave={handleAddTeam}
          agencyId={agencyId}
        />
      )}

      {/* Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default ResponseTeamPage;
