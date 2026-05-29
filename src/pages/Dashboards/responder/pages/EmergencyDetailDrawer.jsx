import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  X,
  MapPin,
  FileText,
  Activity,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Navigation,
  Shield,
  Info,
  ChevronRight,
  Users,
  Camera,
  Gavel,
  Home,
  Plus,
  Trash2,
  Download,
  User,
  Calendar,
  Tag,
  Layers,
  GitMerge,
  Eye,
  Image as ImageIcon,
  Hash,
  Crosshair,
  Map,
  Zap,
  Radio,
  Clock,
  Smartphone,
  AlertCircle,
  BarChart3,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import ChatTab from "./ChatTab";

const API_BASE = "https://bahirlink-backend-1.onrender.com";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const getLangStr = (val) => {
  if (!val) return "";
  if (typeof val === "string") {
    if (
      val.trim().startsWith("{") &&
      (val.includes('"en"') || val.includes('"am"'))
    ) {
      try {
        const p = JSON.parse(val);
        if (p && typeof p === "object") return p.en || p.am || val;
      } catch {
        return val;
      }
    }
    return val;
  }
  if (typeof val === "object") return val.en || val.am || "";
  return String(val);
};

function parseLocation(e) {
  if (!e) return { lat: null, lng: null };
  if (e?.latitude != null && e?.longitude != null) {
    const lat = parseFloat(e.latitude),
      lng = parseFloat(e.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (typeof e?.location === "string" && e.location.includes(",")) {
    const [a, b] = e.location.split(",");
    const lat = parseFloat(a?.trim()),
      lng = parseFloat(b?.trim());
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (
    Array.isArray(e?.location?.coordinates) &&
    e.location.coordinates.length === 2
  ) {
    const lng = parseFloat(e.location.coordinates[0]);
    const lat = parseFloat(e.location.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (e?.location?.lat != null) {
    const lat = parseFloat(e.location.lat),
      lng = parseFloat(e.location.lng);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return { lat: null, lng: null };
}

const resolveReporter = (e) => {
  if (e?.user)
    return {
      name: e.user.fullName || "Registered User",
      contact: e.user.phone || e.user.email || null,
      type: "user",
    };
  if (e?.guest)
    return {
      name: e.guest.contactNo || "Guest",
      contact: e.guest.contactNo || null,
      type: "guest",
    };
  if (e?.reporterName)
    return {
      name: e.reporterName,
      contact: null,
      type: e.reporterType || "guest",
    };
  return { name: "Unknown", contact: null, type: "guest" };
};

const resolveAllMedia = (e) => {
  const results = [];

  if (Array.isArray(e?.media)) {
    e.media.forEach((m) => {
      if (typeof m === "string" && m) results.push(m);
      else if (m?.url) results.push(m.url);
      else if (m?.path) results.push(m.path);
    });
  }

  if (e?.mediaUrl) {
    if (Array.isArray(e.mediaUrl))
      e.mediaUrl.forEach((u) => u && results.push(u));
    else if (typeof e.mediaUrl === "string") results.push(e.mediaUrl);
  }

  if (e?.mediaPath) {
    if (Array.isArray(e.mediaPath))
      e.mediaPath.forEach((u) => u && results.push(u));
    else if (typeof e.mediaPath === "string") results.push(e.mediaPath);
  }

  if (e?.attachment && typeof e.attachment === "string")
    results.push(e.attachment);
  if (e?.file && typeof e.file === "string") results.push(e.file);

  return [...new Set(results.filter(Boolean))];
};

const resolveMedia = (e) => resolveAllMedia(e)[0] || null;

const resolveCategoryName = (e) =>
  getLangStr(e?.serviceCategory?.name) ||
  getLangStr(e?.category?.name) ||
  getLangStr(e?.categoryName) ||
  getLangStr(e?.category) ||
  "General";

const resolveIncidentType = (e) =>
  getLangStr(e?.serviceType?.name) ||
  getLangStr(e?.emergencyType?.name) ||
  getLangStr(e?.emergencyType) ||
  getLangStr(e?.type) ||
  "General";

const fmtTime = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt) ? null : dt.toLocaleString();
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA URL UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const isExternalUrl = (url) =>
  typeof url === "string" && url.startsWith("http");

const guessMediaType = (url) => {
  if (!url) return "image";
  const lower = url.toLowerCase().split("?")[0];

  if (lower.includes("/video/upload/")) return "video";
  if (lower.includes("/image/upload/")) return "image";

  if (/\.(mp4|mov|avi|webm|mkv|ogv)(\b|$)/.test(lower)) return "video";
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg|avif|heic)(\b|$)/.test(lower))
    return "image";

  return "image";
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const STATUS = {
  resolved: {
    bg: "#ECFDF5",
    text: "#059669",
    border: "#D1FAE5",
    dot: "#10B981",
    pulse: false,
  },
  completed: {
    bg: "#ECFDF5",
    text: "#059669",
    border: "#D1FAE5",
    dot: "#10B981",
    pulse: false,
  },
  in_progress: {
    bg: "#FFFBEB",
    text: "#D97706",
    border: "#FEF3C7",
    dot: "#F59E0B",
    pulse: true,
  },
  assigned: {
    bg: "#EEF4FF",
    text: "#1A52C4",
    border: "#BAD1FB",
    dot: "#2563EB",
    pulse: true,
  },
  reported: {
    bg: "#EBF1FA",
    text: "#7A92B0",
    border: "#C8D8EE",
    dot: "#A8BDD8",
    pulse: false,
  },
  pending: {
    bg: "#FFFBEB",
    text: "#D97706",
    border: "#FEF3C7",
    dot: "#F59E0B",
    pulse: true,
  },
  dispatched: {
    bg: "#EDE9FE",
    text: "#7C3AED",
    border: "#DDD6FE",
    dot: "#7C3AED",
    pulse: true,
  },
  cancelled: {
    bg: "#FFF5F5",
    text: "#DC2626",
    border: "#FEE2E2",
    dot: "#EF4444",
    pulse: false,
  },
};

const STATUS_OPTIONS = [
  {
    value: "reported",
    label: "Reported",
    icon: Radio,
    color: "#7A92B0",
    bg: "#F4F7FB",
  },
  {
    value: "assigned",
    label: "Assigned",
    icon: Shield,
    color: "#1A52C4",
    bg: "#EEF4FF",
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: Zap,
    color: "#D97706",
    bg: "#FFFBEB",
  },
  {
    value: "resolved",
    label: "Resolved",
    icon: CheckCircle2,
    color: "#059669",
    bg: "#ECFDF5",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MERGED GROUP DATA HOOK
// ─────────────────────────────────────────────────────────────────────────────

function useMergedGroup(groupId, token) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    setGroup(null);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await axios.get(`${API_BASE}/api/emerged/${groupId}`, {
        headers,
      });
      const data = res.data?.data || res.data;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setGroup(data);
      } else if (Array.isArray(data)) {
        const found = data.find(
          (g) =>
            String(g.id) === String(groupId) ||
            String(g._id) === String(groupId),
        );
        if (found) setGroup(found);
        else setError(`Merged group #${groupId} not found in response.`);
      } else {
        setError("Unexpected response format from server.");
      }
    } catch (err) {
      const status = err.response?.status;

      if (status === 404) {
        try {
          const listRes = await axios.get(`${API_BASE}/api/emerged`, {
            headers,
          });
          const list = listRes.data?.data || listRes.data || [];
          const found = Array.isArray(list)
            ? list.find(
                (g) =>
                  String(g.id) === String(groupId) ||
                  String(g._id) === String(groupId),
              )
            : null;
          if (found) setGroup(found);
          else setError(`No merged group found with ID: ${groupId}`);
        } catch (listErr) {
          const msg = listErr.response?.data?.message;
          setError(
            listErr.response?.status === 401
              ? "Session expired. Please log in again."
              : msg || "Failed to load merged incident data.",
          );
        }
      } else if (status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError(
          err.response?.data?.message || "Failed to load merged incident data.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [groupId, token]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { group, loading, error, refetch: fetch };
}

// ─────────────────────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = STATUS[status?.toLowerCase()] || STATUS.pending;
  const label = status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Pending";
  return (
    <span
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
      className="inline-flex items-center gap-[6px] py-1 pl-2 pr-3 rounded-full text-[11px] font-[700] tracking-[.05em] border-[1.5px] whitespace-nowrap"
    >
      <span
        style={{ background: s.dot }}
        className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${s.pulse ? "animate-pulse" : ""}`}
      />
      {label}
    </span>
  );
}

function SectionHead({ label, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-3">
      {Icon && (
        <div className="w-[22px] h-[22px] rounded-[6px] flex-shrink-0 bg-[#EEF4FF] border border-[#DBE9FD] flex items-center justify-center">
          <Icon size={11} className="text-[#1A52C4]" />
        </div>
      )}
      <span className="text-[10px] font-[800] tracking-[.12em] uppercase text-[#1140A0]">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-[#DBE9FD] to-transparent" />
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-[14px] border-[1.5px] border-[#E4EBF5] px-4 py-1 shadow-[0_1px_6px_rgba(37,99,235,.04)] ${className}`}
    >
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono, last, accent }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div
      className={`flex gap-3 py-3 items-start ${last ? "" : "border-b border-[#F4F7FB]"}`}
    >
      <div
        className={`w-8 h-8 rounded-[9px] flex-shrink-0 flex items-center justify-center border-[1.5px] ${accent ? "bg-[#EEF4FF] border-[#DBE9FD]" : "bg-[#F4F7FB] border-[#E4EBF5]"}`}
      >
        <Icon
          size={13}
          className={accent ? "text-[#1A52C4]" : "text-[#7A92B0]"}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="m-0 text-[10px] text-[#A8BDD8] font-[700] tracking-[.1em] uppercase">
          {label}
        </p>
        <p
          className={`m-0 mt-[3px] text-[13px] text-[#0B1628] font-[500] break-words leading-[1.55] ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function Avatar({ reporter, size = 36, fontSize = 13 }) {
  const isUser = reporter.type === "user";
  return (
    <div
      style={{ width: size, height: size, fontSize }}
      className={`rounded-full flex-shrink-0 flex items-center justify-center font-[700] border-[1.5px] ${isUser ? "bg-[#DBE9FD] border-[#BAD1FB] text-[#0D2D6B]" : "bg-[#F4F7FB] border-[#C8D8EE] text-[#7A92B0]"}`}
    >
      {isUser ? (
        initials(reporter.name)
      ) : (
        <User
          style={{ width: size * 0.4, height: size * 0.4 }}
          className="text-[#7A92B0]"
        />
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-14 h-14 rounded-full bg-[#FFF5F5] border-[1.5px] border-[#FEE2E2] flex items-center justify-center">
        <AlertCircle size={24} className="text-[#DC2626]" />
      </div>
      <div className="text-center">
        <p className="m-0 text-[14px] font-[700] text-[#DC2626] mb-1">
          Failed to Load
        </p>
        <p className="m-0 text-[12px] text-[#7A92B0] leading-[1.6] max-w-[240px]">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-[#EEF4FF] border-[1.5px] border-[#DBE9FD] rounded-[10px] text-[12px] font-[700] text-[#1A52C4] cursor-pointer"
        >
          <RefreshCw size={13} /> Try Again
        </button>
      )}
    </div>
  );
}

function Spinner({ label = "Loading…" }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-[#DBE9FD] border-t-[#2563EB] animate-spin" />
        <div
          className="absolute inset-[6px] rounded-full border-[2px] border-[#EEF4FF] border-b-[#7BA7F5] animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "0.7s" }}
        />
      </div>
      <p className="text-[10px] font-[800] text-[#A8BDD8] tracking-[.15em] uppercase">
        {label}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE MEDIA ITEM
// ─────────────────────────────────────────────────────────────────────────────

function MediaItem({ mediaUrl, token, index, onOpenLightbox }) {
  const external = isExternalUrl(mediaUrl);
  const guessedType = guessMediaType(mediaUrl);

  const [imgError, setImgError] = useState(false);

  const [blobState, setBlobState] = useState({
    url: null,
    type: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!mediaUrl || external) return;
    let cancelled = false;
    setBlobState({ url: null, type: null, loading: true, error: null });

    (async () => {
      try {
        const full = `${API_BASE}/${mediaUrl.replace(/^\//, "")}`;
        const res = await axios.get(full, {
          responseType: "blob",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!cancelled) {
          setBlobState({
            url: URL.createObjectURL(res.data),
            type: res.headers["content-type"] || "",
            loading: false,
            error: null,
          });
        }
      } catch {
        if (!cancelled)
          setBlobState({
            url: null,
            type: null,
            loading: false,
            error: "Unavailable",
          });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mediaUrl, token, external]);

  if (external) {
    if (imgError) {
      return (
        <div className="rounded-[10px] overflow-hidden bg-[#F4F7FB] border border-[#E4EBF5] h-[90px] flex flex-col items-center justify-center gap-1">
          <ImageIcon size={18} className="text-[#C8D8EE]" />
          <span className="text-[9px] text-[#A8BDD8] font-[600]">
            Unavailable
          </span>
        </div>
      );
    }

    if (guessedType === "video") {
      return (
        <div className="rounded-[10px] overflow-hidden border border-[#E4EBF5] col-span-2">
          <video
            src={mediaUrl}
            controls
            className="w-full max-h-[200px] block"
          />
        </div>
      );
    }

    return (
      <div
        className="rounded-[10px] overflow-hidden border border-[#E4EBF5] h-[90px] relative group cursor-zoom-in"
        onClick={() => onOpenLightbox && onOpenLightbox(mediaUrl, index)}
      >
        <img
          src={mediaUrl}
          alt={`Media ${index + 1}`}
          className="w-full h-full object-cover block"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Eye
            size={16}
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
          />
        </div>
      </div>
    );
  }

  if (blobState.loading) {
    return (
      <div className="rounded-[10px] overflow-hidden bg-[#F4F7FB] border border-[#E4EBF5] h-[90px] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[#DBE9FD] border-t-[#2563EB] animate-spin" />
      </div>
    );
  }

  if (blobState.error || !blobState.url) {
    return (
      <div className="rounded-[10px] overflow-hidden bg-[#F4F7FB] border border-[#E4EBF5] h-[90px] flex flex-col items-center justify-center gap-1">
        <ImageIcon size={18} className="text-[#C8D8EE]" />
        <span className="text-[9px] text-[#A8BDD8] font-[600]">
          {blobState.error || "No media"}
        </span>
      </div>
    );
  }

  const isImage = blobState.type?.startsWith("image");
  const isVideo = blobState.type?.startsWith("video");

  if (isImage) {
    return (
      <div
        className="rounded-[10px] overflow-hidden border border-[#E4EBF5] h-[90px] relative group cursor-zoom-in"
        onClick={() => onOpenLightbox && onOpenLightbox(blobState.url, index)}
      >
        <img
          src={blobState.url}
          alt={`Media ${index + 1}`}
          className="w-full h-full object-cover block"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Eye
            size={16}
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
          />
        </div>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="rounded-[10px] overflow-hidden border border-[#E4EBF5] col-span-2">
        <video
          src={blobState.url}
          controls
          className="w-full max-h-[200px] block"
        />
      </div>
    );
  }

  return (
    <a
      href={blobState.url}
      download
      className="rounded-[10px] border border-[#DBE9FD] bg-[#EEF4FF] h-[90px] flex flex-col items-center justify-center gap-1 no-underline"
    >
      <Download size={16} className="text-[#2563EB]" />
      <span className="text-[9px] font-[700] text-[#4A80F0]">
        Download #{index + 1}
      </span>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA GALLERY
// ─────────────────────────────────────────────────────────────────────────────

function MediaGallery({ mediaUrls, token }) {
  const [lightbox, setLightbox] = useState({ open: false, url: null });

  if (!mediaUrls || mediaUrls.length === 0) return null;

  return (
    <>
      <div
        className={`grid gap-2 ${mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
      >
        {mediaUrls.map((url, i) => (
          <MediaItem
            key={url + i}
            mediaUrl={url}
            token={token}
            index={i}
            onOpenLightbox={(resolvedUrl) =>
              setLightbox({ open: true, url: resolvedUrl })
            }
          />
        ))}
      </div>

      <AnimatePresence>
        {lightbox.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox({ open: false, url: null })}
            className="fixed inset-0 bg-[rgba(5,15,40,.94)] z-[300] flex items-center justify-center cursor-zoom-out"
          >
            <img
              src={lightbox.url}
              alt=""
              className="max-w-[95vw] max-h-[95vh] object-contain rounded-[10px]"
            />
            <button
              onClick={() => setLightbox({ open: false, url: null })}
              className="absolute top-5 right-5 bg-white/10 border border-white/20 rounded-[10px] p-[10px] cursor-pointer text-white hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA VIEWER
// ─────────────────────────────────────────────────────────────────────────────

function MediaViewer({ mediaUrl, token }) {
  const external = isExternalUrl(mediaUrl);
  const guessedType = guessMediaType(mediaUrl);
  const [lightbox, setLightbox] = useState(false);
  const [imgError, setImgError] = useState(false);

  const [blobState, setBlobState] = useState({
    url: null,
    type: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!mediaUrl || external) return;
    let cancelled = false;
    setBlobState({ url: null, type: null, loading: true, error: null });

    (async () => {
      try {
        const full = mediaUrl.startsWith("http")
          ? mediaUrl
          : `${API_BASE}/${mediaUrl.replace(/^\//, "")}`;
        const res = await axios.get(full, {
          responseType: "blob",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!cancelled) {
          setBlobState({
            url: URL.createObjectURL(res.data),
            type: res.headers["content-type"] || "",
            loading: false,
            error: null,
          });
        }
      } catch {
        if (!cancelled)
          setBlobState({
            url: null,
            type: null,
            loading: false,
            error: "Media unavailable",
          });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mediaUrl, token, external]);

  if (!mediaUrl) return null;

  if (external) {
    if (imgError) {
      return (
        <div className="rounded-[14px] overflow-hidden border-[1.5px] border-[#E4EBF5] bg-[#F4F7FB] min-h-[140px] flex items-center justify-center">
          <div className="text-[#A8BDD8] text-[13px] p-8 text-center flex flex-col items-center gap-2">
            <ImageIcon size={26} className="opacity-30" />
            <p className="m-0 font-[600] text-[12px]">Media unavailable</p>
          </div>
        </div>
      );
    }

    if (guessedType === "video") {
      return (
        <div className="rounded-[14px] overflow-hidden border-[1.5px] border-[#E4EBF5]">
          <video
            src={mediaUrl}
            controls
            className="w-full max-h-[260px] block"
          />
        </div>
      );
    }

    return (
      <>
        <div className="rounded-[14px] overflow-hidden border-[1.5px] border-[#E4EBF5] bg-[#F4F7FB] relative">
          <img
            src={mediaUrl}
            alt="Evidence"
            onClick={() => setLightbox(true)}
            className="w-full max-h-[260px] object-cover block cursor-zoom-in"
            onError={() => setImgError(true)}
          />
          <button
            onClick={() => setLightbox(true)}
            className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border-[1.5px] border-[#E4EBF5] rounded-[9px] px-3 py-[6px] flex items-center gap-[5px] text-[11px] text-[#1A52C4] cursor-pointer font-[700]"
          >
            <Eye size={11} /> View Full
          </button>
        </div>

        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox(false)}
              className="fixed inset-0 bg-[rgba(5,15,40,.94)] z-[300] flex items-center justify-center cursor-zoom-out"
            >
              <img
                src={mediaUrl}
                alt=""
                className="max-w-[95vw] max-h-[95vh] object-contain rounded-[10px]"
              />
              <button
                onClick={() => setLightbox(false)}
                className="absolute top-5 right-5 bg-white/10 border border-white/20 rounded-[10px] p-[10px] cursor-pointer text-white hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  const isImage = blobState.type?.startsWith("image");
  const isVideo = blobState.type?.startsWith("video");

  return (
    <>
      <div className="rounded-[14px] overflow-hidden border-[1.5px] border-[#E4EBF5] bg-[#F4F7FB] min-h-[140px] flex items-center justify-center relative">
        {blobState.loading && (
          <div className="flex flex-col items-center gap-3 p-8">
            <div className="w-7 h-7 rounded-full border-[3px] border-[#DBE9FD] border-t-[#2563EB] animate-spin" />
            <span className="text-[#7A92B0] text-[11px] font-[500]">
              Loading media…
            </span>
          </div>
        )}
        {blobState.error && (
          <div className="text-[#A8BDD8] text-[13px] p-8 text-center flex flex-col items-center gap-2">
            <ImageIcon size={26} className="opacity-30" />
            <p className="m-0 font-[600] text-[12px]">{blobState.error}</p>
          </div>
        )}
        {!blobState.loading && !blobState.error && blobState.url && isImage && (
          <>
            <img
              src={blobState.url}
              alt="Evidence"
              onClick={() => setLightbox(true)}
              className="w-full max-h-[260px] object-cover block cursor-zoom-in"
            />
            <button
              onClick={() => setLightbox(true)}
              className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border-[1.5px] border-[#E4EBF5] rounded-[9px] px-3 py-[6px] flex items-center gap-[5px] text-[11px] text-[#1A52C4] cursor-pointer font-[700]"
            >
              <Eye size={11} /> View Full
            </button>
          </>
        )}
        {!blobState.loading && !blobState.error && blobState.url && isVideo && (
          <video
            src={blobState.url}
            controls
            className="w-full max-h-[260px] block"
          />
        )}
        {!blobState.loading &&
          !blobState.error &&
          blobState.url &&
          !isImage &&
          !isVideo && (
            <a
              href={blobState.url}
              download
              className="text-[#2563EB] text-[13px] p-8 flex items-center gap-2 font-[700]"
            >
              <Download size={15} /> Download Attachment
            </a>
          )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 bg-[rgba(5,15,40,.94)] z-[300] flex items-center justify-center cursor-zoom-out"
          >
            <img
              src={blobState.url}
              alt=""
              className="max-w-[95vw] max-h-[95vh] object-contain rounded-[10px]"
            />
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-5 right-5 bg-white/10 border border-white/20 rounded-[10px] p-[10px] cursor-pointer text-white hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAP PREVIEW
// ─────────────────────────────────────────────────────────────────────────────

function MapPreview({ lat, lng }) {
  if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) return null;
  const pad = 0.005;
  return (
    <div>
      <div className="rounded-[14px] overflow-hidden border-[1.5px] border-[#E4EBF5] relative h-[180px] bg-[#F4F7FB]">
        <iframe
          title="Location Map"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - pad},${lat - pad},${lng + pad},${lat + pad}&layer=mapnik&marker=${lat},${lng}`}
          className="w-full h-full border-none block"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
      </div>
      <div className="flex gap-2 mt-2">
        <div className="flex-1 bg-[#EEF4FF] border-[1.5px] border-[#DBE9FD] rounded-[12px] p-[9px_13px] flex items-center gap-[9px]">
          <div className="w-[28px] h-[28px] rounded-[8px] bg-[#DBE9FD] flex items-center justify-center flex-shrink-0">
            <Crosshair size={12} className="text-[#1A52C4]" />
          </div>
          <div>
            <div className="text-[9px] font-[800] text-[#4A80F0] tracking-[.1em] uppercase mb-[1px]">
              GPS
            </div>
            <div className="text-[11px] font-[700] text-[#0D2D6B] font-mono">
              {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
            </div>
          </div>
        </div>
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}&z=16`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 px-4 bg-[#1A52C4] rounded-[12px] text-white no-underline text-[9px] font-[800] tracking-[.08em] uppercase"
        >
          <Navigation size={14} /> Maps
        </a>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 px-3 bg-white rounded-[12px] border-[1.5px] border-[#E4EBF5] text-[#4A607F] no-underline text-[9px] font-[700] tracking-[.08em] uppercase"
        >
          <Map size={14} /> OSM
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF DOWNLOAD BLOCK
// ─────────────────────────────────────────────────────────────────────────────

function PDFBlock({ onDownload, isDownloading }) {
  return (
    <div className="bg-[#ECFDF5] rounded-[16px] border-[1.5px] border-[#D1FAE5] p-[18px]">
      <div className="flex items-center gap-[10px] mb-4">
        <div className="w-8 h-8 rounded-[9px] bg-[#D1FAE5] flex items-center justify-center">
          <CheckCircle2 size={15} className="text-[#059669]" />
        </div>
        <div>
          <p className="m-0 text-[12px] font-[800] text-[#059669]">
            Case Finalized
          </p>
          <p className="m-0 text-[11px] text-[#10B981]">
            Official consolidated report is ready
          </p>
        </div>
      </div>
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className={`w-full flex items-center justify-center gap-2 py-[13px] border-none rounded-[11px] text-[12px] font-[800] transition-opacity ${isDownloading ? "bg-[#D1FAE5] text-[#059669] cursor-not-allowed opacity-70" : "bg-[#059669] text-white cursor-pointer hover:opacity-90"}`}
      >
        {isDownloading ? (
          <>
            <div className="w-[14px] h-[14px] rounded-full border-2 border-[#D1FAE5] border-t-[#059669] animate-spin" />{" "}
            Generating…
          </>
        ) : (
          <>
            <Download size={14} /> Download Official PDF
          </>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MERGED DETAILS TAB
// ─────────────────────────────────────────────────────────────────────────────

function MergedTab({
  groupId,
  localStatus,
  onDownloadPDF,
  isDownloading,
  token,
}) {
  const { group, loading, error, refetch } = useMergedGroup(groupId, token);
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (loading) return <Spinner label="Loading merged data…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!group) return null;

  const reports = group.emergencies || [];
  const kebeleName =
    getLangStr(group.kebele?.name) ||
    (group.kebeleId ? `Kebele ${group.kebeleId}` : "Unknown");
  const subdivision = getLangStr(group.subdivision) || "—";
  const street = group.street || null;
  const summary = getLangStr(group.summary);

  const categories = [
    ...new Set(reports.map((e) => getLangStr(e.category)).filter(Boolean)),
  ];
  const types = [
    ...new Set(reports.map((e) => getLangStr(e.emergencyType)).filter(Boolean)),
  ];
  const statusCounts = reports.reduce((acc, e) => {
    const s = e.status || "unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const firstWithLoc = reports.find((e) => parseLocation(e).lat !== null);
  const { lat: mapLat, lng: mapLng } = firstWithLoc
    ? parseLocation(firstWithLoc)
    : { lat: null, lng: null };

  const sel = reports[selectedIdx] || null;
  const selReporter = sel ? resolveReporter(sel) : null;
  const selMediaUrls = sel ? resolveAllMedia(sel) : [];
  const { lat: selLat, lng: selLng } = sel
    ? parseLocation(sel)
    : { lat: null, lng: null };

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-5 pb-16">
        {/* Hero */}
        <div className="rounded-[20px] overflow-hidden border-[1.5px] border-[#BAD1FB] bg-gradient-to-br from-[#0D2D6B] via-[#1A52C4] to-[#2563EB] p-[22px] relative mb-5 shadow-[0_8px_32px_rgba(37,99,235,.22)]">
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/[.05] pointer-events-none" />
          <div className="absolute -bottom-8 left-10 w-28 h-28 rounded-full bg-white/[.04] pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-[7px] bg-white/[.15] backdrop-blur-sm border border-white/[.25] rounded-[10px] py-[6px] px-3 text-[11px] font-[800] text-white tracking-[.05em]">
              <GitMerge size={12} /> {reports.length} MERGED REPORTS
            </div>
            <StatusBadge status={localStatus} />
          </div>

          <h2 className="m-0 mb-1 text-[21px] font-[900] text-white tracking-[-0.5px] leading-[1.2]">
            {kebeleName}
          </h2>
          <p className="m-0 text-[13px] text-white/[.65] flex items-center gap-[6px] mb-4">
            <MapPin size={12} className="text-white/[.5]" />
            {subdivision}
            {street ? ` · ${street}` : ""}
          </p>

          <div className="flex gap-2 flex-wrap">
            {Object.entries(statusCounts).map(([s, count]) => {
              const cfg = STATUS[s] || STATUS.pending;
              return (
                <div
                  key={s}
                  className="inline-flex items-center gap-[5px] border rounded-full py-[4px] pl-[7px] pr-[10px] text-[10px] font-[700] text-white"
                  style={{
                    background: "rgba(255,255,255,.12)",
                    borderColor: "rgba(255,255,255,.2)",
                  }}
                >
                  <span
                    style={{ background: cfg.dot }}
                    className="w-[6px] h-[6px] rounded-full"
                  />
                  {count} {s.replace(/_/g, " ")}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <>
            <SectionHead label="Group summary" icon={FileText} />
            <div className="bg-[#EEF4FF] rounded-[14px] p-[15px_18px] border-[1.5px] border-l-[4px] border-[#DBE9FD] border-l-[#2563EB]">
              <p className="m-0 text-[13px] text-[#1E3251] leading-[1.8] italic">
                "{summary}"
              </p>
            </div>
          </>
        )}

        {/* Group meta */}
        <SectionHead label="Group details" icon={Info} />
        <Card>
          <InfoRow
            icon={Hash}
            label="Group ID"
            value={String(group.id || group._id || "")
              .slice(-8)
              .toUpperCase()}
            mono
            accent
          />
          <InfoRow
            icon={Users}
            label="Total reports"
            value={String(reports.length)}
          />
          <InfoRow
            icon={Tag}
            label="Categories"
            value={categories.join(", ") || "General"}
          />
          <InfoRow
            icon={Layers}
            label="Incident types"
            value={types.join(", ") || "General"}
          />
          <InfoRow
            icon={Calendar}
            label="Created"
            value={fmtTime(group.createdAt)}
          />
          <InfoRow icon={MapPin} label="Kebele" value={kebeleName} />
          <InfoRow icon={MapPin} label="Subdivision" value={subdivision} />
          <InfoRow icon={MapPin} label="Street" value={street} last />
        </Card>

        {/* Map */}
        {mapLat !== null && (
          <>
            <SectionHead label="Incident location" icon={MapPin} />
            <MapPreview lat={mapLat} lng={mapLng} />
          </>
        )}

        {/* Individual reports */}
        {reports.length > 0 && (
          <>
            <SectionHead
              label={`Individual reports (${reports.length})`}
              icon={BarChart3}
            />

            <div
              className="flex gap-2 overflow-x-auto pb-2 mb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {reports.map((em, i) => {
                const rep = resolveReporter(em);
                const isActive = i === selectedIdx;
                const sCfg = STATUS[em.status] || STATUS.pending;
                const mediaCount = resolveAllMedia(em).length;
                return (
                  <button
                    key={em.id || em._id || i}
                    onClick={() => setSelectedIdx(i)}
                    style={
                      isActive
                        ? {
                            borderColor: "#4A80F0",
                            background: "#EEF4FF",
                            boxShadow: "0 0 0 3px #DBE9FD",
                          }
                        : { borderColor: "#E4EBF5", background: "white" }
                    }
                    className="inline-flex items-center gap-2 py-2 pl-[9px] pr-[13px] rounded-[12px] border-[1.5px] cursor-pointer flex-shrink-0 transition-all font-[inherit]"
                  >
                    <Avatar reporter={rep} size={27} fontSize={10} />
                    <div className="text-left">
                      <p
                        className={`m-0 text-[12px] font-[700] max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap ${isActive ? "text-[#1140A0]" : "text-[#1E3251]"}`}
                      >
                        {rep.name}
                      </p>
                      <div className="flex items-center gap-1 mt-[1px]">
                        <span
                          style={{ background: sCfg.dot }}
                          className="w-[5px] h-[5px] rounded-full"
                        />
                        <p
                          className={`m-0 text-[10px] ${isActive ? "text-[#4A80F0]" : "text-[#A8BDD8]"}`}
                        >
                          Report #{i + 1}
                        </p>
                        {mediaCount > 0 && (
                          <span className="inline-flex items-center gap-[3px] bg-[#DBE9FD] text-[#1A52C4] rounded-full px-[5px] py-[1px] text-[9px] font-[700]">
                            <Camera size={7} />
                            {mediaCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {sel && (
              <motion.div
                key={selectedIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16 }}
                className="mt-3 border-[1.5px] border-[#DBE9FD] rounded-[18px] overflow-hidden bg-white shadow-[0_2px_16px_rgba(37,99,235,.07)]"
              >
                <div className="flex items-center gap-3 p-[13px_16px] bg-[#EEF4FF] border-b-[1.5px] border-[#DBE9FD]">
                  <Avatar reporter={selReporter} size={38} fontSize={14} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-[2px]">
                      <p className="m-0 text-[14px] font-[800] text-[#0B1628] truncate">
                        {selReporter.name}
                      </p>
                      <StatusBadge status={sel.status} />
                    </div>
                    <p className="m-0 text-[11px] text-[#4A80F0] flex items-center gap-1">
                      {selReporter.type === "user" ? (
                        <User size={9} />
                      ) : (
                        <Smartphone size={9} />
                      )}
                      {selReporter.type === "user"
                        ? "Registered user"
                        : "Guest reporter"}
                      {selReporter.contact && (
                        <>
                          <span className="text-[#C8D8EE]">·</span>
                          {selReporter.contact}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-[9px] font-mono text-[#A8BDD8] font-[600] bg-white border border-[#E4EBF5] rounded-[6px] px-[6px] py-[3px] flex-shrink-0">
                    #
                    {String(sel.id || sel._id || "")
                      .slice(-8)
                      .toUpperCase()}
                  </div>
                </div>

                <div className="p-[13px_16px]">
                  {(sel.description || sel.summary) && (
                    <div className="bg-[#EEF4FF] rounded-[10px] p-[11px_14px] border-[1.5px] border-l-[3px] border-[#DBE9FD] border-l-[#2563EB] mb-4">
                      <p className="m-0 text-[10px] font-[800] text-[#4A80F0] tracking-[.08em] uppercase mb-1">
                        Narrative
                      </p>
                      <p className="m-0 text-[13px] text-[#1E3251] leading-[1.75] italic">
                        "{getLangStr(sel.description || sel.summary)}"
                      </p>
                    </div>
                  )}

                  {selMediaUrls.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-[7px] mb-2">
                        <div className="w-[18px] h-[18px] rounded-[5px] bg-[#EEF4FF] border border-[#DBE9FD] flex items-center justify-center flex-shrink-0">
                          <Camera size={9} className="text-[#1A52C4]" />
                        </div>
                        <span className="text-[10px] font-[800] tracking-[.1em] uppercase text-[#4A80F0]">
                          Media evidence
                        </span>
                        <span className="inline-flex items-center bg-[#DBE9FD] text-[#1A52C4] rounded-full px-[7px] py-[2px] text-[9px] font-[800]">
                          {selMediaUrls.length}{" "}
                          {selMediaUrls.length === 1 ? "file" : "files"}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#DBE9FD] to-transparent" />
                      </div>
                      <MediaGallery mediaUrls={selMediaUrls} token={token} />
                    </div>
                  )}

                  {selMediaUrls.length === 0 && (
                    <div className="mb-4 flex items-center gap-2 p-[10px_13px] bg-[#F4F7FB] rounded-[10px] border border-dashed border-[#C8D8EE]">
                      <ImageIcon
                        size={13}
                        className="text-[#C8D8EE] flex-shrink-0"
                      />
                      <span className="text-[11px] text-[#A8BDD8] font-[500]">
                        No media attached to this report
                      </span>
                    </div>
                  )}

                  <div className="bg-[#F8FAFD] rounded-[12px] border-[1.5px] border-[#E4EBF5] px-4 py-1 mb-4">
                    <InfoRow
                      icon={Tag}
                      label="Category"
                      value={getLangStr(sel.category)}
                      accent
                    />
                    <InfoRow
                      icon={Layers}
                      label="Emergency type"
                      value={getLangStr(sel.emergencyType)}
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Reported at"
                      value={fmtTime(sel.createdAt)}
                    />
                    <InfoRow
                      icon={Clock}
                      label="Time"
                      value={sel.time || null}
                    />
                    <InfoRow
                      icon={MapPin}
                      label="Subdivision"
                      value={getLangStr(sel.subdivision)}
                    />
                    <InfoRow
                      icon={MapPin}
                      label="Street"
                      value={sel.street}
                      last
                    />
                  </div>

                  {selLat !== null && (
                    <div className="mb-1">
                      <p className="text-[10px] font-[800] text-[#7A92B0] tracking-[.1em] uppercase mb-2">
                        Report location
                      </p>
                      <MapPreview lat={selLat} lng={selLng} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}

        {localStatus === "resolved" && (
          <>
            <SectionHead label="Official record" icon={FileCheck} />
            <PDFBlock
              onDownload={onDownloadPDF}
              isDownloading={isDownloading}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE DETAILS TAB
// ─────────────────────────────────────────────────────────────────────────────

function DetailsTab({
  emergency: e,
  localStatus,
  onDownloadPDF,
  isDownloading,
  token,
  isService,
}) {
  const { lat, lng } = parseLocation(e);
  const reporter = resolveReporter(e);
  const mediaUrl = resolveMedia(e);

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-5 pb-12">
        {/* Hero */}
        <div className="rounded-[18px] overflow-hidden border-[1.5px] border-[#BAD1FB] bg-gradient-to-br from-[#1A52C4] to-[#0D2D6B] p-[22px] relative shadow-[0_8px_32px_rgba(37,99,235,.19)] mb-1">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[.06] pointer-events-none" />
          <div className="flex justify-between items-start mb-[18px]">
            <div className="w-[46px] h-[46px] rounded-[13px] bg-white/[.15] border-[1.5px] border-white/[.25] flex items-center justify-center">
              <AlertTriangle size={22} className="text-white" />
            </div>
            <StatusBadge status={localStatus} />
          </div>
          <h2 className="m-0 mb-[5px] text-[20px] font-[800] text-white tracking-[-0.4px]">
            {getLangStr(e.kebele?.name) || "Unknown Location"}
          </h2>
          <p className="m-0 text-[13px] text-white/[.65] flex items-center gap-[5px]">
            <MapPin size={12} className="text-white/[.5]" />
            {getLangStr(e.subdivision) ||
              getLangStr(e.address) ||
              "No subdivision specified"}
          </p>
        </div>

        {mediaUrl && (
          <>
            <SectionHead label="Media evidence" icon={Camera} />
            <MediaViewer mediaUrl={mediaUrl} token={token} />
          </>
        )}

        {e.description && (
          <>
            <SectionHead
              label={isService ? "Service narrative" : "Incident narrative"}
              icon={FileText}
            />
            <div className="bg-[#EEF4FF] rounded-[12px] p-[15px_18px] border-[1.5px] border-l-4 border-[#DBE9FD] border-l-[#2563EB]">
              <p className="m-0 text-[13px] text-[#1E3251] leading-[1.8] italic">
                "{getLangStr(e.description)}"
              </p>
            </div>
          </>
        )}

        <SectionHead
          label={isService ? "Service details" : "Incident details"}
          icon={Info}
        />
        <Card>
          <InfoRow
            icon={Hash}
            label={isService ? "Service ID" : "Incident ID"}
            value={String(e._id || e.id || "")
              .slice(-12)
              .toUpperCase()}
            mono
            accent
          />
          <InfoRow
            icon={Tag}
            label="Category"
            value={resolveCategoryName(e)}
            accent
          />
          <InfoRow icon={Layers} label="Type" value={resolveIncidentType(e)} />
          <InfoRow
            icon={Activity}
            label="Status"
            value={localStatus?.replace(/_/g, " ")}
          />
          <InfoRow
            icon={Calendar}
            label="Reported at"
            value={fmtTime(e.createdAt)}
          />
          <InfoRow
            icon={Calendar}
            label="Last updated"
            value={fmtTime(e.updatedAt)}
            last
          />
        </Card>

        <SectionHead label="Location" icon={MapPin} />
        <Card className="mb-3">
          <InfoRow
            icon={MapPin}
            label="Kebele"
            value={getLangStr(e.kebele?.name)}
            accent
          />
          <InfoRow
            icon={MapPin}
            label="Subdivision"
            value={getLangStr(e.subdivision)}
          />
          <InfoRow icon={MapPin} label="Street" value={e.street} last />
        </Card>
        <MapPreview lat={lat} lng={lng} />

        {(e.user || e.guest) && (
          <>
            <SectionHead label="Reporter" icon={User} />
            <div className="flex items-center gap-3 p-[12px_14px] bg-white border-[1.5px] border-[#E4EBF5] rounded-[12px]">
              <Avatar reporter={reporter} size={40} fontSize={14} />
              <div>
                <p className="m-0 text-[14px] font-[700] text-[#0B1628]">
                  {reporter.name}
                </p>
                <p className="mt-[2px] mb-0 text-[11px] text-[#A8BDD8] flex items-center gap-1">
                  {reporter.type === "user" ? (
                    <User size={9} />
                  ) : (
                    <Smartphone size={9} />
                  )}
                  {reporter.type === "user" ? "Registered user" : "Guest"}
                  {reporter.contact && ` · ${reporter.contact}`}
                </p>
              </div>
            </div>
          </>
        )}

        {localStatus === "resolved" && !isService && (
          <>
            <SectionHead label="Official record" icon={Shield} />
            <PDFBlock
              onDownload={onDownloadPDF}
              isDownloading={isDownloading}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS TAB
// ─────────────────────────────────────────────────────────────────────────────

function ActionsTab({ currentStatus, onUpdateStatus, isService }) {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [form, setForm] = useState({
    incidentSummary: "",
    injuredCount: 0,
    deceasedCount: 0,
    witnesses: [""],
    suspects: [""],
    propertyDamage: "",
    propertyDamageValue: 0,
  });

  const isResolved = currentStatus === "resolved";

  const addRow = (f) => setForm((p) => ({ ...p, [f]: [...p[f], ""] }));
  const removeRow = (f, i) => {
    const a = form[f].filter((_, j) => j !== i);
    setForm((p) => ({ ...p, [f]: a.length ? a : [""] }));
  };
  const setDynamic = (f, i, v) => {
    const a = [...form[f]];
    a[i] = v;
    setForm((p) => ({ ...p, [f]: a }));
  };

  const inputCls =
    "w-full bg-white border-[1.5px] border-[#E4EBF5] rounded-[10px] py-[10px] pr-3 pl-[38px] text-[13px] text-[#0B1628] outline-none box-border font-[inherit] transition-[border-color_.15s,box-shadow_.15s] focus:border-[#7BA7F5] focus:shadow-[0_0_0_3px_#DBE9FD]";
  const labelCls =
    "block mb-[6px] text-[10px] font-[800] text-[#7A92B0] tracking-[.1em] uppercase";

  const handleFinalize = () => {
    onUpdateStatus("resolved", {
      ...form,
      witnesses: form.witnesses.filter((w) => w.trim()),
      suspects: form.suspects.filter((s) => s.trim()),
    });
  };

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-5 pb-12">
        <div className="flex items-center gap-[10px] mb-5 p-[14px_16px] rounded-[13px] bg-[#EEF4FF] border-[1.5px] border-[#DBE9FD]">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-[#DBE9FD] flex items-center justify-center flex-shrink-0">
            <ClipboardList size={16} className="text-[#1A52C4]" />
          </div>
          <div>
            <p className="m-0 text-[13px] font-[800] text-[#0D2D6B]">
              Status Management
            </p>
            <p className="m-0 text-[11px] text-[#4A80F0]">
              Update the operational status of this{" "}
              {isService ? "service assignment" : "emergency"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-5">
          {STATUS_OPTIONS.map((opt) => {
            const isCurrent = currentStatus === opt.value;
            return (
              <button
                key={opt.value}
                disabled={isCurrent || isResolved}
                onClick={() =>
                  opt.value === "resolved"
                    ? setIsFinalizing(true)
                    : onUpdateStatus(opt.value)
                }
                style={{
                  borderColor: isCurrent ? `${opt.color}44` : "#E4EBF5",
                  background: isCurrent ? opt.bg : "#FFFFFF",
                }}
                className={`flex items-center justify-between p-[13px_16px] rounded-[13px] border-[1.5px] font-[inherit] transition-opacity ${isCurrent || isResolved ? "cursor-not-allowed" : "cursor-pointer hover:border-[#BAD1FB]"} ${isResolved && !isCurrent ? "opacity-30" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      background: isCurrent ? `${opt.color}18` : "#F4F7FB",
                      borderColor: isCurrent ? `${opt.color}33` : "#E4EBF5",
                    }}
                    className="w-[36px] h-[36px] rounded-[10px] border-[1.5px] flex items-center justify-center"
                  >
                    <opt.icon
                      size={16}
                      style={{ color: isCurrent ? opt.color : "#7A92B0" }}
                    />
                  </div>
                  <div className="text-left">
                    <span
                      className="block font-[700] text-[14px]"
                      style={{ color: isCurrent ? opt.color : "#0B1628" }}
                    >
                      {opt.label}
                    </span>
                    {isCurrent && (
                      <span
                        className="text-[11px] opacity-70"
                        style={{ color: opt.color }}
                      >
                        Currently active
                      </span>
                    )}
                  </div>
                </div>
                {isCurrent ? (
                  <CheckCircle2 size={18} style={{ color: opt.color }} />
                ) : (
                  <ChevronRight size={16} className="text-[#A8BDD8]" />
                )}
              </button>
            );
          })}
        </div>

        {isResolved && (
          <div className="flex items-center gap-3 p-[14px_16px] bg-[#ECFDF5] rounded-[12px] border-[1.5px] border-[#D1FAE5]">
            <CheckCircle2 size={18} className="text-[#059669]" />
            <p className="m-0 text-[12px] font-[700] text-[#059669]">
              Case Finalized &amp; Closed
            </p>
          </div>
        )}

        <AnimatePresence>
          {isFinalizing && !isResolved && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="pt-5 border-t-[1.5px] border-[#E4EBF5] mt-2"
            >
              <div className="flex items-center gap-[10px] p-[12px_15px] mb-5 bg-[#FFFBEB] rounded-[11px] border-[1.5px] border-[#FEF3C7]">
                <div className="w-[28px] h-[28px] rounded-[8px] flex-shrink-0 bg-[#FEF3C7] flex items-center justify-center">
                  <AlertTriangle size={13} className="text-[#D97706]" />
                </div>
                <span className="text-[11px] font-[700] text-[#D97706]">
                  Incident report required before closing this case
                </span>
              </div>

              <div className="grid grid-cols-2 gap-[10px] mb-4">
                {[
                  {
                    field: "injuredCount",
                    label: "Injured",
                    Icon: Users,
                    colorCls: "text-[#D97706]",
                  },
                  {
                    field: "deceasedCount",
                    label: "Deceased",
                    Icon: AlertTriangle,
                    colorCls: "text-[#DC2626]",
                  },
                ].map(({ field, label, Icon, colorCls }) => (
                  <div key={field}>
                    <label className={labelCls}>{label}</label>
                    <div className="relative">
                      <Icon
                        size={13}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${colorCls}`}
                      />
                      <input
                        type="number"
                        min="0"
                        value={form[field]}
                        onChange={(ev) =>
                          setForm((p) => ({
                            ...p,
                            [field]: parseInt(ev.target.value) || 0,
                          }))
                        }
                        className={inputCls}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#F4F7FB] rounded-[13px] p-[14px] border-[1.5px] border-[#E4EBF5] mb-4">
                <label className={labelCls}>Property damage</label>
                <div className="relative mb-[10px]">
                  <Home
                    size={13}
                    className="absolute left-3 top-[13px] pointer-events-none text-[#A8BDD8]"
                  />
                  <textarea
                    placeholder="Describe any property damage…"
                    value={form.propertyDamage}
                    onChange={(ev) =>
                      setForm((p) => ({
                        ...p,
                        propertyDamage: ev.target.value,
                      }))
                    }
                    className={`${inputCls} pt-[11px] h-[80px] resize-none`}
                  />
                </div>
                <label className={labelCls}>Estimated value (ETB)</label>
                <div className="relative">
                  <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[9px] font-[800] text-[#A8BDD8] pointer-events-none">
                    ETB
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.propertyDamageValue}
                    onChange={(ev) =>
                      setForm((p) => ({
                        ...p,
                        propertyDamageValue: parseFloat(ev.target.value) || 0,
                      }))
                    }
                    className={`${inputCls} pl-[44px]`}
                  />
                </div>
              </div>

              {[
                {
                  field: "witnesses",
                  label: "Witnesses",
                  addLabel: "Add witness",
                  Icon: Users,
                  placeholder: "Witness name",
                },
                {
                  field: "suspects",
                  label: "Suspects",
                  addLabel: "Add suspect",
                  Icon: Gavel,
                  placeholder: "Suspect details",
                },
              ].map(({ field, label, addLabel, Icon, placeholder }) => (
                <div key={field} className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className={labelCls}>{label}</label>
                    <button
                      onClick={() => addRow(field)}
                      className="flex items-center gap-1 bg-[#EEF4FF] border-[1.5px] border-[#DBE9FD] rounded-[7px] py-1 px-[10px] text-[#1A52C4] text-[10px] font-[700] cursor-pointer"
                    >
                      <Plus size={11} /> {addLabel}
                    </button>
                  </div>
                  {form[field].map((val, idx) => (
                    <div key={idx} className="flex gap-[6px] mb-[6px]">
                      <div className="flex-1 relative">
                        <Icon
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#A8BDD8]"
                        />
                        <input
                          type="text"
                          placeholder={`${placeholder} ${idx + 1}`}
                          value={val}
                          onChange={(ev) =>
                            setDynamic(field, idx, ev.target.value)
                          }
                          className={inputCls}
                        />
                      </div>
                      {form[field].length > 1 && (
                        <button
                          onClick={() => removeRow(field, idx)}
                          className="bg-transparent border-none text-[#A8BDD8] cursor-pointer px-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              <div className="mb-4">
                <label className={labelCls}>
                  Incident summary <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  placeholder="Provide a detailed incident summary…"
                  value={form.incidentSummary}
                  onChange={(ev) =>
                    setForm((p) => ({ ...p, incidentSummary: ev.target.value }))
                  }
                  className="w-full h-[100px] bg-white border-[1.5px] border-[#E4EBF5] rounded-[10px] p-3 text-[13px] text-[#0B1628] outline-none resize-none box-border font-[inherit] leading-[1.65] focus:border-[#7BA7F5] focus:shadow-[0_0_0_3px_#DBE9FD] transition-[border-color_.15s,box-shadow_.15s]"
                />
              </div>

              <button
                onClick={handleFinalize}
                disabled={!form.incidentSummary.trim()}
                className={`w-full py-[15px] border-none rounded-[13px] text-[13px] font-[800] tracking-[.04em] font-[inherit] transition-opacity ${form.incidentSummary.trim() ? "bg-gradient-to-br from-[#1A52C4] to-[#1140A0] text-white cursor-pointer hover:opacity-90" : "bg-[#EBF1FA] text-[#7A92B0] cursor-not-allowed"}`}
              >
                Finalize &amp; Close Case
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const TABS_SINGLE = [
  { id: "details", icon: Activity, label: "Details" },
  { id: "action", icon: ClipboardList, label: "Actions" },
  { id: "chat", icon: MessageSquare, label: "Chat" },
];
const TABS_MERGED = [
  { id: "details", icon: GitMerge, label: "Merged" },
  { id: "action", icon: ClipboardList, label: "Actions" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DRAWER
// ─────────────────────────────────────────────────────────────────────────────

export default function EmergencyDetailDrawer({
  isOpen,
  onClose,
  emergency,
  onRefresh,
  isService = false,
}) {
  const [activeTab, setActiveTab] = useState("details");
  const [localStatus, setLocalStatus] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const token = getToken();
  const apiPath = isService ? "service" : "emergencies";
  const prevIdRef = useRef(null);

  const isGroupRecord =
    Array.isArray(emergency?.emergencies) && emergency.emergencies.length > 0;
  const isChildRecord = !!emergency?.emergedId;
  const isMerged = isGroupRecord || isChildRecord;

  const mergedGroupId = isChildRecord
    ? emergency.emergedId
    : isGroupRecord
      ? (emergency.id ?? emergency._id)
      : null;

  const TABS = isMerged
    ? TABS_MERGED
    : TABS_SINGLE.filter((t) => !(isService && t.id === "chat"));

  useEffect(() => {
    if (!emergency) return;
    const id = emergency._id || emergency.id;
    if (id !== prevIdRef.current) {
      prevIdRef.current = id;
      setLocalStatus(emergency.status || "");
      setActiveTab("details");
    }
  }, [emergency]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const id = isMerged ? mergedGroupId : emergency?._id || emergency?.id;
      const res = await axios({
        url: `${API_BASE}/api/finalReport/download/${id}`,
        method: "GET",
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `Report_${id}.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpdateStatus = async (newStatus, reportPayload = null) => {
    const id = isMerged ? mergedGroupId : emergency?._id || emergency?.id;
    if (!token) {
      alert("You must be logged in to update status.");
      return;
    }
    if (!id) {
      alert("Could not determine record ID.");
      return;
    }

    try {
      if (newStatus === "resolved" && reportPayload && !isService) {
        const fd = new FormData();
        Object.entries({
          incidentSummary: reportPayload.incidentSummary,
          injuredCount: reportPayload.injuredCount,
          deceasedCount: reportPayload.deceasedCount,
          propertyDamage: reportPayload.propertyDamage,
          propertyDamageValue: reportPayload.propertyDamageValue,
        }).forEach(([k, v]) => fd.append(k, v));
        reportPayload.witnesses.forEach((w) => fd.append("witnesses[]", w));
        reportPayload.suspects.forEach((s) => fd.append("suspects[]", s));

        const url = isMerged
          ? `${API_BASE}/api/emerged/${id}/finalize`
          : `${API_BASE}/api/finalReport/${id}`;
        await axios.post(url, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const url = isMerged
          ? `${API_BASE}/api/emerged/${id}`
          : `${API_BASE}/api/${apiPath}/${id}/status`;
        const method = isMerged ? "put" : "patch";
        await axios[method](
          url,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      setLocalStatus(newStatus);
      onRefresh?.();
      if (newStatus === "resolved") setActiveTab("details");
    } catch (err) {
      console.error(
        "Status update error:",
        err.response?.status,
        err.response?.data,
      );
      alert(
        `Error: ${err.response?.data?.message || "Server error. Please try again."}`,
      );
    }
  };

  if (!emergency) return null;

  const displayId = String(
    isMerged ? mergedGroupId : emergency._id || emergency.id || "",
  )
    .slice(-10)
    .toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[rgba(10,31,68,.3)] z-[70] backdrop-blur-[5px]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            style={{
              width: isMerged ? "min(620px, 100vw)" : "min(520px, 100vw)",
            }}
            className="fixed top-0 right-0 bottom-0 bg-[#F4F7FB] z-[80] flex flex-col shadow-[-6px_0_40px_rgba(10,31,68,.14)] font-['DM_Sans','Helvetica_Neue',sans-serif]"
          >
            <div
              className={`h-[3px] flex-shrink-0 bg-gradient-to-r ${isMerged ? "from-[#7C3AED] via-[#4A80F0] to-[#2563EB]" : "from-[#2563EB] via-[#7BA7F5] to-[#1A52C4]"}`}
            />

            <div className="px-5 border-b-[1.5px] border-[#E4EBF5] bg-white flex-shrink-0 flex items-center justify-between h-[60px]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-[9px] h-[9px] rounded-full flex-shrink-0 ${localStatus === "resolved" ? "bg-[#10B981] shadow-[0_0_0_3px_#D1FAE5]" : "bg-[#EF4444] shadow-[0_0_0_3px_#FEE2E2] animate-pulse"}`}
                />
                <div>
                  <p className="m-0 text-[14px] font-[700] text-[#0B1628] tracking-[-0.2px]">
                    {isMerged
                      ? "Merged Incident Group"
                      : isService
                        ? "Service Detail"
                        : "Emergency Detail"}
                  </p>
                  <p className="m-0 text-[10px] text-[#A8BDD8] tracking-[.1em] font-mono">
                    #{displayId}
                    {isMerged &&
                      ` · ${(emergency.emergencies || []).length || "?"} reports`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isMerged && (
                  <div className="inline-flex items-center gap-[5px] bg-[#EDE9FE] border-[1.5px] border-[#DDD6FE] rounded-[8px] py-1 px-[10px] text-[11px] font-[700] text-[#7C3AED]">
                    <GitMerge size={11} /> Merged
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-[10px] border-[1.5px] border-[#E4EBF5] bg-[#F4F7FB] cursor-pointer flex items-center justify-center text-[#7A92B0] hover:bg-[#EEF4FF] transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="flex border-b-[1.5px] border-[#E4EBF5] bg-white flex-shrink-0">
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-[7px] py-[13px] border-none border-b-[2.5px] text-[11px] tracking-[.07em] uppercase cursor-pointer font-[inherit] transition-colors ${active ? "bg-[#EEF4FF] border-b-[#2563EB] text-[#1A52C4] font-[700]" : "bg-transparent border-b-transparent text-[#A8BDD8] font-[600] hover:text-[#7A92B0]"}`}
                  >
                    <tab.icon size={13} /> {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex-1 overflow-hidden flex flex-col"
                >
                  {activeTab === "details" && isMerged && (
                    <MergedTab
                      groupId={mergedGroupId}
                      localStatus={localStatus}
                      onDownloadPDF={handleDownloadPDF}
                      isDownloading={isDownloading}
                      token={token}
                    />
                  )}

                  {activeTab === "details" && !isMerged && (
                    <DetailsTab
                      emergency={emergency}
                      localStatus={localStatus}
                      onDownloadPDF={handleDownloadPDF}
                      isDownloading={isDownloading}
                      token={token}
                      isService={isService}
                    />
                  )}

                  {activeTab === "action" && (
                    <ActionsTab
                      currentStatus={localStatus}
                      onUpdateStatus={handleUpdateStatus}
                      isService={isService}
                    />
                  )}

                  {activeTab === "chat" && !isService && !isMerged && (
                    <div className="flex-1 overflow-hidden">
                      <ChatTab
                        emergencyId={emergency._id || emergency.id}
                        token={token}
                        apiBaseUrl={API_BASE}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #C8D8EE; border-radius: 4px; }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
