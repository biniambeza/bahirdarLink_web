import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  AlertTriangle,
  Car,
  Clock,
  CheckCircle,
  Activity,
  Shield,
  Loader2,
  RefreshCw,
  Radio,
  MapPin,
  ChevronRight,
  Calendar,
  Layers,
  Bell,
  TrendingUp,
  X,
  HardHat,
  Wrench,
  ClipboardCheck,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import IncidentDetails from "./IncidentDetailPage";

const API_BASE_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const COLORS = {
  primary: "#0052CC",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  slate: "#64748b",
};

const getEnglish = (val) => {
  if (!val) return "—";
  if (typeof val === "object") return val.en || val.name?.en || "—";
  return String(val);
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const socketRef = useRef();

  const [data, setData] = useState({
    stats: [],
    incidents: [],
    units: [],
    totalUnits: 0,
    categories: [],
  });

  const uiFlavor = useMemo(() => {
    const storedAgency = JSON.parse(localStorage.getItem("agency") || "{}");
    const type = (
      getEnglish(storedAgency?.agencyType?.name) || ""
    ).toLowerCase();

    const isService = [
      "municipal",
      "electric utility",
      "water utility",
      "Health Service",
    ].some((t) => type.includes(t));

    return {
      isService,
      title: isService ? "Operational Command" : "Tactical Overview",
      mainStatLabel: isService ? "Active Requests" : "Active Emergencies",
      teamLabel: isService ? "Field Crews" : "Response Teams",
      logLabel: isService ? "Service Request Log" : "Dispatch Log",
      accentColor: isService
        ? "from-emerald-500 to-teal-600"
        : "from-rose-500 to-red-600",
      mainIcon: isService ? Wrench : AlertTriangle,
      statusReady: isService ? "Operational" : "Encrypted Link",
    };
  }, []);

  const fetchDashboardData = useCallback(
    async (isInitial = false) => {
      const token = localStorage.getItem("token");
      const storedAgency = JSON.parse(localStorage.getItem("agency") || "{}");
      setAgencyInfo(storedAgency);

      if (!storedAgency.id) return;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isInitial) setLoading(true);
      else setIsSyncing(true);

      try {
        const dataUrl = uiFlavor.isService
          ? `${API_BASE_URL}/service/agency/${storedAgency.id}`
          : `${API_BASE_URL}/emergencies/agency/${storedAgency.id}/emergencies`;

        // Try plural first, fallback logic handles the rest
        const categoryUrl = uiFlavor.isService
          ? `${API_BASE_URL}/serviceCategories`
          : `${API_BASE_URL}/categories`;

        // Use .catch on individual requests to prevent a 500 from stopping the whole dashboard
        const [dataRes, teamRes, catRes] = await Promise.all([
          axios.get(dataUrl, config),
          axios.get(
            `${API_BASE_URL}/responderTeam/agency/${storedAgency.id}`,
            config,
          ),
          axios.get(categoryUrl, config).catch((err) => {
            console.warn(
              "Category fetch failed, using empty list:",
              err.message,
            );
            return { data: { data: [], services: [] } };
          }),
        ]);

        let allItems = [];
        const responseBody = dataRes.data;

        // Handle the "services" key or "data" key dynamically
        if (responseBody.services && Array.isArray(responseBody.services)) {
          allItems = responseBody.services;
        } else if (responseBody.data && Array.isArray(responseBody.data)) {
          allItems = responseBody.data;
        } else if (Array.isArray(responseBody)) {
          allItems = responseBody;
        }

        const allTeams = teamRes.data.data || [];
        const allCategories =
          catRes.data.data || catRes.data?.categories || catRes.data || [];

        const activeCount = allItems.filter(
          (item) =>
            !["resolved", "completed", "fixed", "closed"].includes(
              getEnglish(item.status).toLowerCase(),
            ),
        ).length;

        setData({
          stats: [
            {
              title: uiFlavor.isService
                ? "Total Service Calls"
                : "Total Incidents",
              value: allItems.length,
              icon: Activity,
              color: "from-blue-600 to-cyan-500",
            },
            {
              title: uiFlavor.mainStatLabel,
              value: activeCount,
              icon: uiFlavor.mainIcon,
              color: uiFlavor.accentColor,
            },
            {
              title: uiFlavor.teamLabel,
              value: allTeams.length,
              icon: uiFlavor.isService ? HardHat : Car,
              color: "from-indigo-500 to-purple-600",
            },
            {
              title: uiFlavor.isService ? "Tasks Completed" : "Cases Resolved",
              value: allItems.length - activeCount,
              icon: uiFlavor.isService ? ClipboardCheck : CheckCircle,
              color: "from-emerald-400 to-teal-600",
            },
          ],
          incidents: allItems.slice(0, 6).map((item) => ({
            id: item._id || item.id,
            category: getEnglish(
              item.serviceCategory?.name ||
                item.categoryId?.name ||
                item.category?.name ||
                "General",
            ),
            type: getEnglish(
              item.serviceType?.name ||
                item.emergencyType?.name ||
                item.requestType ||
                (uiFlavor.isService ? "Service Request" : "Emergency"),
            ),
            location:
              getEnglish(item.kebele) !== "—"
                ? `${getEnglish(item.kebele)} • ${getEnglish(item.street)}`
                : "Area Assigned",
            time: new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: getEnglish(item.status),
            raw: item,
          })),
          units: [
            {
              name: "Available",
              value: allTeams.filter((t) => t.status === "available").length,
              color: COLORS.success,
            },
            {
              name: "Busy",
              value: allTeams.filter((t) => t.status === "busy").length,
              color: COLORS.danger,
            },
            {
              name: "Offline",
              value: allTeams.filter((t) => t.status === "offline").length,
              color: COLORS.warning,
            },
          ],
          totalUnits: allTeams.length,
          categories: allCategories,
        });
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    },
    [uiFlavor],
  );

  useEffect(() => {
    fetchDashboardData(true);
    const token = localStorage.getItem("token");
    socketRef.current = io(SOCKET_URL, { auth: { token: `Bearer ${token}` } });
    const eventName = uiFlavor.isService ? "newServiceRequest" : "newEmergency";
    socketRef.current.on(eventName, () => fetchDashboardData());
    return () => socketRef.current.disconnect();
  }, [fetchDashboardData, uiFlavor.isService]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F4F7FE]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Loader2 className="text-blue-600" size={48} />
        </motion.div>
        <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">
          Synchronizing {uiFlavor.title}...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-4 lg:p-8 font-sans text-slate-900 relative overflow-x-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div
            className={`flex items-center gap-2 ${uiFlavor.isService ? "text-emerald-600" : "text-blue-600"} mb-1`}
          >
            {uiFlavor.isService ? <Zap size={18} /> : <Shield size={18} />}
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">
              {uiFlavor.title}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            {getEnglish(agencyInfo?.name)}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Network
            </p>
            <div
              className={`flex items-center gap-1.5 font-bold text-sm ${uiFlavor.isService ? "text-emerald-500" : "text-blue-500"}`}
            >
              <div
                className={`h-2 w-2 rounded-full animate-pulse ${uiFlavor.isService ? "bg-emerald-500" : "bg-blue-500"}`}
              />
              {uiFlavor.statusReady}
            </div>
          </div>
          <button
            onClick={() => fetchDashboardData()}
            className="group flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-blue-900/5 hover:border-blue-300 transition-all active:scale-95"
          >
            <RefreshCw
              size={18}
              className={`${isSyncing ? "animate-spin text-blue-600" : "text-slate-500 group-hover:text-blue-600"}`}
            />
            <span className="font-black text-xs text-slate-700 tracking-widest uppercase">
              Sync Hub
            </span>
          </button>
        </div>
      </header>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {data.stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-5 group"
          >
            <div
              className={`p-4 rounded-3xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform`}
            >
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-0.5">
                {stat.title}
              </p>
              <h2 className="text-3xl font-black text-slate-800">
                {stat.value}
              </h2>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LOG PANEL */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase text-sm tracking-widest">
              <span
                className={`h-6 w-1 ${uiFlavor.isService ? "bg-emerald-500" : "bg-blue-600"} rounded-full`}
              />
              {uiFlavor.logLabel}
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-white border rounded-lg text-[10px] font-black text-slate-500 uppercase">
              <Clock size={12} /> Live Streams
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {data.incidents.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 font-bold italic text-sm">
                    No activity recorded for this sector.
                  </p>
                </div>
              ) : (
                data.incidents.map((inc) => (
                  <motion.div
                    key={inc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedIncident(inc.raw)}
                    className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-md hover:border-blue-400 cursor-pointer transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-5">
                      <div
                        className={`p-4 rounded-2xl transition-colors ${uiFlavor.isService ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"}`}
                      >
                        {uiFlavor.isService ? (
                          <Wrench size={24} />
                        ) : (
                          <Radio size={24} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xl font-black text-slate-800 leading-none">
                            {inc.type}
                          </h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 border ${uiFlavor.isService ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}
                          >
                            <Layers size={10} /> {inc.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 font-bold text-xs">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {inc.location}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {inc.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${["pending", "ongoing", "reported", "dispatched"].includes(inc.status?.toLowerCase()) ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}
                      >
                        {inc.status}
                      </div>
                      <button className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ANALYTICS ASIDE */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
            <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest mb-8 flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-600" />{" "}
              {uiFlavor.teamLabel} Status
            </h3>
            <div className="h-[200px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.units}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {data.units.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-3xl font-black text-slate-800 leading-none">
                  {data.totalUnits}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-1">
                  Units
                </p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {data.units.map((u) => (
                <div
                  key={u.name}
                  className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl transition-all hover:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: u.color }}
                    />
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      {u.name}
                    </span>
                  </div>
                  <span className="text-lg font-black text-slate-800">
                    {u.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="bg-blue-600/20 p-3 rounded-2xl w-fit mb-4">
                <Bell size={24} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-black mb-2">Protocol Active</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                System monitoring current{" "}
                {uiFlavor.isService
                  ? "infrastructure status"
                  : "sector incidents"}
                .
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-10">
              {uiFlavor.isService ? (
                <HardHat size={120} />
              ) : (
                <Shield size={120} />
              )}
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {selectedIncident && (
          <IncidentDetails
            incident={selectedIncident}
            categories={data.categories}
            onClose={() => setSelectedIncident(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
