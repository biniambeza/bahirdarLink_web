import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  User,
  MessageSquare,
  RefreshCcw,
  AlertCircle,
  Clock,
  Calendar,
  Phone,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Hourglass,
  ShieldCheck,
  Eye,
} from "lucide-react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & CONFIGURATIONS
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const API_ENDPOINTS = {
  caseDetail: (id) => `${BASE_URL}/api/cases/${id}`,
  caseStatus: (id) => `${BASE_URL}/api/cases/${id}/status`,
  sightings:  (id) => `${BASE_URL}/api/caseReports/case/${id}?lang=en`,
};

const STATUS_OPTIONS = ["pending", "approved", "rejected", "resolved"];

const STATUS_META = {
  resolved: { pill: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", btn: "bg-emerald-600 text-white" },
  approved: { pill: "bg-blue-100 text-blue-700 border-blue-200",          dot: "bg-blue-500",    btn: "bg-blue-600 text-white"    },
  rejected: { pill: "bg-red-100 text-red-700 border-red-200",             dot: "bg-red-500",     btn: "bg-red-600 text-white"     },
  pending:  { pill: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-400",   btn: "bg-amber-500 text-white"   },
};

const SIGHTING_STATUS_META = {
  verified: { classes: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={10} /> },
  rejected: { classes: "bg-red-100 text-red-600",          icon: <XCircle      size={10} /> },
  pending:  { classes: "bg-slate-100 text-slate-500",      icon: <Hourglass    size={10} /> },
};

// ─────────────────────────────────────────────────────────────────────────────
// REFACTOR: CLEAN DEFAULT VALUE PARSER (Expects plain English strings)
// ─────────────────────────────────────────────────────────────────────────────

const cleanStr = (field) => {
  if (field === null || field === undefined) return "";
  return String(field).trim();
};

const formatDate = (iso, opts = { year: "numeric", month: "short", day: "numeric" }) =>
  iso ? new Date(iso).toLocaleDateString("en-US", opts) : "";

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const InfoItem = React.memo(({ icon, label, value }) => (
  <div className="flex gap-3 items-start">
    <div className="mt-0.5 p-2 rounded-xl bg-blue-50 text-blue-500 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-800 break-words">{value || "—"}</p>
    </div>
  </div>
));
InfoItem.displayName = "InfoItem";

const SightingSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
    ))}
  </div>
);

const SightingCard = React.memo(({ report }) => {
  const status = report.status || "pending";
  const meta   = SIGHTING_STATUS_META[status] ?? SIGHTING_STATUS_META.pending;

  const description  = cleanStr(report.description);
  const locationName = cleanStr(report.kebele);
  const caseTypeName = cleanStr(report.caseType);

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-center mb-3 gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">
          {formatDate(report.spottedAt) || "Date unknown"}
        </span>
        <span className={`flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${meta.classes}`}>
          {meta.icon}
          {status}
        </span>
      </div>

      {caseTypeName && (
        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-2">
          {caseTypeName}
        </p>
      )}

      <p className="text-sm font-medium text-slate-700 leading-relaxed mb-3">
        {description || "No description provided."}
      </p>

      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
        <MapPin size={10} className="text-blue-400 shrink-0" />
        <span className="truncate">{locationName || "Location unknown"}</span>
      </div>

      {report.reporterId && (
        <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-slate-300">
          Reporter #{report.reporterId}
        </p>
      )}
    </div>
  );
});
SightingCard.displayName = "SightingCard";

const StatusPanel = React.memo(({ currentStatus, updating, onStatusChange }) => (
  <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2 mb-4">
      <RefreshCcw size={11} className={updating ? "animate-spin text-blue-500" : "text-slate-400"} />
      Update Status
    </p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {STATUS_OPTIONS.map((s) => {
        const meta     = STATUS_META[s] ?? STATUS_META.pending;
        const isActive = currentStatus === s;
        return (
          <button
            key={s}
            disabled={updating || isActive}
            onClick={() => onStatusChange(s)}
            className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 border flex items-center justify-center gap-1.5
              ${isActive
                ? `${meta.btn} border-transparent shadow-md`
                : "bg-white border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900"
              } disabled:cursor-not-allowed`}
          >
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/70" />}
            {s}
          </button>
        );
      })}
    </div>
  </div>
));
StatusPanel.displayName = "StatusPanel";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DETAIL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const CaseDetailPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [caseData,         setCaseData]         = useState(null);
  const [sightings,        setSightings]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [sightingsLoading, setSightingsLoading] = useState(true);
  const [updating,         setUpdating]         = useState(false);
  const [error,            setError]            = useState(null);

  const fetchCaseDetail = useCallback(async (signal) => {
    try {
      const res = await axios.get(API_ENDPOINTS.caseDetail(id), { signal });
      setCaseData(res.data?.data ?? res.data);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Case fetch error:", err);
      setError("Failed to load case details.");
    }
  }, [id]);

  const fetchSightings = useCallback(async (signal) => {
    setSightingsLoading(true);
    try {
      const res     = await axios.get(API_ENDPOINTS.sightings(id), { signal });
      const payload = res.data?.data ?? res.data;
      setSightings(Array.isArray(payload) ? payload : []);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Sightings fetch error:", err);
      setSightings([]);
    } finally {
      setSightingsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    
    const load = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchCaseDetail(controller.signal),
        fetchSightings(controller.signal)
      ]);
      setLoading(false);
    };

    load();

    return () => {
      controller.abort();
    };
  }, [fetchCaseDetail, fetchSightings]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === caseData?.status) return;
    setUpdating(true);
    try {
      await axios.put(API_ENDPOINTS.caseStatus(id), { status: newStatus });
      await fetchCaseDetail();
    } catch (err) {
      console.error("Status update error:", err);
      alert("Status update failed. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-5">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-blue-50 flex items-center justify-center">
              <Eye size={14} className="text-blue-500" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Loading Dossier
          </p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-white">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-sm font-black uppercase tracking-widest text-slate-500">
          {error || "Case Not Found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 transition-colors"
        >
          ← Return
        </button>
      </div>
    );
  }

  const statusMeta  = STATUS_META[caseData.status] ?? STATUS_META.pending;
  const fullName    = cleanStr(caseData.fullName) || "Unknown Subject";
  const description = cleanStr(caseData.description);
  const features    = cleanStr(caseData.distinctiveFeatures);
  const location    = cleanStr(caseData.lastSeenLocation || caseData.location);
  const contactInfo = cleanStr(caseData.contactInfo);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

      {/* Top Bar Navigation */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <span className="text-slate-200">|</span>
        <span className="text-[10px] font-mono text-slate-400">CASE #{id}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
            {caseData.status}
          </span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Profile Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-200 shadow-xl">
              {caseData.mediaUrl ? (
                <>
                  <img
                    src={caseData.mediaUrl.startsWith('http') ? caseData.mediaUrl : `${BASE_URL}${caseData.mediaUrl}`}
                    className="w-full h-full object-cover"
                    alt={fullName}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                  <User size={64} strokeWidth={1} />
                </div>
              )}

              {caseData.isDangerous && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-red-600 rounded-xl text-[9px] font-black uppercase tracking-wider text-white shadow-lg">
                  <AlertTriangle size={9} />
                  High Risk
                </div>
              )}

              {caseData.status === "resolved" && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-wider text-white shadow-lg">
                  <ShieldCheck size={9} />
                  Resolved
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Age",    value: caseData.age },
                { label: "Gender", value: caseData.gender, capitalize: true },
                { label: "Height", value: caseData.height },
                { label: "Weight", value: caseData.weight },
              ].map(({ label, value, capitalize }) => (
                <div key={label} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                  <p className={`text-base font-black text-slate-800 ${capitalize ? "capitalize" : ""}`}>
                    {value || "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* Sightings Subpanel */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
                  <MessageSquare size={12} />
                  Sightings
                </h3>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black border border-blue-200">
                  {sightings.length}
                </span>
              </div>

              {sightingsLoading ? (
                <SightingSkeleton />
              ) : sightings.length > 0 ? (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scroll">
                  {sightings.map((report) => (
                    <SightingCard key={report.id || report._id} report={report} />
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                  <AlertCircle size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    No Sightings
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dossier Descriptions Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4 pb-8 border-b border-slate-200">
              <div className="flex flex-wrap gap-2">
                <span className={`flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border ${statusMeta.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                  {caseData.status}
                </span>
                {caseData.priority && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider rounded-full border border-slate-200">
                    Priority {caseData.priority}
                  </span>
                )}
              </div>

              <h1 className="text-5xl lg:text-7xl font-black tracking-[-0.03em] leading-[0.9] text-slate-900">
                {fullName}
              </h1>
            </div>

            {/* Admin Interaction Panel */}
            <StatusPanel
              currentStatus={caseData.status}
              updating={updating}
              onStatusChange={handleStatusChange}
            />

            {/* Information Grid Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <InfoItem icon={<MapPin   size={15} />} label="Last Seen Location" value={location} />
              <InfoItem icon={<Calendar size={15} />} label="Last Seen Date"     value={formatDate(caseData.lastSeenDate)} />
              <InfoItem icon={<Phone   size={15} />} label="Contact Info"        value={contactInfo} />
              <InfoItem icon={<Clock    size={15} />} label="Reported On"         value={formatDate(caseData.createdAt)} />
            </div>

            {/* Features Info */}
            {features && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
                  <Ruler size={11} /> Distinctive Features
                </p>
                <p className="text-base font-semibold text-slate-700 leading-relaxed">
                  {features}
                </p>
              </div>
            )}

            {/* Narrative Info Block */}
            {description && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Dossier Narrative
                </p>
                <blockquote className="pl-5 border-l-4 border-blue-500">
                  <p className="text-lg text-slate-600 leading-relaxed font-light italic">
                    {description}
                  </p>
                </blockquote>
              </div>
            )}
          </div>

        </div>
      </main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default CaseDetailPage;