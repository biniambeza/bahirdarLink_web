import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Search, MapPin, Calendar, AlertCircle, FileText,
  ChevronUp, ChevronDown, ChevronsUpDown, X,
  ShieldCheck, Activity, Flame, Zap, Droplets, Building2,
  CheckCircle2, Clock, TriangleAlert, RefreshCw,
  Tag, Radio, SlidersHorizontal, ArrowUpDown,
} from "lucide-react";
import IncidentDetails from "./IncidentDetailPage";

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const getLangStr = (val) => {
  if (!val) return "";
  if (typeof val === "object") return val.en || val.name?.en || val.label?.en || val.name || "";
  if (typeof val === "string" && (val.includes('{"en":') || val.includes('{"am":'))) {
    try { return JSON.parse(val).en || ""; } catch { return val; }
  }
  return String(val);
};

const stringToHue = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
};

/* ═══════════════════════════════════════════════════════
   AGENCY CONFIG
═══════════════════════════════════════════════════════ */
const AGENCY_CONFIG = {
  police:    { Icon: ShieldCheck, color: "#1D4ED8", label: "Police"    },
  fire:      { Icon: Flame,       color: "#DC2626", label: "Fire"      },
  ambulance: { Icon: Activity,    color: "#059669", label: "Ambulance" },
  health:    { Icon: Activity,    color: "#059669", label: "Health"    },
  electric:  { Icon: Zap,         color: "#D97706", label: "Electric"  },
  water:     { Icon: Droplets,    color: "#0284C7", label: "Water"     },
  municipal: { Icon: Building2,   color: "#1D4ED8", label: "Municipal" },
};
const DEFAULT_CONFIG = { Icon: Building2, color: "#1D4ED8", label: "Agency" };

const STATUS_ORDER = {
  escalated: 0, reported: 1, pending: 2,
  in_progress: 3, ongoing: 4, completed: 5, resolved: 6,
};

const STATUS_META = {
  escalated:   { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", label: "Escalated"   },
  reported:    { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", label: "Reported"    },
  pending:     { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", label: "Pending"     },
  in_progress: { color: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD", label: "In Progress" },
  ongoing:     { color: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD", label: "Ongoing"     },
  completed:   { color: "#059669", bg: "#F0FDF4", border: "#A7F3D0", label: "Completed"   },
  resolved:    { color: "#059669", bg: "#F0FDF4", border: "#A7F3D0", label: "Resolved"    },
};
const getStatus = (s) =>
  STATUS_META[String(s || "").toLowerCase()] ||
  { color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", label: s || "Unknown" };

/* ═══════════════════════════════════════════════════════
   RESOLVE ASSIGNED STATION
═══════════════════════════════════════════════════════ */
const resolveStation = (incident) => {
  const kebeleTeam = incident.kebele?.teams?.[0];
  if (kebeleTeam) return { name: getLangStr(kebeleTeam.name), id: kebeleTeam.id, kebele: getLangStr(incident.kebele?.name) };
  const direct = incident.responderTeam || incident.assignedTeam ||
    (incident.responderTeamId ? { id: incident.responderTeamId, name: incident.responderTeamName } : null);
  if (direct?.name || direct?.id) return { name: getLangStr(direct.name) || `Team ${direct.id}`, id: direct.id, kebele: getLangStr(incident.kebele?.name) };
  return null;
};

/* ═══════════════════════════════════════════════════════
   RESOLVE CATEGORY
   Accepts an optional catMap (id → category) built from
   the fetched categories list, so bare categoryId fields
   get enriched with the real name from the API.
═══════════════════════════════════════════════════════ */
const resolveCategory = (incident, catMap = {}) => {
  // Shape 1: nested object with a populated name
  const obj = incident.category || incident.serviceCategory || null;
  if (obj) {
    const name = getLangStr(obj.name) || getLangStr(obj) || "";
    if (name) return { id: obj.id ?? null, name };
  }

  // Shape 2: flat categoryName field
  if (incident.categoryName) {
    return { id: incident.categoryId ?? null, name: getLangStr(incident.categoryName) };
  }

  // Shape 3: only an id — look it up in the fetched categories map
  const rawId =
    incident.categoryId ??
    incident.serviceCategoryId ??
    obj?.id ??
    null;

  if (rawId != null) {
    const found = catMap[String(rawId)];
    if (found) return { id: rawId, name: getLangStr(found.name) };
    return { id: rawId, name: "" };
  }

  return null;
};

/* ═══════════════════════════════════════════════════════
   CATEGORY COLOR PALETTE
═══════════════════════════════════════════════════════ */
const CAT_PALETTES = [
  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  { bg: "#F0F9FF", text: "#075985", border: "#BAE6FD" },
];
const catPalette = (name) => CAT_PALETTES[Math.abs(stringToHue(name || "")) % CAT_PALETTES.length];

/* ═══════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════ */
const StatCard = ({ label, value, Icon, color, bg, border }) => (
  <div style={{
    background: "#fff",
    border: `1px solid ${border || "#E5E7EB"}`,
    borderRadius: 14,
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  }}>
    <div style={{
      width: 42, height: 42, borderRadius: 12,
      background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{value}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   SORT HEADER
═══════════════════════════════════════════════════════ */
const SortTh = ({ label, col, sortCol, sortDir, onSort, center, style = {} }) => {
  const active = sortCol === col;
  return (
    <th
      onClick={() => onSort(col)}
      style={{
        padding: "11px 14px",
        fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase",
        color: active ? "#1D4ED8" : "#9CA3AF",
        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
        textAlign: center ? "center" : "left",
        borderBottom: "1px solid #E5E7EB",
        background: "#F9FAFB",
        transition: "color .15s",
        ...style,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label}
        {active
          ? (sortDir === "asc" ? <ChevronUp size={11} color="#1D4ED8" /> : <ChevronDown size={11} color="#1D4ED8" />)
          : <ChevronsUpDown size={11} color="#D1D5DB" />}
      </span>
    </th>
  );
};

/* ═══════════════════════════════════════════════════════
   STATION AVATAR
═══════════════════════════════════════════════════════ */
const StationAvatar = ({ name }) => {
  if (!name) return null;
  const hue = stringToHue(name);
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
      background: `hsl(${hue},60%,93%)`,
      border: `1px solid hsl(${hue},55%,82%)`,
      color: `hsl(${hue},65%,35%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 700,
    }}>
      {initials}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
const IncidentsPage = () => {
  const [emergencies,      setEmergencies]      = useState([]);
  const [categories,       setCategories]       = useState([]);
  const [responderTeams,   setResponderTeams]   = useState([]);
  const [agencyInfo,       setAgencyInfo]       = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [searchQuery,  setSearchQuery]  = useState("");
  const [teamFilter,   setTeamFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [filtersOpen,  setFiltersOpen]  = useState(false);

  const [sortCol, setSortCol] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const [isLoading,    setIsLoading]    = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error,        setError]        = useState("");

  /* ── Agency config ── */
  const agencyTypeStr = getLangStr(agencyInfo?.agencyType?.name).toLowerCase();
  const isService = useMemo(
    () => ["municipal", "electric", "water"].some((t) => agencyTypeStr.includes(t)),
    [agencyTypeStr]
  );
  const configKey = useMemo(
    () => Object.keys(AGENCY_CONFIG).find((k) => agencyTypeStr.includes(k)) || null,
    [agencyTypeStr]
  );
  const cfg = AGENCY_CONFIG[configKey] || DEFAULT_CONFIG;

  /* ── Category lookup map: id → category object ── */
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      if (cat.id   != null) map[String(cat.id)]   = cat;
      if (cat._id  != null) map[String(cat._id)]  = cat;
    });
    return map;
  }, [categories]);

  /* ── Fetch ── */
  const fetchData = async (soft = false) => {
    try {
      soft ? setIsRefreshing(true) : setIsLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const storedAgency = JSON.parse(localStorage.getItem("agency") || "{}");
      setAgencyInfo(storedAgency);

      const typeName = getLangStr(storedAgency?.agencyType?.name).toLowerCase();
      const localIsService = ["municipal", "electric", "water"].some((t) => typeName.includes(t));
      const agencyId = storedAgency.id;
      if (!agencyId) return;

      const headers = { Authorization: `Bearer ${token}` };

      const dataEndpoint = localIsService
        ? `http://localhost:5000/api/service/agency/${agencyId}`
        : `http://localhost:5000/api/emergencies/agency/${agencyId}/emergencies`;
      const catEndpoint = localIsService
        ? `http://localhost:5000/api/serviceCategory/agency/${agencyId}`
        : `http://localhost:5000/api/categories/by-agency/${agencyId}`;
      const teamsEndpoint = `http://localhost:5000/api/responderTeam/agency/${agencyId}`;

      const [dataRes, catRes, teamsRes] = await Promise.allSettled([
        axios.get(dataEndpoint,  { headers }),
        axios.get(catEndpoint,   { headers }),
        axios.get(teamsEndpoint, { headers }),
      ]);

      if (dataRes.status === "fulfilled")
        setEmergencies(dataRes.value.data.services || dataRes.value.data.data || dataRes.value.data || []);
      else setEmergencies([]);

      if (catRes.status === "fulfilled")
        setCategories(catRes.value.data.data || catRes.value.data.categories || catRes.value.data || []);
      else setCategories([]);

      if (teamsRes.status === "fulfilled") {
        const raw = teamsRes.value.data.data || teamsRes.value.data.teams || teamsRes.value.data || [];
        setResponderTeams(raw);
      } else setResponderTeams([]);

    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [isService]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const arr = Array.isArray(emergencies) ? emergencies : [];
    return {
      total:     arr.length,
      escalated: arr.filter((r) => getLangStr(r.status).toLowerCase() === "escalated").length,
      pending:   arr.filter((r) => ["pending", "reported"].includes(getLangStr(r.status).toLowerCase())).length,
      resolved:  arr.filter((r) => ["resolved", "completed"].includes(getLangStr(r.status).toLowerCase())).length,
    };
  }, [emergencies]);

  /* ── Sort ── */
  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };

  /* ── Active filter count ── */
  const activeFilterCount = [
    teamFilter !== "all",
    statusFilter !== "all",
    dateFrom !== "",
    dateTo !== "",
    selectedCategory !== null,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setTeamFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setSelectedCategory(null);
  };

  /* ── Filtered + sorted data ── */
  const filteredIncidents = useMemo(() => {
    const q    = searchQuery.toLowerCase().trim();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to   = dateTo   ? new Date(dateTo + "T23:59:59") : null;
    const arr  = Array.isArray(emergencies) ? emergencies : [];

    return [...arr
      .filter((i) => {
        if (!selectedCategory) return true;
        const cat = resolveCategory(i, categoryMap);
        return String(cat?.id) === String(selectedCategory.id);
      })
      .filter((i) => {
        if (teamFilter === "all") return true;
        const station = resolveStation(i);
        return String(station?.id) === teamFilter || station?.name?.toLowerCase() === teamFilter.toLowerCase();
      })
      .filter((i) => {
        if (statusFilter === "all") return true;
        return getLangStr(i.status).toLowerCase() === statusFilter;
      })
      .filter((i) => {
        if (!i.createdAt) return true;
        const d = new Date(i.createdAt);
        return !(from && d < from) && !(to && d > to);
      })
      .filter((i) => {
        if (!q) return true;
        const station = resolveStation(i);
        const cat = resolveCategory(i, categoryMap);
        return [
          getLangStr(i.kebele?.name || i.kebele),
          getLangStr(i.street),
          getLangStr(i.name),
          cat?.name || "",
          getLangStr(i.emergencyType?.name),
          station?.name || "",
        ].some((s) => s.toLowerCase().includes(q));
      })
    ].sort((a, b) => {
      if (sortCol === "createdAt") {
        const av = new Date(a.createdAt || 0), bv = new Date(b.createdAt || 0);
        return sortDir === "asc" ? av - bv : bv - av;
      }
      if (sortCol === "status") {
        const av = STATUS_ORDER[getLangStr(a.status).toLowerCase()] ?? 99;
        const bv = STATUS_ORDER[getLangStr(b.status).toLowerCase()] ?? 99;
        return sortDir === "asc" ? av - bv : bv - av;
      }
      if (sortCol === "station") {
        const av = resolveStation(a)?.name?.toLowerCase() || "zzz";
        const bv = resolveStation(b)?.name?.toLowerCase() || "zzz";
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (sortCol === "category") {
        const av = resolveCategory(a, categoryMap)?.name?.toLowerCase() || "zzz";
        const bv = resolveCategory(b, categoryMap)?.name?.toLowerCase() || "zzz";
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (sortCol === "location") {
        const av = getLangStr(a.kebele?.name || a.kebele).toLowerCase();
        const bv = getLangStr(b.kebele?.name || b.kebele).toLowerCase();
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return 0;
    });
  }, [emergencies, selectedCategory, teamFilter, statusFilter, dateFrom, dateTo, searchQuery, sortCol, sortDir, categoryMap]);

  const ALL_STATUSES = ["escalated","reported","pending","in_progress","ongoing","completed","resolved"];

  /* ── Shared input style ── */
  const inputStyle = {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    color: "#111827",
    fontSize: 13,
    padding: "8px 12px",
    outline: "none",
    width: "100%",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F3F4F6",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#111827",
    }}>

      {/* Top blue accent bar */}
      <div style={{ height: 4, background: "linear-gradient(90deg, #1D4ED8, #3B82F6, #60A5FA)" }} />

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>

        {/* ══ HEADER ══ */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 24, marginBottom: "2rem" }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#EFF6FF", border: "1px solid #BFDBFE",
              borderRadius: 99, padding: "3px 12px", marginBottom: 10,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#3B82F6",
                boxShadow: "0 0 0 3px #BFDBFE",
                display: "inline-block",
                animation: "pulse 2s ease-in-out infinite",
              }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: "#1D4ED8" }}>
                Live Feed
              </span>
            </div>

            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", lineHeight: 1.1, margin: 0, letterSpacing: "-.02em" }}>
              {isService ? "Service Requests" : "Incident Feed"}
            </h1>
            <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14 }}>
              {getLangStr(agencyInfo?.name)}
              {agencyInfo?.agencyType && (
                <span style={{ color: "#9CA3AF" }}> · {getLangStr(agencyInfo?.agencyType?.name)} Department</span>
              )}
            </p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(130px, 1fr))", gap: 10 }}>
            <StatCard label="Total"     value={stats.total}     Icon={Activity}      color="#1D4ED8" bg="#EFF6FF" border="#BFDBFE" />
            <StatCard label="Escalated" value={stats.escalated} Icon={TriangleAlert} color="#DC2626" bg="#FEF2F2" border="#FECACA" />
            <StatCard label="Pending"   value={stats.pending}   Icon={Clock}         color="#D97706" bg="#FFFBEB" border="#FDE68A" />
            <StatCard label="Resolved"  value={stats.resolved}  Icon={CheckCircle2}  color="#059669" bg="#F0FDF4" border="#A7F3D0" />
          </div>
        </div>

        {/* ══ TOOLBAR ══ */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10, alignItems: "center" }}>

          {/* Category tabs — fetched from API */}
          {categories.length > 0 && (
            <div style={{
              display: "flex",
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              padding: 4, gap: 3,
              overflowX: "auto", flexShrink: 0,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              {[{ id: null, name: "All" }, ...categories].map((cat) => {
                const active = cat.id === null ? !selectedCategory : selectedCategory?.id === cat.id;
                const label  = getLangStr(cat.name);
                const pal    = cat.id ? catPalette(label) : null;
                return (
                  <button
                    key={cat.id ?? "all"}
                    onClick={() => setSelectedCategory(cat.id === null ? null : cat)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                      fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase",
                      whiteSpace: "nowrap", transition: "all .15s",
                      background: active ? (pal ? pal.bg   : "#1D4ED8") : "transparent",
                      color:      active ? (pal ? pal.text : "#fff")    : "#9CA3AF",
                      outline:    active && pal ? `1px solid ${pal.border}` : "none",
                    }}>
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder="Search type, category, location, station…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          {/* Filters button */}
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            style={{
              position: "relative",
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 10, cursor: "pointer",
              fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase",
              background: filtersOpen || activeFilterCount > 0 ? "#1D4ED8" : "#fff",
              color:      filtersOpen || activeFilterCount > 0 ? "#fff"    : "#6B7280",
              border: `1px solid ${filtersOpen || activeFilterCount > 0 ? "#1D4ED8" : "#E5E7EB"}`,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              transition: "all .15s",
            }}>
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                width: 17, height: 17, borderRadius: "50%",
                background: "#DC2626", color: "#fff",
                fontSize: 9, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{activeFilterCount}</span>
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchData(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10, cursor: "pointer",
              fontSize: 11, fontWeight: 700,
              background: "#fff", color: "#6B7280",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}>
            <RefreshCw size={14} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
          </button>

          {/* Record count */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 14px",
            background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10,
          }}>
            <ArrowUpDown size={13} color="#1D4ED8" />
            <span style={{ fontSize: 15, fontWeight: 800, color: "#1D4ED8", fontVariantNumeric: "tabular-nums" }}>{filteredIncidents.length}</span>
            <span style={{ fontSize: 11, color: "#60A5FA" }}>records</span>
          </div>
        </div>

        {/* ══ FILTER PANEL ══ */}
        {filtersOpen && (
          <div style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 14,
            padding: "1.25rem 1.5rem",
            marginBottom: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-end" }}>

              {/* Station filter */}
              <div style={{ flex: "1 1 280px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                  <Radio size={11} color="#9CA3AF" /> Assigned Station
                  {responderTeams.length > 0 && <span style={{ color: "#1D4ED8", marginLeft: 4 }}>({responderTeams.length})</span>}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[
                    { id: "all", label: "All Stations" },
                    ...responderTeams.map((t) => ({ id: String(t.id || t._id), label: getLangStr(t.name) })),
                  ].map(({ id, label }) => {
                    const active = teamFilter === id;
                    const hue    = id === "all" ? 220 : stringToHue(label);
                    return (
                      <button key={id} onClick={() => setTeamFilter(id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "6px 12px", borderRadius: 8,
                          border: active ? `1px solid hsl(${hue},70%,70%)` : "1px solid #E5E7EB",
                          cursor: "pointer", fontSize: 11, fontWeight: 600,
                          background: active ? `hsl(${hue},75%,93%)` : "#F9FAFB",
                          color:      active ? `hsl(${hue},60%,30%)` : "#6B7280",
                          transition: "all .15s",
                        }}>
                        {label}
                      </button>
                    );
                  })}
                  {responderTeams.length === 0 && (
                    <p style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>No stations found for this agency</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div style={{ minWidth: 180 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10 }}>Status</p>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle}>
                  <option value="all">All Statuses</option>
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div style={{ minWidth: 145 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10 }}>From</p>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
              </div>

              {/* Date To */}
              <div style={{ minWidth: 145 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10 }}>To</p>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
              </div>

              {activeFilterCount > 0 && (
                <button onClick={clearFilters}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: 10,
                    border: "1px solid #FECACA",
                    background: "#FEF2F2", color: "#DC2626",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}>
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══ TABLE ══ */}
        <div style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          {isLoading ? (
            <div style={{ padding: "6rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 36, height: 36,
                border: "2px solid #E5E7EB",
                borderTopColor: "#1D4ED8",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }} />
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: "#9CA3AF" }}>Syncing records…</p>
            </div>
          ) : error ? (
            <div style={{ padding: "6rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#DC2626" }}>
              <AlertCircle size={36} />
              <p style={{ fontWeight: 600, fontSize: 14 }}>{error}</p>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div style={{ padding: "6rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <FileText size={36} color="#D1D5DB" />
              <p style={{ fontSize: 13, fontWeight: 500, color: "#9CA3AF" }}>No records match your filters</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters}
                  style={{
                    fontSize: 13, fontWeight: 600, padding: "8px 18px",
                    borderRadius: 10, background: "#EFF6FF",
                    color: "#1D4ED8", border: "1px solid #BFDBFE", cursor: "pointer",
                  }}>Clear filters</button>
              )}
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <SortTh label="Incident / Category" col="type"      sortCol={sortCol} sortDir={sortDir} onSort={handleSort} style={{ paddingLeft: 20 }} />
                      <SortTh label="Location"             col="location"  sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                      <SortTh label="Assigned Station"     col="station"   sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                      <SortTh label="Date"                 col="createdAt" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                      <SortTh label="Status"               col="status"    sortCol={sortCol} sortDir={sortDir} onSort={handleSort} center />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.map((incident) => {
                      const typeName = getLangStr(incident.emergencyType?.name || incident.name) || "—";

                      // ── Resolve category using the fetched categoryMap ──
                      const cat     = resolveCategory(incident, categoryMap);
                      const catName = cat?.name || "";
                      const pal     = catName ? catPalette(catName) : null;

                      const kebele     = getLangStr(incident.kebele?.name || incident.kebele);
                      const street     = getLangStr(incident.street);
                      const location   = [kebele, street].filter(Boolean).join(", ") || "—";
                      const station    = resolveStation(incident);
                      const statusMeta = getStatus(getLangStr(incident.status));

                      const enrichedIncident = {
                        ...incident,
                        resolvedCategory: cat
                          ? { id: cat.id, name: catName, palette: pal }
                          : null,
                        category: incident.category ?? (cat ? { id: cat.id, name: catName } : null),
                        serviceCategory: incident.serviceCategory ?? null,
                      };

                      return (
                        <tr
                          key={incident.id || incident._id}
                          onClick={() => setSelectedIncident(enrichedIncident)}
                          style={{
                            borderBottom: "1px solid #F3F4F6",
                            cursor: "pointer",
                            transition: "background .1s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          {/* ── COL 1: Emergency Type + Category badge ── */}
                          <td style={{ padding: "13px 14px 13px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                                background: pal ? pal.bg   : "#EFF6FF",
                                border:     `1px solid ${pal ? pal.border : "#BFDBFE"}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                <cfg.Icon size={18} color={pal ? pal.text : cfg.color} />
                              </div>

                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
                                  {typeName}
                                </div>

                                {/* Category badge — resolved from fetched categories list */}
                                {catName ? (
                                  <span style={{
                                    display: "inline-flex", alignItems: "center", gap: 4,
                                    marginTop: 5,
                                    padding: "3px 8px", borderRadius: 6,
                                    fontSize: 11, fontWeight: 600, letterSpacing: ".03em",
                                    background: pal.bg,
                                    color:      pal.text,
                                    border:     `1px solid ${pal.border}`,
                                  }}>
                                    <Tag size={9} />
                                    {catName}
                                  </span>
                                ) : (
                                  incident.subdivision ? (
                                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>
                                      {getLangStr(incident.subdivision)}
                                    </div>
                                  ) : null
                                )}
                              </div>
                            </div>
                          </td>

                          {/* ── COL 2: Location ── */}
                          <td style={{ padding: "13px 14px" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                              <MapPin size={13} color="#9CA3AF" style={{ marginTop: 1, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 400, lineHeight: 1.4, maxWidth: 180 }}>
                                {location}
                              </span>
                            </div>
                          </td>

                          {/* ── COL 3: Assigned Station ── */}
                          <td style={{ padding: "13px 14px" }}>
                            {station ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                <StationAvatar name={station.name} />
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", lineHeight: 1.3 }}>
                                    {station.name}
                                  </div>
                                  {station.kebele && (
                                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                                      <MapPin size={9} />
                                      {station.kebele}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: 11, color: "#D1D5DB", fontStyle: "italic" }}>Unassigned</span>
                            )}
                          </td>

                          {/* ── COL 4: Date ── */}
                          <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
                              <Calendar size={12} color="#D1D5DB" />
                              {incident.createdAt
                                ? new Date(incident.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })
                                : "—"}
                            </div>
                          </td>

                          {/* ── COL 5: Status ── */}
                          <td style={{ padding: "13px 14px", textAlign: "center" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              padding: "4px 10px", borderRadius: 20,
                              fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
                              background: statusMeta.bg,
                              color:      statusMeta.color,
                              border:     `1px solid ${statusMeta.border}`,
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusMeta.color, flexShrink: 0 }} />
                              {statusMeta.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div style={{
                padding: "10px 20px",
                borderTop: "1px solid #F3F4F6",
                background: "#F9FAFB",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <p style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>
                  Showing{" "}
                  <span style={{ color: "#374151", fontWeight: 700 }}>{filteredIncidents.length}</span>
                  {" "}of{" "}
                  <span style={{ color: "#374151", fontWeight: 700 }}>{emergencies.length}</span>
                  {" "}records
                </p>
                <p style={{ fontSize: 11, color: "#D1D5DB", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600 }}>
                  {getLangStr(agencyInfo?.name)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.2)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: none; opacity: .5; }
        select option { background: #fff; color: #111827; }
        * { box-sizing: border-box; }
      `}</style>

      {selectedIncident && (
        <IncidentDetails
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          isService={isService}
          categories={categories}
        />
      )}
    </div>
  );
};

export default IncidentsPage;