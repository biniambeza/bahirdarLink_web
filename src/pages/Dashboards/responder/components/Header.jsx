import React, { useState, useEffect } from "react";
import { Bell, Menu, Search, User, Loader2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

const ResponderHeader = ({ sidebarOpen, setSidebarOpen, active }) => {
  const [isServiceMode, setIsServiceMode] = useState(false);
  const [agencyName, setAgencyName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const responderTeamId = decoded.id;

        const teamRes = await axios.get(
          `${BASE_URL}/api/responderTeam/${responderTeamId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const agencyId = teamRes.data?.data?.agencyId || teamRes.data?.agencyId;

        const agencyRes = await axios.get(
          `${BASE_URL}/api/agency/${agencyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const rawName =
          agencyRes.data?.data?.name ||
          agencyRes.data?.name ||
          "Responder Unit";
        setAgencyName(rawName);

        const serviceKeywords = [
          "municipal",
          "electric",
          "water",
          "health",
          "utility",
          "medical",
          "service",
        ];
        setIsServiceMode(
          serviceKeywords.some((kw) => rawName.toLowerCase().includes(kw)),
        );
      } catch (error) {
        console.error("Header Data Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderData();
  }, []);

  return (
    <header className="h-24 bg-gradient-to-r from-blue-700 to-blue-900 px-8 flex items-center justify-between shadow-lg">
      {/* LEFT */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:scale-110 transition-transform"
        >
          <Menu size={26} />
        </button>

        <div>
          <h1 className="text-white text-2xl font-black capitalize tracking-tight">
            {/* If it's Service Mode and we are on the 'incidents' tab, show 'Tasks' */}
            {isServiceMode && active === "incidents" ? "Tasks" : active}
          </h1>
          <p className="text-blue-200 text-sm">
            {isServiceMode
              ? "Service Control Center ⚡"
              : "Emergency Control Center 🚑"}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        {/* SEARCH */}
        <div className="hidden md:flex relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
            size={18}
          />
          <input
            type="text"
            placeholder={
              isServiceMode ? "Search tasks..." : "Search emergencies..."
            }
            className="bg-white/10 border border-white/20 rounded-full pl-12 pr-5 py-2 text-white placeholder:text-white/50 text-sm outline-none w-64 focus:w-80 focus:bg-white/20 transition-all"
          />
        </div>

        {/* NOTIFICATIONS */}
        <button className="relative p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-5 h-5 bg-yellow-400 text-black rounded-full text-[10px] flex items-center justify-center font-bold">
            5
          </span>
        </button>

        {/* USER PROFILE */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            {loading ? (
              <Loader2 size={16} className="text-white animate-spin" />
            ) : (
              <User className="text-white" size={18} />
            )}
          </div>

          <div className="hidden md:block text-white">
            <p className="text-sm font-bold truncate max-w-[150px]">
              {agencyName}
            </p>
            <p className="text-xs text-blue-200">
              {isServiceMode ? "Service Unit" : "Emergency Unit"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ResponderHeader;
