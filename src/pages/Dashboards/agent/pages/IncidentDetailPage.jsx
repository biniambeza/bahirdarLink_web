// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import {
//   X,
//   MapPin,
//   Clock,
//   User,
//   ExternalLink,
//   FileText,
//   Shield,
//   Activity,
//   Calendar,
//   Hash,
// } from "lucide-react";

// const panelVariants = {
//   hidden: { x: "100%", opacity: 0 },
//   visible: { x: 0, opacity: 1 },
//   exit: { x: "100%", opacity: 0 },
// };

// const itemVariants = {
//   hidden: { y: 20, opacity: 0 },
//   visible: (i) => ({
//     y: 0,
//     opacity: 1,
//     transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
//   }),
// };

// const ImageViewer = ({ src, onClose }) => (
//   <motion.div
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     exit={{ opacity: 0 }}
//     className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[70] p-4 cursor-zoom-out backdrop-blur-md"
//     onClick={onClose}
//   >
//     <motion.img
//       initial={{ scale: 0.9, opacity: 0 }}
//       animate={{ scale: 1, opacity: 1 }}
//       src={src}
//       alt="Enlarged evidence"
//       className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
//     />
//     <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
//       <X size={32} />
//     </button>
//   </motion.div>
// );

// const DetailSection = ({ title, children, icon: Icon, customIdx }) => (
//   <motion.div
//     variants={itemVariants}
//     custom={customIdx}
//     className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
//   >
//     <div className="flex items-center gap-2 mb-5">
//       <div className="p-2 bg-slate-50 rounded-lg">
//         {Icon && <Icon size={18} className="text-blue-600" />}
//       </div>
//       <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-widest">
//         {title}
//       </h3>
//     </div>
//     <div className="grid grid-cols-1 gap-5">{children}</div>
//   </motion.div>
// );

// const InfoItem = ({ label, value, subValue, icon: Icon }) => (
//   <div className="flex flex-col">
//     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 block">
//       {label}
//     </span>
//     <div className="flex items-start gap-2">
//       {Icon && <Icon size={14} className="mt-1 text-slate-400" />}
//       <div>
//         <p className="text-slate-900 font-semibold leading-tight">
//           {value || "—"}
//         </p>
//         {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
//       </div>
//     </div>
//   </div>
// );

// const IncidentDetails = ({ incident, onClose, categories }) => {
//   const [reporter, setReporter] = useState(null);
//   const [showImage, setShowImage] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchReporter = async () => {
//       try {
//         if (!incident?.citizenId) return;
//         const token = localStorage.getItem("token");
//         const res = await axios.get(
//           `http://localhost:5000/api/users/${incident.citizenId}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setReporter(res.data.user);
//       } catch (error) {
//         console.error("Failed to fetch reporter:", error);
//       }
//     };
//     fetchReporter();
//   }, [incident]);

//   // Safety check: if incident is null or missing ID, don't render
//   if (!incident || (!incident._id && !incident.id)) return null;

//   // Fix 1: Kebele Display Logic (Handles Object or String)
//   const kebeleName = incident.kebele?.name || incident.kebele;
//   const locationStr = [kebeleName, incident.subdivision, incident.street]
//     .filter(Boolean)
//     .join(" • ") || incident.lastSeenLocation || "No address provided";

//   // Fix 2: Category Lookup
//   const resolvedCategory = Array.isArray(categories)
//     ? categories.find(c => (c.id || c._id) === incident.categoryId)?.name
//     : categories?.[incident.categoryId] || "General";

//   const mediaSrc = incident.mediaUrl ? `http://localhost:5000${incident.mediaUrl}` : null;

//   const getStatusConfig = (status) => {
//     const configs = {
//       reported: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", label: "Urgent: Reported" },
//       assigned: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", label: "Dispatched" },
//       in_progress: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", label: "On Scene" },
//       resolved: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", label: "Case Closed" },
//     };
//     return configs[status] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100", label: status };
//   };

//   const status = getStatusConfig(incident.status);

//   return (
//     <>
//       <AnimatePresence>
//         <motion.div
//           className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[50]"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           onClick={onClose}
//         />

//         <motion.div
//           className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#F8FAFC] shadow-2xl z-[60] overflow-hidden flex flex-col"
//           variants={panelVariants}
//           initial="hidden"
//           animate="visible"
//           exit="exit"
//           transition={{ type: "spring", damping: 30, stiffness: 250 }}
//         >
//           {/* Action Header */}
//           <div className="bg-white px-6 py-5 flex justify-between items-center border-b border-slate-200 sticky top-0 z-10">
//             <div className="flex items-center gap-4">
//               <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.text} ${status.border}`}>
//                 {status.label}
//               </div>
//               <div className="flex items-center gap-1.5 text-slate-400">
//                 <Hash size={14} />
//                 <span className="text-xs font-mono font-medium truncate w-24 uppercase">
//                   {/* FIX: Ensure ID is a string before calling .slice() */}
//                   {String(incident._id || incident.id || "").slice(-8)}
//                 </span>
//               </div>
//             </div>
//             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all group">
//               <X size={20} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto p-6 space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <DetailSection title="Event Type" icon={Activity} customIdx={0}>
//                 <InfoItem label="Primary Classification" value={incident.emergencyType?.name || "Incident"} />
//                 <InfoItem label="Sector" value={resolvedCategory} />
//               </DetailSection>

//               <DetailSection title="Schedule" icon={Clock} customIdx={1}>
//                 <InfoItem label="Reported Time" value={incident.time} icon={Clock} />
//                 <InfoItem
//                   label="Log Date"
//                   value={incident.createdAt ? new Date(incident.createdAt).toLocaleDateString(undefined, { dateStyle: "long" }) : "N/A"}
//                   subValue={incident.createdAt ? new Date(incident.createdAt).toLocaleTimeString() : ""}
//                   icon={Calendar}
//                 />
//               </DetailSection>
//             </div>

//             {/* Reporter Profile */}
//             <motion.div
//               variants={itemVariants}
//               custom={2}
//               className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl"
//             >
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                   <Shield size={20} className="text-blue-400" />
//                   <h3 className="font-bold text-[10px] uppercase tracking-widest opacity-60">Source Identity</h3>
//                 </div>
//                 {!incident.guestId && reporter && (
//                   <button
//                     onClick={() => navigate(`/users/${reporter._id}`)}
//                     className="text-[10px] font-bold bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
//                   >
//                     VERIFY PROFILE <ExternalLink size={10} />
//                   </button>
//                 )}
//               </div>

//               <div className="flex items-center gap-5">
//                 <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold border border-white/10 uppercase">
//                   {incident.guestId ? "?" : reporter?.fullName?.charAt(0) || <User />}
//                 </div>
//                 <div>
//                   <p className="text-lg font-bold">
//                     {incident.guestId ? "Anonymous Guest" : reporter?.fullName || "Registry Participant"}
//                   </p>
//                   <p className="text-sm text-slate-400 font-medium">
//                     {incident.guestId ? "Guest User Account" : reporter?.email || "Retrieving secure data..."}
//                   </p>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Geographic Data */}
//             <DetailSection title="Geographic Data" icon={MapPin} customIdx={3}>
//               <div className="space-y-4">
//                 <InfoItem label="Precise Address" value={locationStr} />
//                 {incident.location?.latitude && (
//                   <a
//                     href={`https://www.google.com/maps/search/?api=1&query=${incident.location.latitude},${incident.location.longitude}`}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
//                   >
//                     <ExternalLink size={14} /> VIEW ON SATELLITE MAP
//                   </a>
//                 )}
//               </div>
//             </DetailSection>

//             {/* Digital Evidence */}
//             {mediaSrc && (
//               <motion.div variants={itemVariants} custom={4} className="space-y-4 pb-10">
//                 <div className="flex items-center gap-2 px-1">
//                   <FileText size={18} className="text-slate-400" />
//                   <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-widest">Digital Evidence</h3>
//                 </div>

//                 <div className="relative group rounded-3xl overflow-hidden bg-slate-200 aspect-video shadow-lg border border-slate-200">
//                   {incident.mediaType === "photo" ? (
//                     <img
//                       src={mediaSrc}
//                       alt="incident evidence"
//                       onClick={() => setShowImage(true)}
//                       className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-500"
//                     />
//                   ) : (
//                     <video src={mediaSrc} controls className="w-full h-full object-cover" />
//                   )}
//                   <div className="absolute top-4 right-4">
//                     <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase">
//                       {incident.mediaType || "Evidence"}
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </div>
//         </motion.div>
//       </AnimatePresence>

//       <AnimatePresence>
//         {showImage && (
//           <ImageViewer src={mediaSrc} onClose={() => setShowImage(false)} />
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default IncidentDetails;
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  Wrench,
} from "lucide-react";

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

const ImageViewer = ({ src, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[70] p-4 cursor-zoom-out backdrop-blur-md"
    onClick={onClose}
  >
    <motion.img
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      src={src}
      alt="Enlarged evidence"
      className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
    />
    <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
      <X size={32} />
    </button>
  </motion.div>
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
      <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-widest">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 gap-5">{children}</div>
  </motion.div>
);

const InfoItem = ({ label, value, subValue, icon: Icon }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 block">
      {label}
    </span>
    <div className="flex items-start gap-2">
      {Icon && <Icon size={14} className="mt-1 text-slate-400" />}
      <div>
        <div className="text-slate-900 font-semibold leading-tight">
          {/* CRITICAL FIX: Ensure value is a string/number, never an object */}
          {typeof value === "object"
            ? value?.name || value?.label || "—"
            : value || "—"}
        </div>
        {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
      </div>
    </div>
  </div>
);

const IncidentDetails = ({ incident, onClose, categories }) => {
  const [reporter, setReporter] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const navigate = useNavigate();

  // Safety check: if incident is null or missing ID, don't render
  if (!incident || (!incident._id && !incident.id)) return null;

  // 1. Determine if this is a Service or Emergency agency
  const agencyData = JSON.parse(localStorage.getItem("agency") || "{}");
  const isServiceUI = ["municipal", "electric", "water"].some((t) =>
    (agencyData?.agencyType?.name || "").toLowerCase().includes(t),
  );

  useEffect(() => {
    const fetchReporter = async () => {
      try {
        // Service uses userId, Emergency uses citizenId
        const reporterId = incident.userId || incident.citizenId;
        if (!reporterId || incident.guestId) return;

        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/users/${reporterId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setReporter(res.data.user);
      } catch (error) {
        console.error("Failed to fetch reporter:", error);
      }
    };
    fetchReporter();
  }, [incident]);

  // 2. SAFE DATA EXTRACTION (Fixes the "Objects as React child" error)
  const getSafeName = (val) => (typeof val === "object" ? val?.name : val);

  const kebeleName = getSafeName(incident.kebele);
  const locationStr =
    [kebeleName, incident.subdivision, incident.street]
      .filter(Boolean)
      .join(" • ") || "No address provided";

  // 3. SAFE CATEGORY LOOKUP
  const incidentCatId =
    incident.categoryId ||
    incident.serviceCategoryId ||
    incident.serviceCategory?.id;
  const resolvedCategory = Array.isArray(categories)
    ? categories.find((c) => (c.id || c._id) === incidentCatId)?.name
    : incident.serviceCategory?.name || incident.category?.name || "General";

  const mediaSrc = incident.mediaUrl
    ? `http://localhost:5000${incident.mediaUrl}`
    : null;

  const getStatusConfig = (status) => {
    const configs = {
      reported: {
        bg: "bg-rose-50",
        text: "text-rose-600",
        border: "border-rose-100",
        label: "Reported",
      },
      assigned: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-100",
        label: "Assigned",
      },
      in_progress: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-100",
        label: "In Progress",
      },
      resolved: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
        label: "Resolved",
      },
    };
    return (
      configs[status] || {
        bg: "bg-slate-50",
        text: "text-slate-600",
        border: "border-slate-100",
        label: status,
      }
    );
  };

  const status = getStatusConfig(incident.status);

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[50]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#F8FAFC] shadow-2xl z-[60] overflow-hidden flex flex-col"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: "spring", damping: 30, stiffness: 250 }}
        >
          {/* Action Header */}
          <div className="bg-white px-6 py-5 flex justify-between items-center border-b border-slate-200 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.text} ${status.border}`}
              >
                {status.label}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Hash size={14} />
                <span className="text-xs font-mono font-medium truncate w-24 uppercase">
                  {/* Safe string conversion for slice */}
                  {String(incident._id || incident.id || "").slice(-8)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all group"
            >
              <X
                size={20}
                className="text-slate-400 group-hover:text-slate-900 transition-colors"
              />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailSection
                title={isServiceUI ? "Service Detail" : "Incident Detail"}
                icon={isServiceUI ? Wrench : Activity}
                customIdx={0}
              >
                <InfoItem
                  label="Type"
                  value={
                    incident.emergencyType?.name ||
                    incident.serviceType ||
                    "General"
                  }
                />
                <InfoItem label="Category" value={resolvedCategory} />
              </DetailSection>

              <DetailSection title="Timeline" icon={Clock} customIdx={1}>
                <InfoItem
                  label="Reported Time"
                  value={incident.time}
                  icon={Clock}
                />
                <InfoItem
                  label="Log Date"
                  value={
                    incident.createdAt
                      ? new Date(incident.createdAt).toLocaleDateString()
                      : "N/A"
                  }
                  icon={Calendar}
                />
              </DetailSection>
            </div>

            {/* Reporter Profile */}
            <motion.div
              variants={itemVariants}
              custom={2}
              className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-blue-400" />
                  <h3 className="font-bold text-[10px] uppercase tracking-widest opacity-60">
                    Source Identity
                  </h3>
                </div>
                {!incident.guestId && reporter && (
                  <button
                    onClick={() => navigate(`/users/${reporter._id}`)}
                    className="text-[10px] font-bold bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    VERIFY PROFILE <ExternalLink size={10} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold border border-white/10 uppercase">
                  {incident.guestId
                    ? "?"
                    : reporter?.fullName?.charAt(0) || <User />}
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {incident.guestId
                      ? "Anonymous Guest"
                      : reporter?.fullName || "Registry Participant"}
                  </p>
                  <p className="text-sm text-slate-400 font-medium">
                    {incident.guestId
                      ? "Guest User Account"
                      : reporter?.email || "Registry Member"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Geographic Data */}
            <DetailSection title="Geographic Data" icon={MapPin} customIdx={3}>
              <div className="space-y-4">
                <InfoItem label="Precise Address" value={locationStr} />
                {incident.location?.latitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${incident.location.latitude},${incident.location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    <ExternalLink size={14} /> VIEW ON SATELLITE MAP
                  </a>
                )}
              </div>
            </DetailSection>

            {/* Digital Evidence */}
            {mediaSrc && (
              <motion.div
                variants={itemVariants}
                custom={4}
                className="space-y-4 pb-10"
              >
                <div className="flex items-center gap-2 px-1">
                  <FileText size={18} className="text-slate-400" />
                  <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-widest">
                    Digital Evidence
                  </h3>
                </div>

                <div className="relative group rounded-3xl overflow-hidden bg-slate-200 aspect-video shadow-lg border border-slate-200">
                  {incident.mediaType === "photo" ? (
                    <img
                      src={mediaSrc}
                      alt="incident evidence"
                      onClick={() => setShowImage(true)}
                      className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <video
                      src={mediaSrc}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showImage && (
          <ImageViewer src={mediaSrc} onClose={() => setShowImage(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default IncidentDetails;
