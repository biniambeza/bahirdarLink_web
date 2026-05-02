// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import {
//   X,
//   MapPin,
//   Clock,
//   FileText,
//   Activity,
//   MessageSquare,
//   CheckCircle2,
//   AlertTriangle,
//   ClipboardList,
//   Navigation,
//   Shield,
//   Info,
//   ChevronRight,
// } from "lucide-react";

// import ChatTab from "./ChatTab";

// const API_BASE = "http://localhost:5000";

// const ActionsTab = ({ currentStatus, onUpdateStatus }) => {
//   const [report, setReport] = useState("");
//   const [isFinalizing, setIsFinalizing] = useState(false);

//   const statusOptions = [
//     { value: "reported", label: "Reported", color: "bg-slate-500", icon: Info },
//     {
//       value: "assigned",
//       label: "Assigned",
//       color: "bg-blue-500",
//       icon: Shield,
//     },
//     {
//       value: "in_progress",
//       label: "In Progress",
//       color: "bg-amber-500",
//       icon: Activity,
//     },
//     {
//       value: "resolved",
//       label: "Resolved",
//       color: "bg-emerald-500",
//       icon: CheckCircle2,
//     },
//   ];

//   return (
//     <div className="p-6 space-y-6">
//       <div className="space-y-4">
//         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//           Select Operational Status
//         </h3>
//         <div className="grid grid-cols-1 gap-3">
//           {statusOptions.map((opt) => (
//             <button
//               key={opt.value}
//               disabled={currentStatus === opt.value}
//               onClick={() =>
//                 opt.value === "resolved"
//                   ? setIsFinalizing(true)
//                   : onUpdateStatus(opt.value)
//               }
//               className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
//                 currentStatus === opt.value
//                   ? "bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed"
//                   : "bg-white border-slate-100 hover:border-blue-200 shadow-sm active:scale-[0.98]"
//               }`}
//             >
//               <div className="flex items-center gap-4">
//                 <div className={`p-2 rounded-lg text-white ${opt.color}`}>
//                   <opt.icon size={18} />
//                 </div>
//                 <span className="font-bold text-slate-700">{opt.label}</span>
//               </div>
//               {currentStatus === opt.value ? (
//                 <CheckCircle2 size={20} className="text-blue-600" />
//               ) : (
//                 <ChevronRight size={18} className="text-slate-300" />
//               )}
//             </button>
//           ))}
//         </div>
//       </div>

//       {isFinalizing && (
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="space-y-4 pt-4 border-t-2 border-dashed border-slate-200"
//         >
//           <div className="flex items-center gap-2 text-amber-600">
//             <AlertTriangle size={16} />
//             <span className="text-xs font-black uppercase tracking-widest">
//               Incident Conclusion Report
//             </span>
//           </div>

//           <textarea
//             value={report}
//             onChange={(e) => setReport(e.target.value)}
//             placeholder="Document the resolution details..."
//             className="w-full h-32 bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all"
//           />

//           <button
//             onClick={() => onUpdateStatus("resolved", report)}
//             disabled={!report.trim()}
//             className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg disabled:opacity-50 active:scale-[0.98] transition-transform"
//           >
//             Finalize & Close
//           </button>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// const EmergencyDetailDrawer = ({ isOpen, onClose, emergency, onRefresh }) => {
//   const [activeTab, setActiveTab] = useState("details");
//   const [localStatus, setLocalStatus] = useState("");

//   useEffect(() => {
//     if (emergency) setLocalStatus(emergency.status);
//   }, [emergency]);

//   const handleUpdateStatus = async (newStatus, finalReport = null) => {
//     try {
//       const token = localStorage.getItem("token");
//       const id = emergency?._id || emergency?.id;

//       if (!token) {
//         alert("Missing token. Please login again.");
//         return;
//       }
//       if (!id) {
//         alert("Missing emergency ID.");
//         return;
//       }

//       const response = await axios.patch(
//         `${API_BASE}/api/emergencies/${id}/status`,
//         { status: newStatus, report: finalReport },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (response.status === 200 || response.status === 204) {
//         setLocalStatus(newStatus);
//         if (onRefresh) onRefresh();
//         if (newStatus === "resolved") onClose();
//       }
//     } catch (err) {
//       console.error("Update Error:", err.response?.data || err.message);
//       alert(
//         `Update Failed: ${err.response?.data?.message || "Check server connection"}`,
//       );
//     }
//   };

//   if (!emergency) return null;

//   const emergencyId = emergency._id || emergency.id;
//   const token = localStorage.getItem("token");

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           <motion.div
//             className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[70]"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//           />

//           <motion.div
//             className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-[80] shadow-2xl flex flex-col"
//             initial={{ x: "100%" }}
//             animate={{ x: 0 }}
//             exit={{ x: "100%" }}
//             transition={{ type: "spring", damping: 25, stiffness: 200 }}
//           >
//             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
//               <div>
//                 <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
//                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
//                   Emergency Intel
//                 </h2>
//                 <p className="text-[10px] font-mono text-slate-400 mt-1">
//                   ID: {String(emergencyId).slice(-8).toUpperCase()}
//                 </p>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="px-6 py-2 flex bg-slate-50 border-b border-slate-100">
//               {[
//                 { id: "details", icon: Activity, label: "Info" },
//                 { id: "action", icon: ClipboardList, label: "Status" },
//                 { id: "chat", icon: MessageSquare, label: "Comms" },
//               ].map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
//                     activeTab === tab.id
//                       ? "text-blue-600 border-b-2 border-blue-600"
//                       : "text-slate-400 hover:text-slate-600"
//                   }`}
//                 >
//                   <tab.icon size={14} /> {tab.label}
//                 </button>
//               ))}
//             </div>

//             <div className="flex-1 overflow-y-auto relative bg-slate-50/50">
//               {activeTab === "details" && (
//                 <motion.button
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                   onClick={() => setActiveTab("chat")}
//                   className="absolute bottom-6 right-6 z-[90] w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center border-4 border-white hover:bg-blue-700 transition-colors"
//                 >
//                   <MessageSquare size={24} />
//                 </motion.button>
//               )}

//               {activeTab === "details" && (
//                 <div className="p-6 space-y-4">
//                   <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
//                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//                       Active Status
//                     </span>
//                     <span
//                       className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
//                         localStatus === "resolved"
//                           ? "bg-emerald-100 text-emerald-700"
//                           : "bg-amber-100 text-amber-700"
//                       }`}
//                     >
//                       {localStatus?.replace("_", " ")}
//                     </span>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
//                       <Clock size={16} className="text-blue-500 mb-2" />
//                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
//                         Time Reported
//                       </p>
//                       <p className="font-bold text-slate-800">
//                         {new Date(emergency.createdAt).toLocaleTimeString([], {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </p>
//                     </div>
//                     <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
//                       <Activity size={16} className="text-red-500 mb-2" />
//                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
//                         Category
//                       </p>
//                       <p className="font-bold text-slate-800">
//                         {emergency.emergencyType?.name || "Critical"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
//                     <div className="flex items-center gap-2 text-slate-400">
//                       <FileText size={14} />
//                       <span className="text-[10px] font-black uppercase tracking-widest">
//                         Narrative
//                       </span>
//                     </div>
//                     <p className="text-sm text-slate-600 leading-relaxed italic">
//                       "{emergency.description || "No narrative provided."}"
//                     </p>
//                   </div>

//                   <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
//                     <div className="flex items-center gap-2 text-slate-400">
//                       <MapPin size={14} />
//                       <span className="text-[10px] font-black uppercase tracking-widest">
//                         Location
//                       </span>
//                     </div>
//                     <div>
//                       <p className="text-sm font-bold text-slate-800 leading-tight">
//                         {emergency.kebele?.name || "Unknown Area"}
//                       </p>
//                       <p className="text-xs text-slate-500 mt-1">
//                         {emergency.subdivision || "Standard subdivision"}
//                       </p>
//                     </div>

//                     <button
//                       onClick={() =>
//                         window.open("https://www.google.com/maps", "_blank")
//                       }
//                       className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
//                     >
//                       <Navigation size={14} /> Open Maps Navigation
//                     </button>
//                   </div>

//                   {emergency.mediaUrl && (
//                     <div className="space-y-2 pb-10">
//                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//                         Digital Evidence
//                       </h3>
//                       <img
//                         src={`${API_BASE}${emergency.mediaUrl}`}
//                         alt="Evidence"
//                         className="rounded-2xl w-full object-cover border-4 border-white shadow-md"
//                       />
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeTab === "chat" && (
//                 <ChatTab
//                   emergencyId={emergencyId}
//                   token={token}
//                   apiBaseUrl={API_BASE}
//                 />
//               )}

//               {activeTab === "action" && (
//                 <ActionsTab
//                   currentStatus={localStatus}
//                   onUpdateStatus={handleUpdateStatus}
//                 />
//               )}
//             </div>

//             {activeTab === "details" && (
//               <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-1">
//                 <button
//                   onClick={() => setActiveTab("action")}
//                   className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-blue-100 active:scale-[0.98] transition-transform"
//                 >
//                   <ClipboardList size={18} /> Modify Case Status
//                 </button>
//               </div>
//             )}
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };

// export default EmergencyDetailDrawer;

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  X,
  MapPin,
  Clock,
  FileText,
  Activity,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Navigation,
  Shield,
  Info,
  ChevronRight,
  Users,
  Camera,
} from "lucide-react";

import ChatTab from "./ChatTab";

const API_BASE = "http://localhost:5000";

const ActionsTab = ({ currentStatus, onUpdateStatus }) => {
  const fileInputRef = useRef(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // State matches your Sequelize Model exactly
  const [reportData, setReportData] = useState({
    incidentSummary: "",
    injuredCount: 0,
    deceasedCount: 0,
    media: [], // Stores base64 or file objects depending on your upload logic
  });

  const statusOptions = [
    { value: "reported", label: "Reported", color: "bg-slate-500", icon: Info },
    {
      value: "assigned",
      label: "Assigned",
      color: "bg-blue-500",
      icon: Shield,
    },
    {
      value: "in_progress",
      label: "In Progress",
      color: "bg-amber-500",
      icon: Activity,
    },
    {
      value: "resolved",
      label: "Resolved",
      color: "bg-emerald-500",
      icon: CheckCircle2,
    },
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Simple logic to store file names or you can implement a full upload here
    setReportData({ ...reportData, media: [...reportData.media, ...files] });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Select Operational Status
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              disabled={currentStatus === opt.value}
              onClick={() =>
                opt.value === "resolved"
                  ? setIsFinalizing(true)
                  : onUpdateStatus(opt.value)
              }
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                currentStatus === opt.value
                  ? "bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed"
                  : "bg-white border-slate-100 hover:border-blue-200 shadow-sm active:scale-[0.98]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg text-white ${opt.color}`}>
                  <opt.icon size={18} />
                </div>
                <span className="font-bold text-slate-700">{opt.label}</span>
              </div>
              {currentStatus === opt.value ? (
                <CheckCircle2 size={20} className="text-blue-600" />
              ) : (
                <ChevronRight size={18} className="text-slate-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {isFinalizing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-4 border-t-2 border-dashed border-slate-200"
        >
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle size={16} />
            <span className="text-xs font-black uppercase tracking-widest">
              Manual Incident Attributes
            </span>
          </div>

          {/* Victim Statistics Group */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                Injured Count
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={reportData.injuredCount}
                  onChange={(e) =>
                    setReportData({
                      ...reportData,
                      injuredCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:ring-4 focus:ring-blue-50 outline-none"
                />
                <Users
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={14}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                Deceased Count
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={reportData.deceasedCount}
                  onChange={(e) =>
                    setReportData({
                      ...reportData,
                      deceasedCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:ring-4 focus:ring-blue-50 outline-none"
                />
                <Activity
                  className="absolute left-3 top-3.5 text-red-400"
                  size={14}
                />
              </div>
            </div>
          </div>

          {/* Incident Summary */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
              Incident Summary
            </label>
            <textarea
              value={reportData.incidentSummary}
              onChange={(e) =>
                setReportData({
                  ...reportData,
                  incidentSummary: e.target.value,
                })
              }
              placeholder="Provide a detailed TEXT summary of what actually happened..."
              className="w-full h-28 bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all"
            />
          </div>

          {/* Media Evidence Upload */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
              Media Evidence (JSON)
            </label>
            <button
              onClick={() => fileInputRef.current.click()}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:bg-slate-50 transition-colors"
            >
              <Camera size={18} />
              <span className="text-xs font-bold">
                {reportData.media.length > 0
                  ? `${reportData.media.length} files selected`
                  : "Attach Scene Photos/Evidence"}
              </span>
            </button>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <button
            onClick={() => onUpdateStatus("resolved", reportData)}
            disabled={!reportData.incidentSummary.trim()}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            Finalize & Close Case
          </button>
        </motion.div>
      )}
    </div>
  );
};

const EmergencyDetailDrawer = ({ isOpen, onClose, emergency, onRefresh }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [localStatus, setLocalStatus] = useState("");

  useEffect(() => {
    if (emergency) setLocalStatus(emergency.status);
  }, [emergency]);

  const handleUpdateStatus = async (newStatus, reportPayload = null) => {
    try {
      const token = localStorage.getItem("token");
      const id = emergency?._id || emergency?.id;

      if (!token || !id) return;

      // 1. POST to /api/final-reports/:emergencyId
      // Find this block inside handleUpdateStatus
      if (newStatus === "resolved" && reportPayload) {
        await axios.post(
          // CHANGE THIS LINE:
          // From: ${API_BASE}/api/final-reports/${id}
          // To:   ${API_BASE}/api/finalReport/${id}
          `${API_BASE}/api/finalReport/${id}`,
          {
            incidentSummary: reportPayload.incidentSummary,
            injuredCount: reportPayload.injuredCount,
            deceasedCount: reportPayload.deceasedCount,
            media: reportPayload.media,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      }

      // 2. PATCH the status
      const response = await axios.patch(
        `${API_BASE}/api/emergencies/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 || response.status === 204) {
        setLocalStatus(newStatus);
        if (onRefresh) onRefresh();
        if (newStatus === "resolved") onClose();
      }
    } catch (err) {
      console.error("Finalization Error:", err.response?.data);
      alert(`Error: ${err.response?.data?.message || "Internal Server Error"}`);
    }
  };

  if (!emergency) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-[80] shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Emergency Intel
                </h2>
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  ID:{" "}
                  {String(emergency._id || emergency.id)
                    .slice(-8)
                    .toUpperCase()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 py-2 flex bg-slate-50 border-b border-slate-100">
              {[
                { id: "details", icon: Activity, label: "Info" },
                { id: "action", icon: ClipboardList, label: "Status" },
                { id: "chat", icon: MessageSquare, label: "Comms" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto relative bg-slate-50/50">
              {activeTab === "details" && (
                <div className="p-6 space-y-4">
                  {/* Status Banner */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Active Status
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${localStatus === "resolved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {localStatus?.replace("_", " ")}
                    </span>
                  </div>

                  {/* Summary Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <Clock size={16} className="text-blue-500 mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        Time Reported
                      </p>
                      <p className="font-bold text-slate-800">
                        {new Date(emergency.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <Activity size={16} className="text-red-500 mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        Category
                      </p>
                      <p className="font-bold text-slate-800">
                        {emergency.emergencyType?.name || "Critical"}
                      </p>
                    </div>
                  </div>

                  {/* Narrative Section */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileText size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Original Narrative
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "{emergency.description || "No narrative provided."}"
                    </p>
                  </div>

                  {/* Location Info */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Location
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">
                        {emergency.kebele?.name || "Unknown Area"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {emergency.subdivision || "Standard subdivision"}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        window.open("https://www.google.com/maps", "_blank")
                      }
                      className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                    >
                      <Navigation size={14} /> Open Maps Navigation
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "action" && (
                <ActionsTab
                  currentStatus={localStatus}
                  onUpdateStatus={handleUpdateStatus}
                />
              )}

              {activeTab === "chat" && (
                <ChatTab
                  emergencyId={emergency._id || emergency.id}
                  token={localStorage.getItem("token")}
                  apiBaseUrl={API_BASE}
                />
              )}
            </div>

            {activeTab === "details" && (
              <div className="p-4 bg-white border-t border-slate-100">
                <button
                  onClick={() => setActiveTab("action")}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg active:scale-[0.98] transition-transform"
                >
                  <ClipboardList size={18} /> Modify Case Status
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmergencyDetailDrawer;
