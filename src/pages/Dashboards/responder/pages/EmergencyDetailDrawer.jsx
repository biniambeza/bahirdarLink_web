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
  Download, // Added for the PDF button
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

  const removeFile = (index) => {
    setReportData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
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
                /* Disable if already current status OR if the whole emergency is resolved */
                disabled={isCurrent || isResolvedInDB}
                onClick={() =>
                  opt.value === "resolved"
                    ? setIsFinalizing(true)
                    : onUpdateStatus(opt.value)
                }
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  isCurrent
                    ? "bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed"
                    : isResolvedInDB
                      ? "bg-slate-50 border-slate-100 opacity-40 blur-[0.5px] grayscale cursor-not-allowed"
                      : "bg-white border-slate-100 hover:border-blue-200 shadow-sm active:scale-[0.98]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg text-white ${opt.color} ${isResolvedInDB && !isCurrent ? "opacity-50" : ""}`}
                  >
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

          {/* MISSING ATTRIBUTES ADDED BELOW: Property Damage & Property Value */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                Property Damage Description
              </label>
              <div className="relative">
                <textarea
                  placeholder="Describe damage to property..."
                  value={reportData.propertyDamage}
                  onChange={(e) =>
                    setReportData({
                      ...reportData,
                      propertyDamage: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:ring-4 focus:ring-blue-50 outline-none h-20"
                />
                <Home
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={14}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                Estimated Damage Value (ETB)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={reportData.propertyDamageValue}
                  onChange={(e) =>
                    setReportData({
                      ...reportData,
                      propertyDamageValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:ring-4 focus:ring-blue-50 outline-none"
                />
                <span className="absolute left-3 top-3.5 text-[10px] font-bold text-slate-400">
                  ETB
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] font-black text-slate-400 uppercase">
                Witnesses
              </label>
              <button
                onClick={() => addRow("witnesses")}
                className="text-[10px] font-black text-blue-600 flex items-center gap-1 uppercase hover:underline"
              >
                <Plus size={12} /> Add Witness
              </button>
            </div>
            {reportData.witnesses.map((witness, index) => (
              <div key={index} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={`Witness ${index + 1}`}
                    value={witness}
                    onChange={(e) =>
                      handleDynamicChange("witnesses", index, e.target.value)
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:ring-4 focus:ring-blue-50 outline-none"
                  />
                  <Users
                    className="absolute left-3 top-3.5 text-slate-400"
                    size={14}
                  />
                </div>
                {reportData.witnesses.length > 1 && (
                  <button
                    onClick={() => removeRow("witnesses", index)}
                    className="p-2 text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] font-black text-slate-400 uppercase">
                Suspects
              </label>
              <button
                onClick={() => addRow("suspects")}
                className="text-[10px] font-black text-blue-600 flex items-center gap-1 uppercase hover:underline"
              >
                <Plus size={12} /> Add Suspect
              </button>
            </div>
            {reportData.suspects.map((suspect, index) => (
              <div key={index} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={`Suspect ${index + 1}`}
                    value={suspect}
                    onChange={(e) =>
                      handleDynamicChange("suspects", index, e.target.value)
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:ring-4 focus:ring-blue-50 outline-none"
                  />
                  <Gavel
                    className="absolute left-3 top-3.5 text-slate-400"
                    size={14}
                  />
                </div>
                {reportData.suspects.length > 1 && (
                  <button
                    onClick={() => removeRow("suspects", index)}
                    className="p-2 text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
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
              placeholder="Provide summary..."
              className="w-full h-24 bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-4 focus:ring-blue-50 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
              Media Evidence
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:bg-slate-50 transition-colors"
            >
              <Camera size={18} />
              <span className="text-xs font-bold">
                {reportData.media.length > 0
                  ? `${reportData.media.length} files`
                  : "Attach Media"}
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
            onClick={() => onUpdateStatus("resolved", { ...reportData })}
            disabled={!reportData.incidentSummary.trim()}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-[0.98] transition-transform"
          >
            Finalize & Close Case
          </button>
        </motion.div>
      )}

      {currentStatus === "resolved" && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <p className="text-xs font-bold text-emerald-700 uppercase">
            Case Finalized & Closed
          </p>
        </div>
      )}
    </div>
  );
};

const EmergencyDetailDrawer = ({ isOpen, onClose, emergency, onRefresh }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [localStatus, setLocalStatus] = useState("");
  const [isDownloading, setIsDownloading] = useState(false); // New state

  useEffect(() => {
    if (emergency) setLocalStatus(emergency.status);
  }, [emergency]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const token = localStorage.getItem("token");
      const id = emergency?._id || emergency?.id;

      const response = await axios({
        url: `${API_BASE}/api/finalReport/download/${id}`,
        method: "GET",
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download Error:", err);
      alert("Failed to generate PDF. Is the report available?");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpdateStatus = async (newStatus, reportPayload = null) => {
    try {
      const token = localStorage.getItem("token");
      const id = emergency?._id || emergency?.id;
      if (!token || !id) return;

      if (newStatus === "resolved" && reportPayload) {
        const formData = new FormData();
        formData.append("incidentSummary", reportPayload.incidentSummary);
        formData.append("injuredCount", reportPayload.injuredCount);
        formData.append("deceasedCount", reportPayload.deceasedCount);
        formData.append("propertyDamage", reportPayload.propertyDamage);
        formData.append(
          "propertyDamageValue",
          reportPayload.propertyDamageValue,
        );

        reportPayload.witnesses.forEach(
          (w) => w.trim() && formData.append("witnesses[]", w),
        );
        reportPayload.suspects.forEach(
          (s) => s.trim() && formData.append("suspects[]", s),
        );
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
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setLocalStatus(newStatus);
      if (onRefresh) onRefresh();
      if (newStatus === "resolved") onClose();
    } catch (err) {
      console.error("Status Update Error:", err.response?.data);
      alert(`Error: ${err.response?.data?.message || "Server Error"}`);
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
          >
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />{" "}
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
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50">
              {activeTab === "details" && (
                <div className="p-6 space-y-4">
                  {/* Status Banner */}
                  <div className="bg-white p-4 rounded-2xl border flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Active Status
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${localStatus === "resolved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {localStatus?.replace("_", " ")}
                    </span>
                  </div>

                  {/* NEW: Download PDF Section (Visible only when resolved) */}
                  {localStatus === "resolved" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 bg-slate-900 rounded-2xl shadow-xl space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="text-blue-400" size={16} />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">
                          Official Record Available
                        </span>
                      </div>
                      <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98]"
                      >
                        {isDownloading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Download size={18} />
                        )}
                        {isDownloading
                          ? "Generating..."
                          : "Download Official PDF"}
                      </button>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border">
                      <Clock size={16} className="text-blue-500 mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        Time
                      </p>
                      <p className="font-bold text-slate-800">
                        {new Date(emergency.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border">
                      <Activity size={16} className="text-red-500 mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        Type
                      </p>
                      <p className="font-bold text-slate-800">
                        {emergency.emergencyType?.name || "Critical"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border space-y-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileText size={14} />
                      <span className="text-[10px] font-black uppercase">
                        Narrative
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "{emergency.description || "No narrative."}"
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={14} />
                      <span className="text-[10px] font-black uppercase">
                        Location
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {emergency.kebele?.name || "Unknown"} -{" "}
                      {emergency.subdivision || "Standard"}
                    </p>
                    <button
                      onClick={() =>
                        window.open("https://www.google.com/maps", "_blank")
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
                  emergencyId={emergency._id || emergency.id}
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
