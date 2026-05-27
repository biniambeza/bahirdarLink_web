import { useState, useEffect } from "react";
import axios from "axios";

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const BASE_URL = "https://bahirlink-backend-1.onrender.com";

/* ── tiny keyframe injector ── */
const injectStyles = () => {
  if (document.getElementById("settings-styles")) return;
  const s = document.createElement("style");
  s.id = "settings-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    .settings-root { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes popIn {
      0%   { opacity: 0; transform: scale(0.7); }
      70%  { transform: scale(1.06); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.35); }
      70%  { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
      100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
    }

    .fade-up   { animation: fadeUp 0.45s cubic-bezier(.22,1,.36,1) both; }
    .fade-up-1 { animation-delay: 0.05s; }
    .fade-up-2 { animation-delay: 0.13s; }

    .tag-pop { animation: popIn 0.3s cubic-bezier(.22,1,.36,1) both; }

    .shimmer-btn {
      background: linear-gradient(90deg,#2563eb 0%,#3b82f6 40%,#60a5fa 50%,#3b82f6 60%,#1d4ed8 100%);
      background-size: 200% auto;
      transition: background-position 0.4s ease, box-shadow 0.2s;
    }
    .shimmer-btn:hover { background-position: right center; box-shadow: 0 6px 24px rgba(37,99,235,0.45); }
    .shimmer-btn:active { transform: scale(0.97); }
    .shimmer-btn:disabled { opacity: 0.55; pointer-events: none; }

    .tag-item {
      position: relative; overflow: hidden;
      transition: all 0.2s ease;
    }
    .tag-item::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%);
      pointer-events: none;
    }
    .tag-item:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(37,99,235,0.2); }

    .card-glass {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .input-field { transition: border-color 0.2s, box-shadow 0.2s; }
    .input-field:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
      outline: none;
    }
    .section-icon-ring { animation: pulse-ring 2.5s ease-in-out infinite; }
    .grid-bg {
      background-image:
        linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
        linear-gradient(90deg,rgba(59,130,246,0.04) 1px, transparent 1px);
      background-size: 32px 32px;
    }
  `;
  document.head.appendChild(s);
};

/* ── decorative dots ── */
const Dots = ({ className = "" }) => (
  <svg
    className={className}
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
  >
    {[0, 1, 2, 3].map((row) =>
      [0, 1, 2, 3].map((col) => (
        <circle
          key={`${row}-${col}`}
          cx={col * 22 + 8}
          cy={row * 22 + 8}
          r="2.5"
          fill="currentColor"
          opacity={0.15 + (row + col) * 0.04}
        />
      )),
    )}
  </svg>
);

/* ── spinner ── */
const Spinner = () => (
  <svg
    className="animate-spin"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeDasharray="32"
      strokeDashoffset="12"
      strokeLinecap="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M7.5 2v11M2 7.5h11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/* ── tag chip ── */
const TagChip = ({ name, index }) => {
  const hues = [
    "bg-blue-600 text-white",
    "bg-blue-500 text-white",
    "bg-sky-500 text-white",
    "bg-indigo-500 text-white",
    "bg-blue-700 text-white",
  ];
  const cls = hues[index % hues.length];
  const label =
    typeof name === "object" ? name.en || Object.values(name)[0] : name;
  return (
    <span
      className={`tag-item tag-pop inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold tracking-wide cursor-default select-none ${cls}`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white opacity-70 shrink-0" />
      {label}
    </span>
  );
};

/* ── section card ── */
const SectionCard = ({
  title,
  subtitle,
  icon,
  accentClass,
  inputPlaceholder,
  inputValue,
  onInputChange,
  onAdd,
  loading,
  list,
  delay,
}) => (
  <div
    className={`fade-up ${delay} card-glass rounded-3xl border border-blue-100 shadow-[0_4px_32px_rgba(37,99,235,0.08)] overflow-hidden`}
  >
    <div className={`h-1.5 w-full ${accentClass}`} />
    <div className="p-8">
      {/* header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className={`section-icon-ring w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg ${accentClass}`}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-[1.15rem] font-bold text-slate-900 leading-tight">
              {title}
            </h2>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold tracking-widest uppercase text-blue-300 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
          {list.length} {list.length === 1 ? "type" : "types"}
        </span>
      </div>

      {/* input */}
      <div className="flex gap-3 mb-7">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={inputPlaceholder}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
            className="input-field w-full pl-5 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-300 font-medium shadow-sm"
          />
        </div>
        <button
          onClick={onAdd}
          disabled={loading || !inputValue.trim()}
          className="shimmer-btn flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white text-[13px] font-bold tracking-wide shadow-md"
        >
          {loading ? <Spinner /> : <PlusIcon />}
          {loading ? "Adding…" : "Add"}
        </button>
      </div>

      {/* tags */}
      <div className="min-h-[56px]">
        {list.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {list.map((item, i) => (
              <TagChip
                key={item.id || item._id || i}
                name={item.name}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 py-4 px-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <span className="text-2xl opacity-30">🏷️</span>
            <p className="text-[13px] text-slate-400 font-medium">
              No types added yet — be the first!
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════ */
const SettingsPage = () => {
  useEffect(() => {
    injectStyles();
  }, []);

  const [agencyTypeInput, setAgencyTypeInput] = useState("");
  const [agencyTypeList, setAgencyTypeList] = useState([]);
  const [agencyLoading, setAgencyLoading] = useState(false);

  const [emergencyTypeInput, setEmergencyTypeInput] = useState("");
  const [emergencyTypeList, setEmergencyTypeList] = useState([]);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  const fetchAgencyTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${BASE_URL}/api/agencyType/my-agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setAgencyTypeList(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmergencyTypes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/emergencyType`);
      setEmergencyTypeList(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAgencyTypes();
    fetchEmergencyTypes();
  }, []);

  const handlePost = async (endpoint, value, setInput, setLoader, refresh) => {
    if (!value.trim()) return;
    setLoader(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/${endpoint}`,
        { name: value },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setInput("");
      refresh();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="settings-root min-h-screen grid-bg bg-[#F0F5FF] relative overflow-hidden">
      {/* background blobs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[520px] h-[520px] rounded-full bg-blue-200 opacity-20 blur-[100px] translate-x-1/3 -translate-y-1/4" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-sky-300 opacity-15 blur-[80px] -translate-x-1/4 translate-y-1/4" />

      <div className="relative max-w-3xl mx-auto px-6 py-12">
        {/* ── PAGE HEADER ── */}
        <div className="fade-up mb-12 flex items-end justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-blue-500">
                Admin Panel
              </span>
            </div>
            <h1
              className="text-[2.6rem] font-extrabold leading-[1.1] text-slate-900"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: "0.02em",
              }}
            >
              Classification
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(90deg,#2563eb,#38bdf8)",
                }}
              >
                Settings
              </span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-3">
              Manage agency and emergency classifications across the platform.
            </p>
          </div>

          <Dots className="text-blue-400 opacity-60 hidden md:block flex-shrink-0 ml-6" />
        </div>

        {/* ── SECTIONS ── */}
        <div className="space-y-6">
          <SectionCard
            delay="fade-up-1"
            title="Agency Types"
            subtitle="Define operational agency classifications"
            icon="🏛️"
            accentClass="bg-gradient-to-r from-blue-600 to-blue-400"
            inputPlaceholder="e.g. Tactical Response, Medical Unit…"
            inputValue={agencyTypeInput}
            onInputChange={setAgencyTypeInput}
            onAdd={() =>
              handlePost(
                "agencyType",
                agencyTypeInput,
                setAgencyTypeInput,
                setAgencyLoading,
                fetchAgencyTypes,
              )
            }
            loading={agencyLoading}
            list={agencyTypeList}
          />

          <SectionCard
            delay="fade-up-2"
            title="Emergency Types"
            subtitle="Define emergency category classifications"
            icon="⚡"
            accentClass="bg-gradient-to-r from-sky-500 to-blue-500"
            inputPlaceholder="e.g. Critical, Routine, Natural Disaster…"
            inputValue={emergencyTypeInput}
            onInputChange={setEmergencyTypeInput}
            onAdd={() =>
              handlePost(
                "emergencyType",
                emergencyTypeInput,
                setEmergencyTypeInput,
                setEmergencyLoading,
                fetchEmergencyTypes,
              )
            }
            loading={emergencyLoading}
            list={emergencyTypeList}
          />
        </div>

        {/* footer */}
        <p className="text-center text-[10px] text-slate-300 font-semibold tracking-[0.2em] uppercase mt-12">
          BahirLink · Classification Engine
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;