// import React, { useState, useEffect, useMemo } from "react";
// import { jwtDecode } from "jwt-decode";
// import axios from "axios";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   Cell,
//   CartesianGrid,
// } from "recharts";
// import {
//   Activity,
//   CheckCircle,
//   Bell,
//   Plus,
//   MapPin,
//   Zap,
//   FolderLock,
//   Search,
//   Target,
//   Award,
//   TrendingUp,
//   MoreHorizontal,
// } from "lucide-react";

// const BASE_URL = "http://localhost:5000";

// const ResponderDashboardPage = () => {
//   const [emergencies, setEmergencies] = useState([]);
//   const [cases, setCases] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [teamId, setTeamId] = useState(null);

//   // 1. Unified Data Fetching
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setLoading(false);
//           return;
//         }

//         const decoded = jwtDecode(token);
//         const responderTeamId = decoded.id;
//         setTeamId(responderTeamId);

//         const config = {
//           headers: { Authorization: `Bearer ${token}` },
//         };

//         const [emergRes, casesRes] = await Promise.all([
//           axios.get(
//             `${BASE_URL}/api/emergencies/responder-team/${responderTeamId}`,
//             config,
//           ),
//           axios.get(`${BASE_URL}/api/cases/team/all`, config),
//         ]);

//         setEmergencies(emergRes.data?.data || []);
//         setCases(casesRes.data?.data || casesRes.data || []);
//       } catch (error) {
//         console.error("Dashboard Sync Error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   // 2. Data Processing & Performance Metrics
//   const { emergencyChart, caseChart, dynamicStats, performance } =
//     useMemo(() => {
//       const eCounts = {
//         reported: emergencies.filter(
//           (e) => e.status?.toLowerCase() === "reported",
//         ).length,
//         active: emergencies.filter(
//           (e) => e.status?.toLowerCase() === "in_progress",
//         ).length,
//         resolved: emergencies.filter(
//           (e) => e.status?.toLowerCase() === "resolved",
//         ).length,
//       };

//       const cCounts = {
//         open: cases.filter((c) => c.status?.toLowerCase() === "open").length,
//         pending: cases.filter((c) => c.status?.toLowerCase() === "pending")
//           .length,
//         closed: cases.filter((c) => c.status?.toLowerCase() === "closed")
//           .length,
//       };

//       const totalItems = emergencies.length + cases.length;
//       const totalResolved = eCounts.resolved + cCounts.closed;
//       const successRate =
//         totalItems > 0 ? Math.round((totalResolved / totalItems) * 100) : 0;

//       const stats = [
//         {
//           title: "Live Incidents",
//           value: emergencies.length,
//           icon: Activity,
//           color: "text-rose-600",
//           bg: "bg-rose-50/50",
//         },
//         {
//           title: "Total Cases",
//           value: cases.length,
//           icon: FolderLock,
//           color: "text-blue-600",
//           bg: "bg-blue-50/50",
//         },
//         {
//           title: "Field Load",
//           value: eCounts.active + cCounts.pending,
//           icon: Zap,
//           color: "text-amber-600",
//           bg: "bg-amber-50/50",
//         },
//         {
//           title: "Cleared",
//           value: totalResolved,
//           icon: CheckCircle,
//           color: "text-emerald-600",
//           bg: "bg-emerald-50/50",
//         },
//       ];

//       return {
//         emergencyChart: [
//           { name: "Reported", value: eCounts.reported, color: "#e11d48" },
//           { name: "Active", value: eCounts.active, color: "#f59e0b" },
//           { name: "Resolved", value: eCounts.resolved, color: "#10b981" },
//         ],
//         caseChart: [
//           { name: "Open", value: cCounts.open, color: "#3b82f6" },
//           { name: "Pending", value: cCounts.pending, color: "#8b5cf6" },
//           { name: "Closed", value: cCounts.closed, color: "#64748b" },
//         ],
//         dynamicStats: stats,
//         performance: {
//           successRate,
//           eRate:
//             emergencies.length > 0
//               ? Math.round((eCounts.resolved / emergencies.length) * 100)
//               : 0,
//           cRate:
//             cases.length > 0
//               ? Math.round((cCounts.closed / cases.length) * 100)
//               : 0,
//           label:
//             successRate > 75
//               ? "Elite"
//               : successRate > 40
//                 ? "Steady"
//                 : "Critical Load",
//         },
//       };
//     }, [emergencies, cases]);

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <Zap className="animate-bounce text-blue-600" size={40} />
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-12 font-sans">
//       <div className="max-w-[1500px] mx-auto p-4 md:p-8">
//         {/* Header */}
//         <header className="flex justify-between items-center mb-10">
//           <div>
//             <h1 className="text-2xl font-black tracking-tight uppercase">
//               Bahir<span className="text-blue-600">Link</span> HQ
//             </h1>
//             <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">
//               Unit ID: {teamId || "Sector Main"}
//             </p>
//           </div>
//           <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
//             <Bell size={20} className="text-slate-400" />
//           </div>
//         </header>

//         {/* Top Stats Grid */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
//           {dynamicStats.map((stat, idx) => (
//             <div
//               key={idx}
//               className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm"
//             >
//               <div
//                 className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}
//               >
//                 <stat.icon size={22} />
//               </div>
//               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//                 {stat.title}
//               </p>
//               <h3 className="text-3xl font-black text-slate-900 mt-1">
//                 {stat.value}
//               </h3>
//             </div>
//           ))}
//         </div>

//         {/* Charts Row */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {/* Incident Load Chart */}
//           <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
//             <h2 className="text-xs font-black uppercase tracking-widest mb-8 text-slate-800">
//               Incident Load
//             </h2>
//             <div className="h-56 w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart
//                   data={emergencyChart}
//                   margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
//                 >
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     vertical={false}
//                     stroke="#f1f5f9"
//                   />
//                   <XAxis
//                     dataKey="name"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{
//                       fill: "#94a3b8",
//                       fontSize: 10,
//                       fontWeight: 900,
//                       textAnchor: "middle",
//                     }}
//                     dy={10}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
//                     allowDecimals={false}
//                   />
//                   <Tooltip
//                     cursor={{ fill: "#f8fafc" }}
//                     contentStyle={{
//                       borderRadius: "16px",
//                       border: "none",
//                       boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
//                     }}
//                   />
//                   <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={35}>
//                     {emergencyChart.map((e, i) => (
//                       <Cell key={i} fill={e.color} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Case Portfolio Chart */}
//           <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
//             <h2 className="text-xs font-black uppercase tracking-widest mb-8 text-slate-800">
//               Case Portfolio
//             </h2>
//             <div className="h-56 w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart
//                   data={caseChart}
//                   margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
//                 >
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     vertical={false}
//                     stroke="#f1f5f9"
//                   />
//                   <XAxis
//                     dataKey="name"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
//                     dy={10}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
//                     allowDecimals={false}
//                   />
//                   <Tooltip
//                     cursor={{ fill: "#f8fafc" }}
//                     contentStyle={{
//                       borderRadius: "16px",
//                       border: "none",
//                       boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
//                     }}
//                   />
//                   <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={35}>
//                     {caseChart.map((e, i) => (
//                       <Cell key={i} fill={e.color} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>

//         {/* PERFORMANCE SECTION */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
//           <div className="bg-white p-8 rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
//             <TrendingUp
//               className="absolute -left-4 -bottom-4 text-slate-50"
//               size={120}
//             />
//             <div className="relative z-10 text-center">
//               <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 mx-auto">
//                 <Target className="text-blue-600" size={28} />
//               </div>
//               <h2 className="text-5xl font-black text-slate-900">
//                 {performance.successRate}%
//               </h2>
//               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
//                 Overall Efficiency
//               </p>
//               <div className="mt-4 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
//                 {performance.label}
//               </div>
//             </div>
//           </div>

//           <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
//             <div className="flex justify-between items-center mb-8">
//               <div>
//                 <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
//                   Resolution Performance
//                 </h2>
//                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
//                   Real-time throughput efficiency
//                 </p>
//               </div>
//               <Award className="text-amber-500" size={20} />
//             </div>
//             <div className="space-y-10">
//               <div>
//                 <div className="flex justify-between mb-2">
//                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
//                     Emergency Resolution
//                   </span>
//                   <span className="text-[10px] font-black text-rose-600">
//                     {performance.eRate}%
//                   </span>
//                 </div>
//                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-rose-500 transition-all duration-1000"
//                     style={{ width: `${performance.eRate}%` }}
//                   />
//                 </div>
//               </div>
//               <div>
//                 <div className="flex justify-between mb-2">
//                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
//                     Cases Resolution
//                   </span>
//                   <span className="text-[10px] font-black text-blue-600">
//                     {performance.cRate}%
//                   </span>
//                 </div>
//                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-blue-600 transition-all duration-1000"
//                     style={{ width: `${performance.cRate}%` }}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* NUMERICAL SUMMARY & QUICK ACTIONS */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//           <div className="lg:col-span-8">
//             <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden h-full">
//               <div className="px-10 py-7 border-b border-slate-50 flex justify-between items-center">
//                 <h2 className="font-black text-slate-800 text-xs uppercase tracking-widest">
//                   Mission Status Summary
//                 </h2>
//                 <Search size={18} className="text-slate-300" />
//               </div>

//               <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
//                 <div className="text-center p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 transition-all hover:shadow-md">
//                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
//                     New Reports
//                   </p>
//                   <h4 className="text-5xl font-black text-rose-600">
//                     {
//                       emergencies.filter(
//                         (e) => e.status?.toLowerCase() === "reported",
//                       ).length
//                     }
//                   </h4>
//                   <p className="text-[9px] font-bold text-slate-400 mt-2 italic uppercase tracking-tighter">
//                     Awaiting Dispatch
//                   </p>
//                 </div>

//                 <div className="text-center p-6 rounded-[2.5rem] bg-blue-50/30 border border-blue-100 transition-all hover:shadow-md">
//                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
//                     In Progress
//                   </p>
//                   <h4 className="text-5xl font-black text-blue-600">
//                     {
//                       emergencies.filter(
//                         (e) => e.status?.toLowerCase() === "in_progress",
//                       ).length
//                     }
//                   </h4>
//                   <p className="text-[9px] font-bold text-blue-400 mt-2 italic uppercase tracking-tighter">
//                     Active Field Units
//                   </p>
//                 </div>

//                 <div className="text-center p-6 rounded-[2.5rem] bg-emerald-50/30 border border-emerald-100 transition-all hover:shadow-md">
//                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">
//                     Resolved
//                   </p>
//                   <h4 className="text-5xl font-black text-emerald-600">
//                     {
//                       emergencies.filter(
//                         (e) => e.status?.toLowerCase() === "resolved",
//                       ).length
//                     }
//                   </h4>
//                   <p className="text-[9px] font-bold text-emerald-500 mt-2 italic uppercase tracking-tighter">
//                     Missions Secured
//                   </p>
//                 </div>
//               </div>

//               <div className="mx-10 mb-10 p-6 bg-slate-900 rounded-[2.5rem] flex items-center justify-between text-white group cursor-default">
//                 <div className="flex items-center gap-4">
//                   <div className="p-3 bg-white/10 rounded-xl group-hover:bg-blue-600 transition-colors">
//                     <FolderLock size={20} />
//                   </div>
//                   <div>
//                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
//                       Cases Successfully Resolved
//                     </p>
//                     <p className="text-lg font-black">
//                       {
//                         cases.filter(
//                           (c) => c.status?.toLowerCase() === "closed",
//                         ).length
//                       }{" "}
//                       Investigative Files
//                     </p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-[28px] font-black text-blue-400 leading-none">
//                     {performance.successRate}%
//                   </p>
//                   <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">
//                     Total Rating
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="lg:col-span-4">
//             <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden h-full shadow-2xl">
//               <Zap
//                 className="absolute -right-8 -bottom-8 text-white/5"
//                 size={200}
//               />
//               <h3 className="text-xl font-black mb-1 relative z-10">
//                 Quick Actions
//               </h3>
//               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8 relative z-10">
//                 Commander Tools
//               </p>
//               <div className="grid grid-cols-1 gap-4 relative z-10">
//                 <button className="w-full p-5 bg-blue-600 rounded-2xl flex items-center justify-between hover:bg-blue-500 transition-all hover:scale-[1.02]">
//                   <span className="text-[10px] font-black uppercase tracking-widest">
//                     Log Emergency
//                   </span>
//                   <Plus size={20} />
//                 </button>
//                 <button className="w-full p-5 bg-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-700 transition-all hover:scale-[1.02]">
//                   <span className="text-[10px] font-black uppercase tracking-widest">
//                     Open Case File
//                   </span>
//                   <FolderLock size={20} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResponderDashboardPage;

// import React, { useState, useEffect, useMemo } from "react";
// import { jwtDecode } from "jwt-decode";
// import axios from "axios";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   Cell,
//   CartesianGrid,
// } from "recharts";
// import {
//   Activity,
//   CheckCircle,
//   Bell,
//   Plus,
//   MapPin,
//   Zap,
//   FolderLock,
//   Search,
//   Target,
//   Award,
//   TrendingUp,
//   Loader2,
// } from "lucide-react";

// const BASE_URL = "http://localhost:5000";

// const ResponderDashboardPage = () => {
//   const [incidents, setIncidents] = useState([]); // Dynamic: holds Emergencies OR Service Reports
//   const [cases, setCases] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isServiceMode, setIsServiceMode] = useState(false);
//   const [agencyInfo, setAgencyInfo] = useState(null);
//   const [teamId, setTeamId] = useState(null);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) return;

//         const decoded = jwtDecode(token);
//         const config = { headers: { Authorization: `Bearer ${token}` } };

//         // Step 1: Get Agency context first (This is critical for the next step)
//         const teamRes = await axios.get(
//           `${BASE_URL}/api/responderTeam/${decoded.id}`,
//           config,
//         );
//         const teamData = teamRes.data?.data || teamRes.data;
//         const agencyId = teamData.agencyId;

//         const agencyRes = await axios.get(
//           `${BASE_URL}/api/agency/${agencyId}`,
//           config,
//         );
//         const agency = agencyRes.data?.data || agencyRes.data;
//         setAgencyInfo(agency);

//         // Mode Detection
//         const agencyName = (agency?.name || "").toLowerCase();
//         const serviceKeywords = [
//           "municipal",
//           "electric",
//           "water",
//           "health",
//           "utility",
//           "medical",
//           "service",
//         ];
//         const localIsService = serviceKeywords.some((kw) =>
//           agencyName.includes(kw),
//         );
//         setIsServiceMode(localIsService);

//         // Step 2: Dynamic Incident Endpoint
//         const incidentEndpoint = localIsService
//           ? `${BASE_URL}/api/service/responder-team/${decoded.id}`
//           : `${BASE_URL}/api/emergencies/responder-team/${decoded.id}`;

//         // Step 3: Fetch Incidents and Cases
//         // Using individual awaits or Promise.allSettled helps pinpoint which one fails
//         const [incRes, casesRes] = await Promise.all([
//           axios.get(incidentEndpoint, config),
//           axios.get(`${BASE_URL}/api/cases/team/all`, config),
//         ]);

//         setIncidents(incRes.data?.data || incRes.data || []);
//         setCases(casesRes.data?.data || casesRes.data || []);
//       } catch (error) {
//         console.error(
//           "Dashboard Sync Error:",
//           error.response?.data || error.message,
//         );
//         // Log the specific backend error message if available
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDashboardData();
//   }, []);

//   // 5. Unified Data Processing
//   const { incidentChart, caseChart, dynamicStats, performance } =
//     useMemo(() => {
//       const iCounts = {
//         reported: incidents.filter((i) =>
//           ["reported", "pending", "open"].includes(i.status?.toLowerCase()),
//         ).length,
//         active: incidents.filter((i) =>
//           ["in_progress", "active", "dispatched"].includes(
//             i.status?.toLowerCase(),
//           ),
//         ).length,
//         resolved: incidents.filter((i) =>
//           ["resolved", "closed", "completed"].includes(i.status?.toLowerCase()),
//         ).length,
//       };

//       const cCounts = {
//         open: cases.filter((c) => c.status?.toLowerCase() === "open").length,
//         pending: cases.filter((c) => c.status?.toLowerCase() === "pending")
//           .length,
//         closed: cases.filter((c) => c.status?.toLowerCase() === "closed")
//           .length,
//       };

//       const totalResolved = iCounts.resolved + cCounts.closed;
//       const totalItems = incidents.length + cases.length;
//       const successRate =
//         totalItems > 0 ? Math.round((totalResolved / totalItems) * 100) : 0;

//       // Theme Variables
//       const themeColor = isServiceMode ? "text-emerald-600" : "text-blue-600";
//       const themeBg = isServiceMode ? "bg-emerald-50/50" : "bg-blue-50/50";

//       const stats = [
//         {
//           title: isServiceMode ? "Service Tasks" : "Live Incidents",
//           value: incidents.length,
//           icon: Activity,
//           color: isServiceMode ? "text-emerald-600" : "text-rose-600",
//           bg: isServiceMode ? "bg-emerald-50/50" : "bg-rose-50/50",
//         },
//         {
//           title: "Total Cases",
//           value: cases.length,
//           icon: FolderLock,
//           color: "text-blue-600",
//           bg: "bg-blue-50/50",
//         },
//         {
//           title: "Field Load",
//           value: iCounts.active + cCounts.pending,
//           icon: Zap,
//           color: "text-amber-600",
//           bg: "bg-amber-50/50",
//         },
//         {
//           title: "Cleared",
//           value: totalResolved,
//           icon: CheckCircle,
//           color: "text-emerald-600",
//           bg: "bg-emerald-50/50",
//         },
//       ];

//       return {
//         incidentChart: [
//           {
//             name: "New",
//             value: iCounts.reported,
//             color: isServiceMode ? "#10b981" : "#e11d48",
//           },
//           { name: "Active", value: iCounts.active, color: "#f59e0b" },
//           {
//             name: "Resolved",
//             value: iCounts.resolved,
//             color: isServiceMode ? "#059669" : "#10b981",
//           },
//         ],
//         caseChart: [
//           { name: "Open", value: cCounts.open, color: "#3b82f6" },
//           { name: "Pending", value: cCounts.pending, color: "#8b5cf6" },
//           { name: "Closed", value: "#64748b" },
//         ],
//         dynamicStats: stats,
//         performance: {
//           successRate,
//           iRate:
//             incidents.length > 0
//               ? Math.round((iCounts.resolved / incidents.length) * 100)
//               : 0,
//           cRate:
//             cases.length > 0
//               ? Math.round((cCounts.closed / cases.length) * 100)
//               : 0,
//           label:
//             successRate > 75
//               ? "Elite"
//               : successRate > 40
//                 ? "Steady"
//                 : "High Load",
//         },
//       };
//     }, [incidents, cases, isServiceMode]);

//   if (loading)
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
//         <Loader2 className="animate-spin text-blue-600" size={48} />
//         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
//           Syncing HQ Data...
//         </p>
//       </div>
//     );

//   const primaryHex = isServiceMode ? "#10b981" : "#2563eb";

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-12 font-sans">
//       <div className="max-w-[1500px] mx-auto p-4 md:p-8">
//         {/* Header */}
//         <header className="flex justify-between items-center mb-10">
//           <div>
//             <h1 className="text-2xl font-black tracking-tight uppercase">
//               Bahir<span style={{ color: primaryHex }}>Link</span>{" "}
//               {isServiceMode ? "Service" : "HQ"}
//             </h1>
//             <div className="flex items-center gap-2 mt-1">
//               <span
//                 className={`h-2 w-2 rounded-full animate-pulse ${isServiceMode ? "bg-emerald-500" : "bg-rose-500"}`}
//               />
//               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
//                 {agencyInfo?.name || "Unit Dispatch"} | ID: {teamId?.slice(-6)}
//               </p>
//             </div>
//           </div>
//           <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm relative">
//             <Bell size={20} className="text-slate-400" />
//             <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
//           </div>
//         </header>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
//           {dynamicStats.map((stat, idx) => (
//             <div
//               key={idx}
//               className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
//             >
//               <div
//                 className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}
//               >
//                 <stat.icon size={22} />
//               </div>
//               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//                 {stat.title}
//               </p>
//               <h3 className="text-3xl font-black text-slate-900 mt-1">
//                 {stat.value}
//               </h3>
//             </div>
//           ))}
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
//             <h2 className="text-xs font-black uppercase tracking-widest mb-8 text-slate-800">
//               {isServiceMode ? "Task Throughput" : "Incident Load"}
//             </h2>
//             <div className="h-56 w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={incidentChart}>
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     vertical={false}
//                     stroke="#f1f5f9"
//                   />
//                   <XAxis
//                     dataKey="name"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: "#94a3b8", fontSize: 10 }}
//                   />
//                   <Tooltip
//                     cursor={{ fill: "#f8fafc" }}
//                     contentStyle={{ borderRadius: "16px", border: "none" }}
//                   />
//                   <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
//                     {incidentChart.map((entry, index) => (
//                       <Cell key={index} fill={entry.color} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
//             <h2 className="text-xs font-black uppercase tracking-widest mb-8 text-slate-800">
//               Case Portfolio
//             </h2>
//             <div className="h-56 w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={caseChart}>
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     vertical={false}
//                     stroke="#f1f5f9"
//                   />
//                   <XAxis
//                     dataKey="name"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
//                   />
//                   <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
//                     {caseChart.map((entry, index) => (
//                       <Cell key={index} fill={entry.color} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>

//         {/* Performance & Summary */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
//           <div className="bg-white p-8 rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
//             <TrendingUp
//               className="absolute -left-4 -bottom-4 text-slate-50"
//               size={120}
//             />
//             <div className="relative z-10 text-center">
//               <div
//                 className={`w-16 h-16 rounded-full ${isServiceMode ? "bg-emerald-50" : "bg-blue-50"} flex items-center justify-center mb-4 mx-auto`}
//               >
//                 <Target
//                   className={
//                     isServiceMode ? "text-emerald-600" : "text-blue-600"
//                   }
//                   size={28}
//                 />
//               </div>
//               <h2 className="text-5xl font-black text-slate-900">
//                 {performance.successRate}%
//               </h2>
//               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
//                 Overall Efficiency
//               </p>
//               <div className="mt-4 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
//                 {performance.label}
//               </div>
//             </div>
//           </div>

//           <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-200">
//             <div className="flex justify-between items-center mb-8">
//               <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
//                 Resolution Performance
//               </h2>
//               <Award className="text-amber-500" size={20} />
//             </div>
//             <div className="space-y-10">
//               <ProgressItem
//                 label={
//                   isServiceMode ? "Report Resolution" : "Emergency Response"
//                 }
//                 val={performance.iRate}
//                 color={isServiceMode ? "bg-emerald-500" : "bg-rose-500"}
//               />
//               <ProgressItem
//                 label="Case Closure Rate"
//                 val={performance.cRate}
//                 color="bg-blue-600"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ProgressItem = ({ label, val, color }) => (
//   <div>
//     <div className="flex justify-between mb-2">
//       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
//         {label}
//       </span>
//       <span className="text-[10px] font-black text-slate-900">{val}%</span>
//     </div>
//     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
//       <div
//         className={`h-full ${color} transition-all duration-1000`}
//         style={{ width: `${val}%` }}
//       />
//     </div>
//   </div>
// );

// export default ResponderDashboardPage;
import React, { useState, useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  CheckCircle,
  Bell,
  Plus,
  Zap,
  FolderLock,
  Search,
  Target,
  Award,
  TrendingUp,
  Loader2,
} from "lucide-react";

const BASE_URL = "http://localhost:5000";

const ResponderDashboardPage = () => {
  // --- STATE ---
  const [incidents, setIncidents] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isServiceMode, setIsServiceMode] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [teamId, setTeamId] = useState(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const responderTeamId = decoded.id;
        setTeamId(responderTeamId);
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const teamRes = await axios.get(
          `${BASE_URL}/api/responderTeam/${responderTeamId}`,
          config,
        );
        const teamData = teamRes.data?.data || teamRes.data;
        const agencyId = teamData.agencyId;

        const agencyRes = await axios.get(
          `${BASE_URL}/api/agency/${agencyId}`,
          config,
        );
        const agency = agencyRes.data?.data || agencyRes.data;
        setAgencyInfo(agency);

        const agencyName = (agency?.name || "").toLowerCase();
        const serviceKeywords = [
          "municipal",
          "electric",
          "water",
          "health",
          "utility",
          "medical",
          "service",
        ];
        const localIsService = serviceKeywords.some((kw) =>
          agencyName.includes(kw),
        );
        setIsServiceMode(localIsService);

        const incidentEndpoint = localIsService
          ? `${BASE_URL}/api/service/responder-team/${responderTeamId}`
          : `${BASE_URL}/api/emergencies/responder-team/${responderTeamId}`;

        const requests = [axios.get(incidentEndpoint, config)];
        if (!localIsService) {
          requests.push(axios.get(`${BASE_URL}/api/cases/team/all`, config));
        }

        const responses = await Promise.all(requests);
        setIncidents(responses[0].data?.data || responses[0].data || []);

        if (!localIsService && responses[1]) {
          setCases(responses[1].data?.data || responses[1].data || []);
        }
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- DATA PROCESSING ---
  const { incidentChart, caseChart, dynamicStats, performance } =
    useMemo(() => {
      const iCounts = {
        reported: incidents.filter((i) =>
          ["reported", "pending", "open"].includes(i.status?.toLowerCase()),
        ).length,
        active: incidents.filter((i) =>
          ["in_progress", "active", "dispatched"].includes(
            i.status?.toLowerCase(),
          ),
        ).length,
        resolved: incidents.filter((i) =>
          ["resolved", "closed", "completed"].includes(i.status?.toLowerCase()),
        ).length,
      };

      const cCounts = {
        open: cases.filter((c) => c.status?.toLowerCase() === "open").length,
        pending: cases.filter((c) => c.status?.toLowerCase() === "pending")
          .length,
        closed: cases.filter((c) => c.status?.toLowerCase() === "closed")
          .length,
      };

      const totalResolved =
        iCounts.resolved + (isServiceMode ? 0 : cCounts.closed);
      const totalItems = incidents.length + (isServiceMode ? 0 : cases.length);
      const successRate =
        totalItems > 0 ? Math.round((totalResolved / totalItems) * 100) : 0;

      const stats = [
        {
          title: isServiceMode ? "Active Tasks" : "Live Incidents",
          value: incidents.length,
          icon: Activity,
          color: isServiceMode ? "text-emerald-600" : "text-rose-600",
          bg: isServiceMode ? "bg-emerald-50/50" : "bg-rose-50/50",
        },
        ...(!isServiceMode
          ? [
              {
                title: "Total Cases",
                value: cases.length,
                icon: FolderLock,
                color: "text-blue-600",
                bg: "bg-blue-50/50",
              },
            ]
          : []),
        {
          title: isServiceMode ? "In Field" : "Field Load",
          value: iCounts.active + (isServiceMode ? 0 : cCounts.pending),
          icon: Zap,
          color: "text-amber-600",
          bg: "bg-amber-50/50",
        },
        {
          title: "Resolved",
          value: totalResolved,
          icon: CheckCircle,
          color: "text-emerald-600",
          bg: "bg-emerald-50/50",
        },
      ];

      return {
        incidentChart: [
          {
            name: "New",
            value: iCounts.reported,
            color: isServiceMode ? "#10b981" : "#e11d48",
          },
          { name: "Active", value: iCounts.active, color: "#f59e0b" },
          {
            name: "Resolved",
            value: iCounts.resolved,
            color: isServiceMode ? "#059669" : "#10b981",
          },
        ],
        caseChart: [
          { name: "Open", value: cCounts.open, color: "#3b82f6" },
          { name: "Pending", value: cCounts.pending, color: "#8b5cf6" },
          { name: "Closed", value: cCounts.closed, color: "#64748b" },
        ],
        dynamicStats: stats,
        performance: {
          successRate,
          iRate:
            incidents.length > 0
              ? Math.round((iCounts.resolved / incidents.length) * 100)
              : 0,
          cRate:
            cases.length > 0
              ? Math.round((cCounts.closed / cases.length) * 100)
              : 0,
          label:
            successRate > 75
              ? "Elite"
              : successRate > 40
                ? "Steady"
                : "High Load",
        },
      };
    }, [incidents, cases, isServiceMode]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Syncing HQ Data...
        </p>
      </div>
    );

  const themeHex = isServiceMode ? "#10b981" : "#2563eb";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-12 font-sans">
      <div className="max-w-[1500px] mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">
              Bahir<span style={{ color: themeHex }}>Link</span>{" "}
              {isServiceMode ? "Service" : "HQ"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`h-2 w-2 rounded-full animate-pulse ${isServiceMode ? "bg-emerald-500" : "bg-blue-500"}`}
              />
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                {agencyInfo?.name || "Unit Dispatch"} | ID:{" "}
                {teamId ? String(teamId).slice(-6) : "GLOBAL"}
              </p>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm relative">
            <Bell size={20} className="text-slate-400" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
          </div>
        </header>

        {/* Stats Grid */}
        <div
          className={`grid gap-5 mb-8 ${isServiceMode ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}
        >
          {dynamicStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm"
            >
              <div
                className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}
              >
                <stat.icon size={22} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {stat.title}
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>

        {/* Graphs - Reduced Width & Height */}
        <div
          className={`grid gap-8 mb-8 ${isServiceMode ? "grid-cols-1 max-w-3xl" : "grid-cols-1 lg:grid-cols-2"}`}
        >
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 text-slate-500">
              {isServiceMode ? "Activity Distribution" : "Incident Load"}
            </h2>
            <div className="w-full h-72">
              {" "}
              {/* Reduced height to h-72 */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incidentChart}
                  margin={{ top: 0, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 6, 6]}
                    barSize={isServiceMode ? 50 : 30}
                  >
                    {incidentChart.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {!isServiceMode && (
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
              <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 text-slate-500">
                Case Portfolio
              </h2>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={caseChart}
                    margin={{ top: 0, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={30}>
                      {caseChart.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Efficiency Matrix */}
        <div
          className={`grid gap-8 mb-8 items-stretch ${isServiceMode ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"}`}
        >
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]">
            <TrendingUp
              className="absolute -left-4 -bottom-4 text-slate-50"
              size={120}
            />
            <div className="relative z-10 text-center">
              <div
                className={`w-14 h-14 rounded-full ${isServiceMode ? "bg-emerald-50" : "bg-blue-50"} flex items-center justify-center mb-4 mx-auto`}
              >
                <Target style={{ color: themeHex }} size={24} />
              </div>
              <h2 className="text-4xl font-black text-slate-900">
                {performance.successRate}%
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                Efficiency
              </p>
            </div>
          </div>

          <div
            className={`${isServiceMode ? "" : "lg:col-span-2"} bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-center`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Resolution Tracking
              </h2>
              <Award className="text-amber-500" size={18} />
            </div>
            <div className="space-y-8">
              <ProgressItem
                label={isServiceMode ? "Task Completion" : "Emergency Response"}
                val={performance.iRate}
                color={isServiceMode ? "bg-emerald-500" : "bg-rose-500"}
              />
              {!isServiceMode && (
                <ProgressItem
                  label="Case Closure"
                  val={performance.cRate}
                  color="bg-blue-600"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 h-full">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">
                  Operation Summary
                </h2>
                <Search size={16} className="text-slate-300" />
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                <SummaryCard
                  label="Pending"
                  val={incidentChart[0].value}
                  color={isServiceMode ? "text-emerald-600" : "text-rose-600"}
                  sub="Queue"
                />
                <SummaryCard
                  label="Active"
                  val={incidentChart[1].value}
                  color="text-amber-600"
                  sub="In-Field"
                />
                <SummaryCard
                  label="Cleared"
                  val={incidentChart[2].value}
                  color="text-emerald-600"
                  sub="Archived"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 h-full">
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden flex flex-col justify-center h-full shadow-xl min-h-[250px]">
              <Zap
                className="absolute -right-8 -bottom-8 text-white/5"
                size={180}
              />
              <h3 className="text-lg font-black mb-1 relative z-10">Control</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 relative z-10">
                Fast Access
              </p>
              <div className="grid grid-cols-1 gap-3 relative z-10">
                <button
                  className={`w-full p-4 ${isServiceMode ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500"} rounded-2xl flex items-center justify-between transition-all active:scale-95`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    New {isServiceMode ? "Entry" : "Incident"}
                  </span>
                  <Plus size={18} />
                </button>
                <button className="w-full p-4 bg-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-700 transition-all active:scale-95">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Archive
                  </span>
                  <FolderLock size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Components
const ProgressItem = ({ label, val, color }) => (
  <div className="w-full">
    <div className="flex justify-between mb-2">
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
        {label}
      </span>
      <span className="text-[10px] font-black text-slate-900">{val}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-1000`}
        style={{ width: `${val}%` }}
      />
    </div>
  </div>
);

const SummaryCard = ({ label, val, color, sub }) => (
  <div className="text-center p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col justify-center items-center flex-grow transition-all">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
      {label}
    </p>
    <h4 className={`text-4xl font-black ${color}`}>{val}</h4>
    <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">
      {sub}
    </p>
  </div>
);

export default ResponderDashboardPage;
