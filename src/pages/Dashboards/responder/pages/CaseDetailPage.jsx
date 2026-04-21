import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Activity,
  ShieldAlert,
  User,
  MessageSquare,
  RefreshCcw,
  AlertCircle,
  Clock,
  Calendar,
  Phone,
  Scale,
  Ruler,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

const BASE_URL = "http://localhost:5000";

const CaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchCaseDetail = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/cases/${id}`);
      setCaseData(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetail();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await axios.put(`${BASE_URL}/api/cases/${id}/status`, {
        status: newStatus,
      });
      await fetchCaseDetail();
    } catch (err) {
      alert("Status update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Loading Dossier...
          </p>
        </div>
      </div>
    );

  if (!caseData)
    return (
      <div className="p-20 text-center font-black uppercase">
        Case Not Found
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      {/* NAVIGATION - Updated to go back in history */}
      <div className="fixed top-8 left-8 z-50">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-200 px-5 py-3 rounded-2xl shadow-xl hover:bg-slate-900 hover:text-white transition-all"
        >
          <ArrowLeft size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Back
          </span>
        </button>
      </div>

      <main className="max-w-6xl mx-auto p-6 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT COLUMN: MEDIA & SIGHTINGS */}
          <div className="lg:col-span-5 space-y-8">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200 shadow-2xl">
              {caseData.mediaUrl ? (
                <img
                  src={`${BASE_URL}${caseData.mediaUrl}`}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  alt="Subject"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <User size={80} />
                </div>
              )}
            </div>

            {/* QUICK STATS BOX */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1">
                  Age
                </p>
                <p className="text-lg font-black">{caseData.age || "N/A"}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1">
                  Gender
                </p>
                <p className="text-lg font-black capitalize">
                  {caseData.gender || "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
                <MessageSquare size={14} /> Sightings (
                {caseData.reports?.length || 0})
              </h3>
              {caseData.reports?.length > 0 ? (
                caseData.reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-5 bg-slate-50 border border-slate-100 rounded-2xl"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-[9px] font-black uppercase text-blue-600">
                        {new Date(report.spottedAt).toLocaleDateString()}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <MapPin size={10} /> {report.kebele?.name}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300">
                  <AlertCircle size={24} className="mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    Zero Sightings Reported
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: INTEL & CONTROLS */}
          <div className="lg:col-span-7 space-y-10">
            <header className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${
                    caseData.status === "resolved"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-blue-100 text-blue-700 border-blue-200"
                  }`}
                >
                  {caseData.status}
                </span>
                <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase rounded-full">
                  Priority: {caseData.priority}
                </span>
                {caseData.isDangerous && (
                  <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase rounded-full flex items-center gap-1">
                    <AlertTriangle size={10} /> High Risk
                  </span>
                )}
              </div>
              <h1 className="text-6xl font-black tracking-tighter leading-none">
                {caseData.fullName}
              </h1>
            </header>

            {/* STATUS UPDATE */}
            <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-700 flex items-center gap-2 mb-6">
                <RefreshCcw
                  size={14}
                  className={updating ? "animate-spin" : ""}
                />{" "}
                Update Case Status
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["pending", "approved", "rejected", "resolved"].map((s) => (
                  <button
                    key={s}
                    disabled={updating}
                    onClick={() => handleStatusChange(s)}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                      caseData.status === s
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* DETAILED INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-y py-10">
              <InfoItem
                icon={<MapPin size={20} />}
                label="Last Seen Location"
                value={caseData.lastSeenLocation?.name}
              />
              <InfoItem
                icon={<Calendar size={20} />}
                label="Last Seen Date"
                value={
                  caseData.lastSeenDate
                    ? new Date(caseData.lastSeenDate).toDateString()
                    : "N/A"
                }
              />
              <InfoItem
                icon={<Ruler size={20} />}
                label="Height"
                value={caseData.height}
              />
              <InfoItem
                icon={<Scale size={20} />}
                label="Weight"
                value={caseData.weight}
              />
              <InfoItem
                icon={<Phone size={20} />}
                label="Contact Info"
                value={caseData.contactInfo}
              />
              <InfoItem
                icon={<Clock size={20} />}
                label="Reported On"
                value={new Date(caseData.createdAt).toDateString()}
              />
            </div>

            {/* NARRATIVE & FEATURES */}
            <div className="space-y-8">
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase text-slate-400">
                  Distinctive Features
                </h4>
                <p className="text-lg font-bold text-slate-800">
                  {caseData.distinctiveFeatures ||
                    "No specific marks reported."}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase text-slate-400">
                  Dossier Narrative
                </h4>
                <p className="text-xl font-medium text-slate-600 leading-relaxed font-serif italic border-l-4 border-blue-600 pl-6">
                  {caseData.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Component for Info Grid
const InfoItem = ({ icon, label, value }) => (
  <div className="flex gap-4">
    <div className="p-2 bg-slate-50 text-blue-600 rounded-lg h-fit">{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase text-slate-400">{label}</p>
      <p className="text-sm font-black">{value || "N/A"}</p>
    </div>
  </div>
);

export default CaseDetailPage;
