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
  Gavel,
  Home,
  Plus,
  Trash2,
  Download,
} from "lucide-react";

import ChatTab from "./ChatTab";

const API_BASE = "http://localhost:5000";

const ActionsTab = ({ currentStatus, onUpdateStatus }) => {
  const fileInputRef = useRef(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const [reportData, setReportData] = useState({
    incidentSummary: "",
    injuredCount: 0,
    deceasedCount: 0,
    witnesses: [""],
    suspects: [""],
    propertyDamage: "",
    propertyDamageValue: 0,
    media: [],
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

  const addRow = (field) => {
    setReportData({ ...reportData, [field]: [...reportData[field], ""] });
  };

  const removeRow = (field, index) => {
    const newArr = reportData[field].filter((_, i) => i !== index);
    setReportData({ ...reportData, [field]: newArr.length ? newArr : [""] });
  };

  const handleDynamicChange = (field, index, value) => {
    const newArr = [...reportData[field]];
    newArr[index] = value;
    setReportData({ ...reportData, [field]: newArr });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setReportData((prev) => ({
        ...prev,
        media: [...prev.media, ...selectedFiles],
      }));
    }
    e.target.value = "";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Select Operational Status
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {statusOptions.map((opt) => {
            const isCurrent = currentStatus === opt.value;
            const isResolvedInDB = currentStatus === "resolved";

            return (
              <button
                key={opt.value}
                disabled={isCurrent || isResolvedInDB}
                onClick={() =>
                  opt.value === "resolved"
                    ? setIsFinalizing(true)
                    : onUpdateStatus(opt.value)
                }
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  isCurrent
                    ? "bg-slate-100 border-slate-300 opacity-60"
                    : isResolvedInDB
                      ? "bg-slate-50 border-slate-100 opacity-40 grayscale"
                      : "bg-white border-slate-100 hover:border-blue-200 shadow-sm active:scale-[0.98]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg text-white ${opt.color}`}>
                    <opt.icon size={18} />
                  </div>
                  <span
                    className={`font-bold ${isResolvedInDB ? "text-slate-400" : "text-slate-700"}`}
                  >
                    {opt.label}
                  </span>
                </div>
                {isCurrent ? (
                  <CheckCircle2 size={20} className="text-blue-600" />
                ) : (
                  <ChevronRight size={18} className="text-slate-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isFinalizing && currentStatus !== "resolved" && (
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                Injured
              </label>
              <input
                type="number"
                value={reportData.injuredCount}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    injuredCount: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                Deceased
              </label>
              <input
                type="number"
                value={reportData.deceasedCount}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    deceasedCount: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm outline-none"
              />
            </div>
          </div>

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
              placeholder="Final summary..."
              className="w-full h-24 bg-white border border-slate-200 rounded-xl p-4 text-sm outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
              Media Evidence
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold"
            >
              <Camera size={18} />{" "}
              {reportData.media.length > 0
                ? `${reportData.media.length} files`
                : "Attach Media"}
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
            onClick={() => onUpdateStatus("resolved", { ...reportData })}
            disabled={!reportData.incidentSummary.trim()}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest"
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [mergedData, setMergedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const syncData = async () => {
      if (!isOpen || !emergency?.id) return;
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        // 1. Get latest status and emergedId from list
        const res = await axios.get(
          `${API_BASE}/api/emergencies/responder-team/2`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const latest = (res.data.data || res.data).find(
          (item) => item.id === emergency.id,
        );

        if (latest) {
          setLocalStatus(latest.status);
          // 2. If grouped, fetch the summary and list of related reports
          if (latest.emergedId !== null) {
            const mergedRes = await axios.get(
              `${API_BASE}/api/emerged/${latest.emergedId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const payload = mergedRes.data?.data?.[0];
            if (payload)
              setMergedData({
                ...payload,
                list: payload.emergencies || payload.Reports || [],
              });
          } else {
            setMergedData(null);
          }
        }
      } catch (err) {
        console.error("Sync error", err);
      } finally {
        setIsLoading(false);
      }
    };
    syncData();
  }, [isOpen, emergency?.id]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const token = localStorage.getItem("token");
      const id = emergency?.id;
      const response = await axios({
        url: `${API_BASE}/api/finalReport/download/${id}`,
        method: "GET",
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Final_Report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("PDF not available yet.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpdateStatus = async (newStatus, reportPayload = null) => {
    try {
      const token = localStorage.getItem("token");
      const id = emergency?.id;

      if (newStatus === "resolved" && reportPayload) {
        const formData = new FormData();
        formData.append("incidentSummary", reportPayload.incidentSummary);
        formData.append("injuredCount", reportPayload.injuredCount);
        formData.append("deceasedCount", reportPayload.deceasedCount);
        reportPayload.media.forEach((file) => formData.append("media", file));
        await axios.post(`${API_BASE}/api/finalReport/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      await axios.patch(
        `${API_BASE}/api/emergencies/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setLocalStatus(newStatus);
      if (onRefresh) onRefresh();
      if (newStatus === "resolved") onClose();
    } catch (err) {
      alert("Update failed");
    }
  };

  if (!emergency) return null;

  const displayReports =
    mergedData?.list?.length > 0 ? mergedData.list : [emergency];
  const mapsQuery =
    typeof emergency.location === "string"
      ? emergency.location
      : `${emergency.subdivision} ${emergency.street}`;

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
          >
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full animate-pulse ${mergedData ? "bg-blue-500" : "bg-red-500"}`}
                  />
                  {mergedData?.summary ||
                    emergency.emergencyType?.name ||
                    "Incident Intel"}
                </h2>
                <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
                  {mergedData
                    ? `Cluster: ${emergency.emergedId}`
                    : `ID: ${emergency.id}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-2 flex bg-slate-50 border-b">
              {[
                { id: "details", icon: Activity, label: "Info" },
                { id: "action", icon: ClipboardList, label: "Status" },
                { id: "chat", icon: MessageSquare, label: "Comms" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400"}`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50">
              {activeTab === "details" && (
                <div className="p-6 space-y-4">
                  {localStatus === "resolved" && (
                    <div className="p-5 bg-slate-900 rounded-2xl shadow-xl space-y-3 mb-4">
                      <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        {isDownloading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Download size={18} />
                        )}
                        Download Official Record
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border">
                      <Clock size={16} className="text-blue-500 mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        Reported
                      </p>
                      <p className="font-bold text-slate-800">
                        {emergency.time}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border">
                      <Activity size={16} className="text-red-500 mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        Status
                      </p>
                      <p className="font-bold text-slate-800 uppercase">
                        {localStatus.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Incident History ({displayReports.length})
                    </p>
                    {displayReports.map((report, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                        <p className="text-[10px] font-black text-slate-900 uppercase mb-1">
                          {report.citizenId
                            ? `Citizen #${report.citizenId}`
                            : "Guest"}
                        </p>
                        <p className="text-sm text-slate-600 italic">
                          "{report.description}"
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-5 rounded-2xl border space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={14} />
                      <span className="text-[10px] font-black uppercase">
                        Location
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {emergency.kebele?.name} - {emergency.subdivision}
                    </p>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`,
                          "_blank",
                        )
                      }
                      className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      <Navigation size={14} /> Open Maps
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
                  emergencyId={emergency.id}
                  token={localStorage.getItem("token")}
                  apiBaseUrl={API_BASE}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmergencyDetailDrawer;
