import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  X, MapPin, Clock, User, ExternalLink, FileText,
  Shield, Activity, Calendar, Hash, Wrench, Eye, Info
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const renderEnglish = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "object") return val.en || val.name?.en || val.label?.en || val.name || "—";
  if (typeof val === "string" && (val.includes('{"en":') || val.includes('{"am":'))) {
    try { return JSON.parse(val).en || "—"; } catch { return val; }
  }
  return String(val);
};

const resolveDisplayCategory = (incident, categories = []) => {
  if (incident.resolvedCategory?.name) return incident.resolvedCategory.name;

  const rawId =
    incident.categoryId ??
    incident.serviceCategoryId ??
    incident.category?.id ??
    incident.serviceCategory?.id ??
    null;

  if (rawId != null && categories.length > 0) {
    const found = categories.find(
      (c) => String(c.id ?? c._id) === String(rawId)
    );
    if (found) return renderEnglish(found.name);
  }

  const nested =
    renderEnglish(incident.serviceCategory?.name) ||
    renderEnglish(incident.category?.name);
  if (nested && nested !== "—") return nested;

  if (incident.categoryName) return renderEnglish(incident.categoryName);

  return "General";
};

/* ═══════════════════════════════════════════════════════
   ANIMATION VARIANTS
═══════════════════════════════════════════════════════ */
const panelVariants = {
  hidden:  { x: "100%", opacity: 0 },
  visible: { x: 0,      opacity: 1 },
  exit:    { x: "100%", opacity: 0 },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: (i) => ({
    y: 0, opacity: 1,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" },
  }),
};

/* ═══════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════ */
const ImageViewer = ({ src, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[70] p-4 cursor-zoom-out backdrop-blur-md"
    onClick={onClose}
  >
    <motion.img
      initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      src={src}
      className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
    />
    <button className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-colors">
      <X size={24} />
    </button>
  </motion.div>
);

const DetailSection = ({ title, children, icon: Icon, customIdx }) => (
  <motion.div
    variants={itemVariants} custom={customIdx}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between"
  >
    <div>
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-slate-50 rounded-lg">
          {Icon && <Icon size={18} className="text-blue-600" />}
        </div>
        <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-widest">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-5">{children}</div>
    </div>
  </motion.div>
);

const InfoItem = ({ label, value, subValue, icon: Icon }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
      {label}
    </span>
    <div className="flex items-start gap-2">
      {Icon && <Icon size={14} className="mt-1 text-slate-400 shrink-0" />}
      <div className="min-w-0 flex-1">
        <div className="text-slate-900 font-semibold leading-tight break-words text-sm">
          {typeof value === "string" ? value : renderEnglish(value)}
        </div>
        {subValue && (
          <p className="text-xs text-slate-500 mt-1 break-words">{renderEnglish(subValue)}</p>
        )}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   STATUS CONFIG
═══════════════════════════════════════════════════════ */
const getStatusConfig = (status) => {
  const s = renderEnglish(status).toLowerCase();
  const configs = {
    reported:    { bg: "bg-rose-50",   text: "text-rose-600",   border: "border-rose-100",   label: "Reported"    },
    assigned:    { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100",   label: "Assigned"    },
    in_progress: { bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-100",  label: "In Progress" },
    resolved:    { bg: "bg-emerald-50",text: "text-emerald-600",border: "border-emerald-100",label: "Resolved"    },
    escalated:   { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-100",    label: "Escalated"   },
    pending:     { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", label: "Pending"     },
    completed:   { bg: "bg-emerald-50",text: "text-emerald-600",border: "border-emerald-100",label: "Completed"   },
    ongoing:     { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100",   label: "Ongoing"     },
  };
  return configs[s] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100", label: s };
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
const IncidentDetails = ({ incident, onClose, categories = [] }) => {
  const [reporter,   setReporter]   = useState(null);
  const [showImage,  setShowImage]  = useState(false);
  const navigate = useNavigate();

  if (!incident || (!incident._id && !incident.id)) return null;

  const agencyData   = JSON.parse(localStorage.getItem("agency") || "{}");
  const isServiceUI  = ["municipal", "electric", "water"].some((t) =>
    renderEnglish(agencyData?.agencyType?.name).toLowerCase().includes(t)
  );

  useEffect(() => {
    let isMounted = true;
    const fetchReporter = async () => {
      try {
        const reporterId = incident.userId || incident.citizenId;
        if (!reporterId || incident.guestId) return;
        const token = localStorage.getItem("token");
        const res   = await axios.get(
          `https://bahirlink-backend.onrender.com/api/users/${reporterId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (isMounted) setReporter(res.data.user);
      } catch { /* silent */ }
    };
    fetchReporter();
    return () => { isMounted = false; };
  }, [incident]);

  const categoryName = resolveDisplayCategory(incident, categories);

  const locationStr =
    [
      renderEnglish(incident.kebele),
      renderEnglish(incident.subdivision),
      renderEnglish(incident.street),
    ]
      .filter((s) => s && s !== "—")
      .join(" • ") || "No address provided";

  const mediaSrc = incident.mediaUrl
    ? `https://bahirlink-backend.onrender.com${incident.mediaUrl}`
    : null;

  const status = getStatusConfig(incident.status);
  const lat = incident.location?.latitude || incident.latitude;
  const lng = incident.location?.longitude || incident.longitude;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[50]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#F8FAFC] shadow-2xl z-[60] overflow-hidden flex flex-col"
          variants={panelVariants}
          initial="hidden" animate="visible" exit="exit"
          transition={{ type: "spring", damping: 30, stiffness: 250 }}
        >
          {/* Header */}
          <div className="bg-white px-6 py-5 flex justify-between items-center border-b border-slate-200 sticky top-0 z-10">
            <div className="flex items-center gap-4 min-w-0">
              <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${status.bg} ${status.text} ${status.border}`}>
                {status.label}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                <Hash size={14} className="shrink-0" />
                <span className="text-xs font-mono font-medium truncate uppercase">
                  {String(incident._id || incident.id || "").slice(-8)}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all group shrink-0">
              <X size={20} className="text-slate-400 group-hover:text-slate-900" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {incident.description && (
              <motion.div variants={itemVariants} custom={0} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-3 text-slate-400">
                  <Info size={16} className="text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Statement / Description</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {renderEnglish(incident.description)}
                </p>
              </motion.div>
            )}

            {/* Core Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailSection
                title={isServiceUI ? "Service Detail" : "Incident Detail"}
                icon={isServiceUI ? Wrench : Activity}
                customIdx={1}
              >
                <InfoItem
                  label="Type"
                  value={incident.serviceType || incident.emergencyType?.name || "General"}
                />
                <InfoItem label="Category" value={categoryName} />
              </DetailSection>

              <DetailSection title="Timeline" icon={Clock} customIdx={2}>
                <InfoItem label="Reported Time" value={incident.time || "—"} icon={Clock} />
                <InfoItem
                  label="Log Date"
                  value={incident.createdAt
                    ? new Date(incident.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                    : "N/A"}
                  icon={Calendar}
                />
              </DetailSection>
            </div>

            {/* Profile */}
            <motion.div
              variants={itemVariants} custom={3}
              className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-blue-400" />
                  <h3 className="font-bold text-[10px] uppercase tracking-widest opacity-60">Source Identity</h3>
                </div>
                {!incident.guestId && reporter && (
                  <button
                    onClick={() => navigate(`/users/${reporter._id}`)}
                    className="text-[10px] font-bold bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 active:scale-95"
                  >
                    VERIFY PROFILE <ExternalLink size={10} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-5 min-w-0">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold border border-white/10 uppercase shrink-0">
                  {incident.guestId ? "?" : reporter?.fullName?.charAt(0) || <User size={24} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold truncate">
                    {incident.guestId ? "Anonymous Guest" : renderEnglish(reporter?.fullName) || "Reporter"}
                  </p>
                  <p className="text-sm text-slate-400 font-medium truncate">
                    {incident.guestId ? "Guest User Account" : renderEnglish(reporter?.email || reporter?.phone) || "Member"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Mapping */}
            <DetailSection title="Geographic Data" icon={MapPin} customIdx={4}>
              <div className="space-y-4">
                <InfoItem label="Precise Address" value={locationStr} />
                {lat && lng && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors active:scale-[0.99]"
                  >
                    <ExternalLink size={14} /> VIEW ON SATELLITE MAP
                  </a>
                )}
              </div>
            </DetailSection>

            {/* Evidence Media */}
            {mediaSrc && (
              <motion.div variants={itemVariants} custom={5} className="space-y-4 pb-10">
                <div className="flex items-center gap-2 px-1">
                  <FileText size={18} className="text-slate-400" />
                  <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-widest">Digital Evidence</h3>
                </div>
                <div className="relative group rounded-3xl overflow-hidden bg-slate-200 aspect-video shadow-lg border border-slate-200">
                  {incident.mediaType === "photo" || !incident.mediaType ? (
                    <div className="relative w-full h-full cursor-zoom-in group" onClick={() => setShowImage(true)}>
                      <img
                        src={mediaSrc}
                        alt="Evidence"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-white/90 text-slate-900 p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-lg">
                          <Eye size={14} /> Expand Media
                        </div>
                      </div>
                    </div>
                  ) : (
                    <video src={mediaSrc} controls className="w-full h-full object-cover" />
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showImage && <ImageViewer src={mediaSrc} onClose={() => setShowImage(false)} />}
      </AnimatePresence>
    </>
  );
};

export default IncidentDetails;