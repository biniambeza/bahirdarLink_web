import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  X,
  MapPin,
  Clock,
  User,
  ExternalLink,
  FileText,
  Shield,
  Activity,
  Calendar,
  Hash,
  ChevronRight,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// --- Sub-components for Tabs ---

const ChatTab = ({ emergencyId }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Dispatcher: High priority assigned. Please confirm arrival.",
      sender: "system",
      time: "10:02",
    },
    {
      id: 2,
      text: "Responder: En route. ETA 5 minutes.",
      sender: "me",
      time: "10:04",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { id: Date.now(), text: input, sender: "me", time: "Now" },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.sender === "me"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm"
              }`}
            >
              <p className="font-medium">{msg.text}</p>
              <span
                className={`text-[10px] mt-1 block opacity-60 ${msg.sender === "me" ? "text-right" : ""}`}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type update..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

const ActionsTab = ({ emergency, onUpdateStatus }) => {
  const [report, setReport] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);

  const statuses = [
    { key: "assigned", label: "Confirmed Dispatch", icon: Shield },
    { key: "in_progress", label: "Arrived On-Scene", icon: MapPin },
    { key: "resolved", label: "Resolve Case", icon: CheckCircle2 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Update Operational Status
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() =>
                s.key === "resolved"
                  ? setIsFinalizing(true)
                  : onUpdateStatus(s.key)
              }
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                emergency.status === s.key
                  ? "bg-blue-50 border-blue-600 text-blue-700"
                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <s.icon size={18} />
                <span className="font-bold text-sm">{s.label}</span>
              </div>
              {emergency.status === s.key && <CheckCircle2 size={18} />}
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
              Final Mission Report
            </span>
          </div>
          <textarea
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Describe the outcome, actions taken, and any remaining hazards..."
            className="w-full h-32 bg-white border-slate-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all"
          />
          <button
            onClick={() => onUpdateStatus("resolved", report)}
            disabled={!report.trim()}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            Submit Final Report & Close Case
          </button>
        </motion.div>
      )}
    </div>
  );
};

// --- Reusable UI components (keep your original variants) ---
const panelVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

const InfoItem = ({ label, value, subValue, icon: Icon }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1 block">
      {label}
    </span>
    <div className="flex items-start gap-2">
      {Icon && <Icon size={14} className="mt-1 text-blue-500" />}
      <div>
        <p className="text-slate-900 font-bold leading-tight">{value || "—"}</p>
        {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
      </div>
    </div>
  </div>
);

const DetailSection = ({ title, children, icon: Icon, customIdx }) => (
  <motion.div
    variants={itemVariants}
    custom={customIdx}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
  >
    <div className="flex items-center gap-2 mb-5">
      <div className="p-2 bg-slate-50 rounded-lg">
        {Icon && <Icon size={18} className="text-blue-600" />}
      </div>
      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-[0.2em]">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 gap-5">{children}</div>
  </motion.div>
);

const EmergencyDetailDrawer = ({ isOpen, onClose, emergency }) => {
  const [activeTab, setActiveTab] = useState("details"); // details, chat, action
  const [reporter, setReporter] = useState(null);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const fetchReporter = async () => {
      try {
        if (!emergency?.citizenId) return;
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("responderToken");
        const res = await axios.get(
          `http://localhost:5000/api/users/${emergency.citizenId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setReporter(res.data.user);
      } catch (error) {
        console.error(error);
      }
    };
    if (isOpen) {
      fetchReporter();
      setActiveTab("details"); // Reset tab on open
    }
  }, [emergency, isOpen]);

  const handleUpdateStatus = async (newStatus, finalReport = null) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("responderToken");
      await axios.patch(
        `http://localhost:5000/api/emergencies/${emergency._id || emergency.id}/status`,
        { status: newStatus, report: finalReport },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // You should trigger a refresh of the parent list here
      onClose();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (!emergency) return null;

  const mediaSrc = emergency.mediaUrl
    ? `http://localhost:5000${emergency.mediaUrl}`
    : null;

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
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#F8FAFC] z-[80] overflow-hidden flex flex-col border-l border-slate-200"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="bg-white px-6 py-4 flex flex-col border-b-2 border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Tactical ID:
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {String(emergency._id || emergency.id)
                      .slice(-8)
                      .toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* TABS */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: "details", label: "Intel", icon: Activity },
                  { id: "chat", label: "Comms", icon: MessageSquare },
                  { id: "action", label: "Actions", icon: CheckCircle2 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab.id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <tab.icon size={14} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "details" && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailSection
                      title="Classification"
                      icon={Activity}
                      customIdx={0}
                    >
                      <InfoItem
                        label="Emergency Type"
                        value={emergency.emergencyType?.name}
                      />
                    </DetailSection>
                    <DetailSection title="Timeline" icon={Clock} customIdx={1}>
                      <InfoItem
                        label="Reported"
                        value={new Date(emergency.createdAt).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      />
                    </DetailSection>
                  </div>

                  <DetailSection
                    title="Narrative"
                    icon={FileText}
                    customIdx={2}
                  >
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                        "{emergency.description || "No narrative."}"
                      </p>
                    </div>
                  </DetailSection>

                  <DetailSection title="Location" icon={MapPin} customIdx={3}>
                    <InfoItem
                      label="Assigned Sector"
                      value={`${emergency.kebele?.name}, ${emergency.subdivision}`}
                    />
                  </DetailSection>

                  {mediaSrc && (
                    <div className="space-y-2 pb-10">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Evidence
                      </h3>
                      <img
                        src={mediaSrc}
                        onClick={() => setShowImage(true)}
                        className="rounded-3xl border-4 border-white shadow-lg cursor-zoom-in hover:scale-[1.02] transition-transform"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "chat" && <ChatTab emergencyId={emergency.id} />}
              {activeTab === "action" && (
                <ActionsTab
                  emergency={emergency}
                  onUpdateStatus={handleUpdateStatus}
                />
              )}
            </div>

            {/* Quick Action Footer only on Details Tab */}
            {activeTab === "details" && (
              <div className="p-6 bg-white border-t border-slate-100">
                <button
                  onClick={() => setActiveTab("action")}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  Manage Status <ChevronRight size={18} />
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
