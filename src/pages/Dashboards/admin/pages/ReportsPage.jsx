import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Search,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  X,
  Filter,
  Flame,
  Shield,
  Heart,
  Building2,
  Database,
  TrendingUp,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  TriangleAlert,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const BASE_URL = "https://bahirlink-backend-1.onrender.com";

/**
 * Mirrors the backend's emergencyTypeToAgencyType map — but inverted.
 * Key = AgencyType name (what's stored on the agency record)
 * Value = array of emergencyType strings that agency handles
 *
 * Backend source:
 *   Crime  → Police
 *   Medical → Health
 *   Fire   → Fire
 */
// Inverted from backend emergencyTypeToAgencyType:
//   Crime → Police | Medical → Health | Fire → Fire
// "Medical" alias covers DB rows where agencyType.name is stored as "Medical"
// instead of "Health". All comparisons are lowercased in matchesAgency.
const AGENCY_TYPE_TO_EMERGENCY_TYPES = {
  Police: ["crime"],
  Health: ["medical"], // agencyType.name = "Health", emergencyType = "Medical"
  Medical: ["medical"], // alias: some DB rows store agencyType.name as "Medical"
  Fire: ["fire"],
};

/**
 * Icon + accent color per AgencyType name.
 * ONLY the 3 types that exist in the backend emergencyTypeToAgencyType map.
 * Agencies whose type is NOT in this map are excluded from the filter UI.
 */
const AGENCY_TYPE_META = {
  Police: { Icon: Shield, color: "text-blue-500" },
  Health: { Icon: Heart, color: "text-rose-500" },
  Medical: { Icon: Heart, color: "text-rose-500" }, // alias for Health
  Fire: { Icon: Flame, color: "text-orange-500" },
};

const STATUS_ORDER = {
  escalated: 0,
  reported: 1,
  pending: 2,
  in_progress: 3,
  ongoing: 4,
  completed: 5,
  resolved: 6,
};

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const renderEnglish = (val) => {
  if (!val) return "";
  if (typeof val === "object")
    return val.en || val.name?.en || val.label?.en || val.name || "";
  if (
    typeof val === "string" &&
    (val.includes('{"en":') || val.includes('{"am":'))
  ) {
    try {
      return JSON.parse(val).en || "";
    } catch {
      return val;
    }
  }
  return String(val);
};

/* ═══════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════ */
const StatCard = ({ label, value, Icon, color }) => {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-500",
      val: "text-blue-700",
      border: "border-blue-100",
    },
    rose: {
      bg: "bg-rose-50",
      icon: "text-rose-500",
      val: "text-rose-700",
      border: "border-rose-100",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-500",
      val: "text-amber-700",
      border: "border-amber-100",
    },
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      val: "text-emerald-700",
      border: "border-emerald-100",
    },
  };
  const c = colors[color] || colors.blue;
  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${c.border} ${c.bg} bg-opacity-60`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border ${c.border}`}
      >
        <Icon size={18} className={c.icon} />
      </div>
      <div>
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-400 mb-0.5">
          {label}
        </p>
        <p className={`text-2xl font-black tabular-nums leading-none ${c.val}`}>
          {value}
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SORT ICON + TH
═══════════════════════════════════════════════════════ */
const SortIcon = ({ col, sortCol, sortDir }) => {
  if (sortCol !== col)
    return (
      <ChevronsUpDown size={12} className="text-slate-300 ml-1 inline-block" />
    );
  return sortDir === "asc" ? (
    <ChevronUp size={12} className="text-blue-500 ml-1 inline-block" />
  ) : (
    <ChevronDown size={12} className="text-blue-500 ml-1 inline-block" />
  );
};

const Th = ({ label, col, sortCol, sortDir, onSort, center }) => (
  <th
    onClick={() => onSort(col)}
    className={`px-5 py-4 text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400
                cursor-pointer select-none whitespace-nowrap hover:text-slate-600 transition-colors
                ${center ? "text-center" : ""}`}
  >
    {label}
    <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
  </th>
);

/* ═══════════════════════════════════════════════════════
   STATUS CHIP
═══════════════════════════════════════════════════════ */
const STATUS_STYLES = {
  resolved: {
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  completed: {
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  in_progress: {
    cls: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
  ongoing: { cls: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  escalated: {
    cls: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  reported: {
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  pending: {
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
};

const StatusChip = ({ status }) => {
  const key = String(status || "pending").toLowerCase();
  const t = STATUS_STYLES[key] || {
    cls: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${t.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.dot}`} />
      {status || "Pending"}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════
   AGENCY DOT — color by agency type name
═══════════════════════════════════════════════════════ */
const AGENCY_DOT_MAP = {
  fire: "bg-orange-400",
  crime: "bg-blue-500",
  police: "bg-blue-500",
  health: "bg-rose-500",
  medical: "bg-rose-500",
  utility: "bg-yellow-500",
  electric: "bg-yellow-500",
  municipal: "bg-violet-500",
};

const agencyDot = (typeStr = "") => {
  const lower = typeStr.toLowerCase();
  const match = Object.entries(AGENCY_DOT_MAP).find(([k]) => lower.includes(k));
  return match ? match[1] : "bg-slate-400";
};

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [allKebeles, setAllKebeles] = useState([]);

  // ── Dynamic agencies from /api/agency/my-agents ──
  // Each entry is enriched with a resolved .agencyType object
  const [myAgencies, setMyAgencies] = useState([]);
  const [agenciesLoading, setAgenciesLoading] = useState(true);

  const [filter, setFilter] = useState("all");
  // agencyFilter holds an agency ID (string) or "all"
  const [agencyFilter, setAgencyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [kebeleFilter, setKebeleFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortCol, setSortCol] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* ─────────────────────────────────────────────────────
     Data fetching
     
     KEY FIX: getAgentsByCreatorId (backend) does NOT join AgencyType —
     it returns only agencyTypeId. We therefore:
       1. Fetch all agency types available to this admin
          (/api/agencyType/my → falls back to /api/agencyType)
       2. Build a lookup map: agencyTypeId → agencyType object
       3. Map over every agency and attach the resolved agencyType

     This ensures myAgencies[n].agencyType is always populated,
     regardless of whether the backend join is present.
  ───────────────────────────────────────────────────── */
  useEffect(() => {
    setReports([]);
    setError("");

    (async () => {
      setLoading(true);
      setAgenciesLoading(true);

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [reportsRes, kebelesRes, agenciesRes, agencyTypesRes] =
          await Promise.all([
            axios.get(`${BASE_URL}/api/emergencies/admin/all`, { headers }),
            axios.get(`${BASE_URL}/api/kebele`, { headers }),
            // Returns ALL agencies created by this admin (createdBy = adminId)
            axios.get(`${BASE_URL}/api/agency/my-agents`, { headers }),
            // Try admin-scoped types first, fall back to global list
            axios
              .get(`${BASE_URL}/api/agencyType/my`, { headers })
              .catch(() =>
                axios.get(`${BASE_URL}/api/agencyType`, { headers }),
              ),
          ]);

        /* ── Reports ── */
        if (reportsRes.data.success) {
          setReports(
            reportsRes.data.data ||
              reportsRes.data.services ||
              reportsRes.data.emergencies ||
              [],
          );
        }

        /* ── Kebeles ── */
        setAllKebeles(
          kebelesRes.data.data ||
            kebelesRes.data.kebeles ||
            kebelesRes.data ||
            [],
        );

        /* ── Agency type lookup map: id → type object ── */
        const rawAgencyTypes =
          agencyTypesRes.data?.data ||
          agencyTypesRes.data?.agencyTypes ||
          agencyTypesRes.data ||
          [];
        const agencyTypeMap = {};
        (Array.isArray(rawAgencyTypes) ? rawAgencyTypes : []).forEach((at) => {
          // Index by both numeric id and string id for safety
          agencyTypeMap[String(at.id)] = at;
          if (at._id) agencyTypeMap[String(at._id)] = at;
        });

        /* ── Agencies: enrich every record with its resolved agencyType ──
           getAgentsByCreatorId returns ALL agencies where createdBy = adminId.
           It does not include a JOIN, so agency.agencyType may be undefined.
           We resolve it from agencyTypeMap using agencyTypeId.
        ── */
        const rawAgencies =
          agenciesRes.data?.data ||
          agenciesRes.data?.agencies ||
          agenciesRes.data ||
          [];

        const enriched = (Array.isArray(rawAgencies) ? rawAgencies : []).map(
          (agency) => {
            // If the backend already joined agencyType, keep it; otherwise resolve it
            const resolvedType =
              agency.agencyType ||
              agencyTypeMap[String(agency.agencyTypeId)] ||
              agencyTypeMap[String(agency.agencyType_id)] ||
              null;

            return {
              ...agency,
              agencyType: resolvedType,
            };
          },
        );

        setMyAgencies(enriched);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
        setAgenciesLoading(false);
      }
    })();
  }, []);

  /* ── Kebele options ── */
  const kebeleOptions = useMemo(() => {
    const names = allKebeles
      .map((k) => renderEnglish(k.name))
      .filter(Boolean)
      .sort();
    return ["all", ...names];
  }, [allKebeles]);

  /* ── Stats ── */
  const stats = useMemo(
    () => ({
      total: reports.length,
      escalated: reports.filter(
        (r) => String(renderEnglish(r.status)).toLowerCase() === "escalated",
      ).length,
      pending: reports.filter((r) =>
        ["pending", "reported"].includes(
          String(renderEnglish(r.status)).toLowerCase(),
        ),
      ).length,
      resolved: reports.filter((r) =>
        ["resolved", "completed"].includes(
          String(renderEnglish(r.status)).toLowerCase(),
        ),
      ).length,
    }),
    [reports],
  );

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const activeFilterCount = [
    agencyFilter !== "all",
    kebeleFilter !== "all",
    dateFrom !== "",
    dateTo !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setAgencyFilter("all");
    setKebeleFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  /**
   * Match a report against the selected agency.
   *
   * agency.agencyType is now guaranteed to be resolved (or null) by useEffect.
   * agency.agencyType.name → "Police" | "Health" | "Fire" (plain string or bilingual obj)
   * AGENCY_TYPE_TO_EMERGENCY_TYPES maps that to the emergency type strings
   * present in getAllEmergenciesForAdmin output.
   *
   * Case-insensitive: agencyTypeName is title-cased for map lookup;
   * reportType is lowercased so "Medical" === "medical" always matches.
   */
  const matchesAgency = (report, selectedAgencyId) => {
    if (selectedAgencyId === "all") return true;

    const selectedAgency = myAgencies.find(
      (a) => String(a.id) === String(selectedAgencyId),
    );
    if (!selectedAgency) return true;

    const rawName =
      selectedAgency.agencyType?.name || selectedAgency.agencyTypeName || "";
    // Normalize to title-case for map lookup: "health" → "Health"
    const agencyTypeNameRaw = renderEnglish(rawName);
    const agencyTypeName =
      agencyTypeNameRaw.charAt(0).toUpperCase() +
      agencyTypeNameRaw.slice(1).toLowerCase();

    // Try exact title-case match, then fall back to case-insensitive scan
    const handledTypes =
      AGENCY_TYPE_TO_EMERGENCY_TYPES[agencyTypeName] ||
      AGENCY_TYPE_TO_EMERGENCY_TYPES[agencyTypeNameRaw] ||
      Object.entries(AGENCY_TYPE_TO_EMERGENCY_TYPES).find(
        ([k]) => k.toLowerCase() === agencyTypeNameRaw.toLowerCase(),
      )?.[1] ||
      [];

    if (handledTypes.length === 0) return false;

    // getAllEmergenciesForAdmin returns emergencyType as "Crime"|"Medical"|"Fire"
    const reportType = String(
      renderEnglish(report.emergencyType || report.serviceType || ""),
    ).toLowerCase();

    return handledTypes.some(
      (et) => reportType === et || reportType.includes(et),
    );
  };

  /* ─────────────────────────────────────────────────────
     Filtering + sorting

     SORT FIX: the original code had a variable shadowing bug —
     `bv2` was used inside the sort comparator but `b` was the
     Array.prototype.sort parameter. The corrected version uses
     consistent variable names (valA / valB) throughout and
     handles all sort columns explicitly with proper fallbacks.
  ───────────────────────────────────────────────────── */
  const filteredReports = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;

    /* ── Step 1: filter ── */
    const list = reports
      .filter((r) =>
        filter === "registered"
          ? r.reporterType === "user"
          : filter === "guest"
            ? r.reporterType === "guest"
            : true,
      )
      .filter((r) => matchesAgency(r, agencyFilter))
      .filter((r) => {
        if (kebeleFilter === "all") return true;
        return (
          String(renderEnglish(r.kebele)).toLowerCase() ===
          kebeleFilter.toLowerCase()
        );
      })
      .filter((r) => {
        if (!r.createdAt) return true;
        const d = new Date(r.createdAt);
        return !(from && d < from) && !(to && d > to);
      })
      .filter((r) => {
        if (!q) return true;
        return [
          renderEnglish(r.emergencyType || r.serviceType),
          renderEnglish(r.category || r.serviceCategory),
          renderEnglish(r.reporterName || r.fullName),
          `${renderEnglish(r.kebele)} ${renderEnglish(r.subdivision)} ${renderEnglish(r.street)}`,
        ].some((s) => s.toLowerCase().includes(q));
      });

    /* ── Step 2: sort ──
       Fixed: consistent valA/valB names, no variable shadowing,
       explicit per-column logic with proper numeric/string comparisons.
    ── */
    return [...list].sort((a, b) => {
      let valA, valB;

      switch (sortCol) {
        case "createdAt": {
          valA = new Date(a.createdAt || 0).getTime();
          valB = new Date(b.createdAt || 0).getTime();
          return sortDir === "asc" ? valA - valB : valB - valA;
        }

        case "status": {
          valA =
            STATUS_ORDER[
              String(renderEnglish(a.status)).toLowerCase().replace(/\s+/g, "_")
            ] ?? 99;
          valB =
            STATUS_ORDER[
              String(renderEnglish(b.status)).toLowerCase().replace(/\s+/g, "_")
            ] ?? 99;
          return sortDir === "asc" ? valA - valB : valB - valA;
        }

        case "type": {
          valA = renderEnglish(a.emergencyType || a.serviceType || "");
          valB = renderEnglish(b.emergencyType || b.serviceType || "");
          const cmp = String(valA).localeCompare(String(valB));
          return sortDir === "asc" ? cmp : -cmp;
        }

        case "kebele": {
          valA = renderEnglish(a.kebele || "");
          valB = renderEnglish(b.kebele || "");
          const cmp = String(valA).localeCompare(String(valB));
          return sortDir === "asc" ? cmp : -cmp;
        }

        case "reporter": {
          valA = renderEnglish(a.reporterName || a.fullName || "");
          valB = renderEnglish(b.reporterName || b.fullName || "");
          const cmp = String(valA).localeCompare(String(valB));
          return sortDir === "asc" ? cmp : -cmp;
        }

        default:
          return 0;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter,
    agencyFilter,
    kebeleFilter,
    dateFrom,
    dateTo,
    searchQuery,
    sortCol,
    sortDir,
    reports,
    myAgencies,
  ]);

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div
      className="min-h-screen bg-[#F4F6FB] font-sans antialiased"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <div className="h-[3px] bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-9">
        {/* ══ HEADER ══ */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-9">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-blue-500">
                Live Dashboard
              </span>
            </div>
            <h1 className="text-[2.4rem] font-black tracking-tight text-slate-900 leading-none">
              Emergency Archive
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              Field intelligence &amp; incident monitoring
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total"
              value={stats.total}
              Icon={Activity}
              color="blue"
            />
            <StatCard
              label="Escalated"
              value={stats.escalated}
              Icon={TriangleAlert}
              color="rose"
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              Icon={Clock}
              color="amber"
            />
            <StatCard
              label="Resolved"
              value={stats.resolved}
              Icon={CheckCircle2}
              color="emerald"
            />
          </div>
        </div>

        {/* ══ TOOLBAR ══ */}
        <div className="flex flex-col lg:flex-row gap-3 mb-4 items-stretch lg:items-center">
          {/* Reporter tabs */}
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 gap-1 shadow-sm">
            {[
              { id: "all", label: "All" },
              {
                id: "registered",
                label: "Registered",
                icon: <Users size={11} />,
              },
              { id: "guest", label: "Guest" },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] text-[11px] font-bold uppercase tracking-widest transition-all ${
                  filter === id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search type, location, reporter…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            />
          </div>

          {/* Filters button */}
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`relative flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest border transition-all shadow-sm ${
              filtersOpen || activeFilterCount > 0
                ? "bg-blue-600 border-blue-500 text-white shadow-blue-200"
                : "bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Count chip */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <TrendingUp size={14} className="text-blue-500" />
            <span className="text-sm font-black text-slate-800 tabular-nums">
              {filteredReports.length}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              records
            </span>
          </div>
        </div>

        {/* ══ FILTER PANEL ══ */}
        {filtersOpen && (
          <div className="mb-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap gap-7 items-end">
              {/* ── Agency filter — fetched dynamically ── */}
              <div className="flex-1 min-w-[260px]">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 mb-2.5">
                  Agency
                  {myAgencies.length > 0 && (
                    <span className="ml-1.5 text-blue-400">
                      ({myAgencies.length})
                    </span>
                  )}
                </p>

                {agenciesLoading ? (
                  /* Skeleton while agencies load */
                  <div className="flex gap-2">
                    {[80, 100, 70, 90].map((w) => (
                      <div
                        key={w}
                        className="h-8 rounded-xl bg-slate-100 animate-pulse"
                        style={{ width: w }}
                      />
                    ))}
                  </div>
                ) : myAgencies.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    No agencies found for your account.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {/* "All" button */}
                    <button
                      onClick={() => setAgencyFilter("all")}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide border transition-all ${
                        agencyFilter === "all"
                          ? "bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-200"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      <Database size={12} />
                      All
                    </button>

                    {/*
                      Show ALL agencies belonging to this admin.
                      Those with a mapped agencyType (Police/Health/Fire) show
                      their type icon. Those with an unmapped or unknown type
                      fall back to a generic Building2 icon but are still shown
                      — the matchesAgency fn will return false for unmapped
                      types so their button acts as an empty filter (shows 0
                      results), which is the honest behaviour.
                    */}
                    {myAgencies.map((agency) => {
                      const agencyId = String(agency.id);
                      const agencyName = renderEnglish(agency.name);
                      const typeName = renderEnglish(
                        agency.agencyType?.name || agency.agencyTypeName || "",
                      );
                      const meta = AGENCY_TYPE_META[typeName];
                      const AgencyIcon = meta?.Icon || Building2;
                      const isActive = agencyFilter === agencyId;

                      return (
                        <button
                          key={agencyId}
                          onClick={() => setAgencyFilter(agencyId)}
                          title={`${agencyName}${typeName ? ` · ${typeName}` : ""}`}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide border transition-all ${
                            isActive
                              ? "bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-200"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
                          }`}
                        >
                          <AgencyIcon
                            size={12}
                            className={
                              isActive ? "" : meta?.color || "text-slate-400"
                            }
                          />
                          {agencyName || `Agency ${agencyId}`}
                          {typeName && (
                            <span
                              className={`ml-1 text-[9px] font-semibold opacity-60 normal-case tracking-normal`}
                            >
                              ({typeName})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Kebele */}
              <div className="min-w-[180px]">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 mb-2.5">
                  Kebele
                  {allKebeles.length > 0 && (
                    <span className="ml-1.5 text-blue-400">
                      ({allKebeles.length})
                    </span>
                  )}
                </p>
                <select
                  value={kebeleFilter}
                  onChange={(e) => setKebeleFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                >
                  {kebeleOptions.map((k) => (
                    <option key={k} value={k}>
                      {k === "all" ? "All Kebeles" : k}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div className="min-w-[155px]">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 mb-2.5">
                  From
                </p>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              {/* Date To */}
              <div className="min-w-[155px]">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 mb-2.5">
                  To
                </p>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-500 text-[11px] font-bold uppercase tracking-wide hover:bg-rose-100 transition-all"
                >
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══ TABLE ══ */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-5">
              <div className="w-9 h-9 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">
                Syncing Records
              </p>
            </div>
          ) : error ? (
            <div className="py-24 flex flex-col items-center gap-4 text-rose-500">
              <AlertCircle size={36} />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-4 text-slate-300">
              <FileText size={36} />
              <p className="text-sm font-medium text-slate-400">
                No records match your filters
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <Th
                        label="Incident"
                        col="type"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <Th
                        label="Location"
                        col="kebele"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <Th
                        label="Reporter"
                        col="reporter"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <Th
                        label="Date"
                        col="createdAt"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                      />
                      <Th
                        label="Status"
                        col="status"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSort}
                        center
                      />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => {
                      const id = report.id || report._id;
                      const typeStr = renderEnglish(
                        report.emergencyType || report.serviceType,
                      );
                      const dot = agencyDot(typeStr);
                      return (
                        <tr
                          key={id}
                          className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors group"
                        >
                          {/* Incident */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${dot}`}
                              />
                              <div>
                                <div className="font-bold text-slate-800 text-sm leading-tight">
                                  {typeStr || "—"}
                                </div>
                                <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                                  {renderEnglish(
                                    report.category || report.serviceCategory,
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-2">
                              <MapPin
                                size={13}
                                className="mt-0.5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0"
                              />
                              <span className="text-sm text-slate-600 font-medium max-w-[210px] leading-snug">
                                {[
                                  renderEnglish(report.kebele),
                                  renderEnglish(report.subdivision),
                                  renderEnglish(report.street),
                                ]
                                  .filter((v) => v?.trim())
                                  .join(", ") || "—"}
                              </span>
                            </div>
                          </td>

                          {/* Reporter */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shrink-0">
                                {renderEnglish(report.reporterName || "A")
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-700 leading-tight">
                                  {renderEnglish(
                                    report.reporterName || "Anonymous",
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">
                                  {report.reporterType || "external"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                              <Calendar size={12} className="text-slate-300" />
                              {report.createdAt
                                ? new Date(report.createdAt).toLocaleDateString(
                                    undefined,
                                    { dateStyle: "medium" },
                                  )
                                : "—"}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 text-center">
                            <StatusChip status={renderEnglish(report.status)} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <p className="text-[11px] text-slate-400 font-medium">
                  Showing{" "}
                  <span className="text-slate-600 font-bold">
                    {filteredReports.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-slate-600 font-bold">
                    {reports.length}
                  </span>{" "}
                  records
                </p>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold">
                  BahirLink Intel
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
