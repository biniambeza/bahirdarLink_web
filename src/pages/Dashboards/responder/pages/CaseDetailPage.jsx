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
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Hourglass,
  Eye,
} from "lucide-react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://bahirlink-backend-1.onrender.com";

const API_ENDPOINTS = {
  caseDetail: (id) => `${BASE_URL}/api/cases/${id}`,
  caseStatus: (id) => `${BASE_URL}/api/cases/${id}/status`,
  sightings: (id) => `${BASE_URL}/api/caseReports/case/${id}?lang=en`,
};

const STATUS_OPTIONS = ["pending", "approved", "rejected", "resolved"];

const STATUS_META = {
  resolved: {
    pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    btn: "bg-emerald-600 text-white",
  },
  approved: {
    pill: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    btn: "bg-blue-600 text-white",
  },
  rejected: {
    pill: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    btn: "bg-red-600 text-white",
  },
  pending: {
    pill: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    btn: "bg-amber-500 text-white",
  },
};

const SIGHTING_STATUS_META = {
  verified: {
    classes: "bg-emerald-100 text-emerald-700 border-emerald-200",
    accent: "#059669",
    icon: <CheckCircle2 size={10} />,
  },
  rejected: {
    classes: "bg-red-100 text-red-600 border-red-200",
    accent: "#dc2626",
    icon: <XCircle size={10} />,
  },
  pending: {
    classes: "bg-slate-100 text-slate-500 border-slate-200",
    accent: "#9ca3af",
    icon: <Hourglass size={10} />,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const cleanStr = (field) => {
  if (field === null || field === undefined) return "";

  let parsed = field;

  // If it's a string, check if it's stringified JSON and try to parse it
  if (typeof field === "string" && field.trim().startsWith("{")) {
    try {
      parsed = JSON.parse(field);
    } catch (e) {
      parsed = field;
    }
  }

  // If it's an object (or successfully parsed into one), grab the English text
  if (typeof parsed === "object" && parsed !== null) {
    return (parsed.en || parsed.am || "").trim();
  }

  return String(parsed).trim();
};

const formatDate = (
  iso,
  opts = { year: "numeric", month: "short", day: "numeric" },
) => (iso ? new Date(iso).toLocaleDateString("en-US", opts) : "—");

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const InfoItem = React.memo(({ icon, label, value }) => (
  <div className="flex gap-3 items-start">
    <div className="mt-0.5 p-2 rounded-xl bg-blue-50 text-blue-500 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 break-words">
        {value || "—"}
      </p>
    </div>
  </div>
));
InfoItem.displayName = "InfoItem";

const SightingCard = React.memo(({ report, index }) => {
  const status = report.status || "pending";
  const meta = SIGHTING_STATUS_META[status] ?? SIGHTING_STATUS_META.pending;

  return (
    <div
      className="p-4 bg-white rounded-xl border border-slate-100 mb-2 opacity-0 animate-fade-up"
      style={{
        borderLeft: `3px solid ${meta.accent}`,
        animationPlayState: "running",
        animationDelay: `${index * 0.04}s`,
        animationFillMode: "forwards",
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-slate-400">
          {formatDate(report.spottedAt)}
        </span>
        <span
          className={`flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${meta.classes}`}
        >
          {meta.icon}
          {status}
        </span>
      </div>
      <p className="text-sm text-slate-600 style-paragraph mb-2 leading-relaxed">
        {cleanStr(report.description) || "No description provided."}
      </p>
      <div className="flex items-center gap-1.5 text-slate-400">
        <MapPin size={12} className="text-slate-300" />
        <span className="text-xs">
          {cleanStr(report.kebele) || "Location unknown"}
        </span>
      </div>
    </div>
  );
});
SightingCard.displayName = "SightingCard";

const StatusPanel = React.memo(
  ({ currentStatus, updating, onStatusChange }) => (
    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2 mb-4">
        <RefreshCcw
          size={11}
          className={updating ? "animate-spin text-blue-500" : "text-slate-400"}
        />
        Update Status
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {STATUS_OPTIONS.map((s) => {
          const meta = STATUS_META[s] ?? STATUS_META.pending;
          const isActive = currentStatus === s;
          return (
            <button
              key={s}
              disabled={updating || isActive}
              onClick={() => onStatusChange(s)}
              className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 border flex items-center justify-center gap-1.5
            ${
              isActive
                ? `${meta.btn} border-transparent shadow-md`
                : "bg-white border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900"
            } disabled:cursor-not-allowed`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
              {s}
            </button>
          );
        })}
      </div>
    </div>
  ),
);
StatusPanel.displayName = "StatusPanel";

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-5">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
      <Eye
        size={16}
        className="text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
    <p className="text-[10px] font-black tracking-[0.15em] text-slate-400 uppercase">
      Loading case file…
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const CaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sightingsLoading, setSightingsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchCaseDetail = useCallback(
    async (signal) => {
      try {
        const res = await axios.get(API_ENDPOINTS.caseDetail(id), { signal });
        setCaseData(res.data?.data ?? res.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Case fetch error:", err);
        setError("Failed to load case details.");
      }
    },
    [id],
  );

  const fetchSightings = useCallback(
    async (signal) => {
      setSightingsLoading(true);
      try {
        const res = await axios.get(API_ENDPOINTS.sightings(id), { signal });
        const payload = res.data?.data ?? res.data;
        setSightings(Array.isArray(payload) ? payload : []);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Sightings fetch error:", err);
        setSightings([]);
      } finally {
        setSightingsLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchCaseDetail(controller.signal),
        fetchSightings(controller.signal),
      ]);
      setLoading(false);
    };
    load();
    return () => controller.abort();
  }, [fetchCaseDetail, fetchSightings]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === caseData?.status) return;
    setUpdating(true);
    try {
      await axios.put(API_ENDPOINTS.caseStatus(id), { status: newStatus });
      await fetchCaseDetail();
    } catch {
      alert("Status update failed. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle size={24} className="text-red-600" />
        </div>
        <p className="text-sm font-bold text-slate-800">
          {error || "Case not found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 text-xs font-bold text-blue-600 hover:underline bg-none border-none cursor-pointer"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const statusMeta = STATUS_META[caseData.status] ?? STATUS_META.pending;
  const fullName = cleanStr(caseData.fullName) || "Unknown Subject";
  const description = cleanStr(caseData.description);
  const features = cleanStr(caseData.distinctiveFeatures);
  const location = cleanStr(caseData.lastSeenLocation || caseData.location);
  const contactInfo = cleanStr(caseData.contactInfo);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      {/* Global CSS Inject for specific keyframe setups */}
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.25s ease forwards; }
      `}</style>

      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 h-14 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <span className="text-slate-200">|</span>
        <span className="text-xs text-slate-400 font-medium font-mono">
          Case #{id}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {caseData.isDangerous && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider border border-red-100">
              <AlertTriangle size={10} /> High Risk
            </span>
          )}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusMeta.pill}`}
          >
            {caseData.status}
          </span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header Block */}
        <div className="mb-8">
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">
            Missing Persons · Active Case
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            {fullName}
          </h1>
          {caseData.priority && (
            <div className="mt-2">
              <span className="inline-flex text-[9px] font-black uppercase tracking-widest bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md">
                Priority {caseData.priority}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Media & Metrics */}
          <div className="lg:col-span-4 space-y-6">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 shadow-sm border border-slate-200">
              {caseData.mediaUrl ? (
                <>
                  <img
                    src={
                      caseData.mediaUrl.startsWith("http")
                        ? caseData.mediaUrl
                        : `${BASE_URL}${caseData.mediaUrl}`
                    }
                    className="w-full h-full object-cover"
                    alt={fullName}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-2">
                  <User size={48} strokeWidth={1} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    No photo on file
                  </span>
                </div>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Age", value: caseData.age },
                { label: "Gender", value: caseData.gender, capitalize: true },
                { label: "Height", value: caseData.height },
                { label: "Weight", value: caseData.weight },
              ].map(({ label, value, capitalize }) => (
                <div
                  key={label}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
                >
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    {label}
                  </p>
                  <p
                    className={`text-base font-black text-slate-800 ${capitalize ? "capitalize" : ""}`}
                  >
                    {value || "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* Sighting Reports Panel */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-blue-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Sighting Reports
                  </p>
                </div>
                <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 text-xs rounded-full">
                  {sightings.length}
                </span>
              </div>

              {sightingsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-slate-100 animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : sightings.length > 0 ? (
                <div className="max-h-[400px] overflow-y-auto pr-1">
                  {sightings.map((r, i) => (
                    <SightingCard key={r.id || r._id} report={r} index={i} />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">
                  <AlertCircle
                    size={20}
                    className="mx-auto mb-2 text-slate-300"
                  />
                  <p className="text-xs font-bold text-slate-400">
                    No sightings on file
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Operations & Case Details */}
          <div className="lg:col-span-8 space-y-6">
            <StatusPanel
              currentStatus={caseData.status}
              updating={updating}
              onStatusChange={handleStatusChange}
            />

            {/* Core Intel Card */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 pb-2 border-b border-slate-100">
                Case Intelligence
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  icon={<MapPin size={16} />}
                  label="Last Known Location"
                  value={location}
                />
                <InfoItem
                  icon={<Calendar size={16} />}
                  label="Last Seen Date"
                  value={formatDate(caseData.lastSeenDate)}
                />
                <InfoItem
                  icon={<Phone size={16} />}
                  label="Contact Information"
                  value={contactInfo}
                />
                <InfoItem
                  icon={<Clock size={16} />}
                  label="Report Created At"
                  value={formatDate(caseData.createdAt, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              </div>
            </div>

            {/* Distinctive Features */}
            {features && (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Distinctive Features
                </p>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {features}
                </p>
              </div>
            )}

            {/* Case Narrative / Description */}
            {description && (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Case Narrative
                </p>
                <div className="border-l-2 border-slate-200 pl-4 italic text-sm text-slate-600 leading-relaxed">
                  {description}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseDetailPage;
