import React, { useState, useEffect } from "react";
import { Plus, Users, MapPin, ShieldCheck, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddResponseTeamDrawer from "./AddResponseTeamPage";

// Utility to extract Agency ID from JWT
const getLoggedAgencyId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Adjust this key if your token stores the agency ID under a different property
    return payload.id;
  } catch (err) {
    console.error("Token Error:", err);
    return null;
  }
};

const ResponseTeamPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [agencyId, setAgencyId] = useState(null);

  useEffect(() => {
    setAgencyId(getLoggedAgencyId());
  }, []);

  const fetchTeams = async () => {
    if (!agencyId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/responderTeam/agency/${agencyId}`,
      );
      const data = await res.json();
      setTeams(data.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [agencyId]);

  const handleAddTeam = (newTeam) => {
    // Option 1: Optimistic update
    // setTeams((prev) => [newTeam, ...prev]);

    // Option 2: Re-fetch to ensure all associations (kebeles) are loaded correctly
    fetchTeams();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              Response Teams
            </h1>
            <p className="text-slate-500 mt-1">
              Directory of all emergency response units and their coverage areas
            </p>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 shadow-md shadow-slate-200"
          >
            <Plus className="w-5 h-5" />
            New Team
          </button>
        </header>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Team Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Service Areas (Kebeles)
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <TableSkeleton />
                ) : teams.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Users className="w-10 h-10 mb-2" />
                        <p className="font-medium text-lg">
                          No response teams found.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {teams.map((team) => (
                      <TeamRow key={team.id} team={team} />
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drawer Component */}
      <AddResponseTeamDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleAddTeam}
        agencyId={agencyId}
      />

      {/* Overlay backdrop */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const TeamRow = ({ team }) => {
  const isActive = team.status?.toLowerCase() === "active";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group hover:bg-slate-50/80 transition-colors cursor-default"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
            {team.name ? team.name.charAt(0).toUpperCase() : "T"}
          </div>
          <span className="font-semibold text-slate-700">{team.name}</span>
        </div>
      </td>

      <td className="px-6 py-4">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
            isActive
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
          />
          {team.status?.toUpperCase() || "INACTIVE"}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1.5 items-center max-w-sm">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {team.kebeles && team.kebeles.length > 0 ? (
            team.kebeles.map((kebele) => (
              <span
                key={kebele.id}
                className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-medium"
              >
                {kebele.name}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400 italic">
              No areas assigned
            </span>
          )}
        </div>
      </td>

      <td className="px-6 py-4 text-right">
        <button className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
          <ExternalLink className="w-4 h-4" />
        </button>
      </td>
    </motion.tr>
  );
};

const TableSkeleton = () => (
  <>
    {[1, 2, 3].map((i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-100 rounded-full" />
            <div className="h-4 w-32 bg-slate-100 rounded" />
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="h-6 w-20 bg-slate-50 rounded-md" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 w-48 bg-slate-50 rounded" />
        </td>
        <td className="px-6 py-4">
          <div className="h-8 w-8 bg-slate-50 rounded ml-auto" />
        </td>
      </tr>
    ))}
  </>
);

export default ResponseTeamPage;
