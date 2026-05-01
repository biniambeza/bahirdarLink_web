import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MapPin, Clock, User, Phone, 
  Shield, Activity, Image as ImageIcon, 
  Zap, Navigation 
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

const IncidentDetail = ({ report, isOpen, onClose }) => {
  if (!report) return null;

  // --- LOGIC: GOOGLE MAPS NAVIGATION ---
  const handleNavigation = () => {
    const { latitude, longitude, kebele, subdivision } = report;
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank");
    } else {
      const query = `${kebele || ""}, ${subdivision || ""}, Bahir Dar`;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank");
    }
  };

  // --- FIXED IMAGE LOGIC FOR YOUR BACKEND ---
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    // 1. Normalize backslashes (Windows) to forward slashes
    let cleanedPath = path.replace(/\\/g, '/');

    // 2. Remove "public/" if the DB stores it that way 
    // (e.g., "public/uploads/img.jpg" -> "uploads/img.jpg")
    if (cleanedPath.startsWith('public/')) {
      cleanedPath = cleanedPath.replace('public/', '');
    }

    // 3. Ensure we don't have a double slash when joining
    const finalPath = cleanedPath.startsWith('/') ? cleanedPath.substring(1) : cleanedPath;

    return `${BACKEND_URL}/${finalPath}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-[100] overflow-y-auto border-l border-slate-200"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 border-b border-slate-100 flex items-center justify-between z-30">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Intel</p>
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase">
                {report.emergencyType?.name || report.category || "Emergency"}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-900 hover:text-white rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-8 pb-32">
            {/* Image Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Visual Evidence</label>
              <div className="relative aspect-video w-full bg-slate-100 rounded-[2rem] overflow-hidden border-4 border-white shadow-lg group">
                {report.mediaUrl || report.image ? (
                  <img 
                    src={getImageUrl(report.mediaUrl || report.image)} 
                    alt="Evidence" 
                    className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      console.log("Image load failed for URL:", e.target.src);
                      e.target.src = "https://via.placeholder.com/600x400?text=Evidence+Not+Found";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <ImageIcon size={40} />
                    <p className="text-[10px] font-bold mt-2 uppercase">No Visual Data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                <Activity size={16} className="text-blue-600 mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                <p className="text-xs font-black text-slate-900 uppercase">{report.status || "Reporting"}</p>
              </div>
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                <Clock size={16} className="text-slate-600 mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase">Timestamp</p>
                <p className="text-xs font-black text-slate-900 uppercase">
                  {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Narrative */}
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3 opacity-50">
                <Zap size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Case Description</span>
              </div>
              <p className="text-sm font-medium leading-relaxed italic text-slate-300">
                "{report.description || "No additional description provided by the reporter."}"
              </p>
            </div>

            {/* Dispatch Location */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Location</label>
                  <p className="text-base font-black text-slate-900 leading-tight">
                    {[report.kebele, report.subdivision].filter(Boolean).join(", ") || "Bahir Dar Region"}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleNavigation}
                className="w-full py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-md active:scale-95"
              >
                Launch Field Navigation
              </button>
            </div>

            {/* Reporter Profile */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-200">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">Source</p>
                <p className="text-sm font-black text-slate-800">{report.reporterName || "Citizen Reporter"}</p>
              </div>
              {report.phone && (
                <button className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
                  <Phone size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-100 flex gap-3">
            <button className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Claim Assignment
            </button>
            <button 
              onClick={onClose}
              className="flex-1 border-2 border-slate-200 text-slate-400 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncidentDetail;