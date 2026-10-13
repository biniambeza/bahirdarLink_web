import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Radio,
  Clock,
  Sparkles,
  MapPin,
  Car,
  ChevronRight,
} from "lucide-react";

import accidentImg from "../../../assets/images/accident_response.jpg";
import crimeImg from "../../../assets/images/crime_response.jpg";
import fireImg from "../../../assets/images/fire.jpg";
import medicalImg from "../../../assets/images/medical.jpg";

const incidentCategories = [
  {
    id: "accident",
    name: "Traffic Accident",
    icon: Car,
    img: accidentImg,
    tag: "Accident Rescue",
    headline: "Rapid Traffic & Highway Rescue",
    location: "Lake Tana Boulevard • Sector 2",
    eta: "3.4 min ETA",
    status: "Units Dispatched",
    color: "from-amber-500 to-orange-500",
    badgeColor: "bg-amber-500/20 text-amber-800 border-amber-300",
  },
  {
    id: "crime",
    name: "Crime Prevention",
    icon: ShieldAlert,
    img: crimeImg,
    tag: "Police Response",
    headline: "Law Enforcement & Crime Investigation",
    location: "Bahir Dar Central District",
    eta: "2.8 min ETA",
    status: "Area Secured",
    color: "from-blue-600 to-indigo-600",
    badgeColor: "bg-blue-500/20 text-blue-800 border-blue-300",
  },
  {
    id: "fire",
    name: "Fire Emergency",
    icon: Flame,
    img: fireImg,
    tag: "Fire & Rescue",
    headline: "Fire Suppression & Urban Safety",
    location: "Kebele 04 • Commercial Zone",
    eta: "4.1 min ETA",
    status: "Crew Active",
    color: "from-red-500 to-rose-600",
    badgeColor: "bg-red-500/20 text-red-800 border-red-300",
  },
  {
    id: "medical",
    name: "Medical Triage",
    icon: Activity,
    img: medicalImg,
    tag: "Paramedic Unit",
    headline: "24/7 Urgent Healthcare Transport",
    location: "Felege Hiwot Hospital Corridor",
    eta: "3.9 min ETA",
    status: "En Route",
    color: "from-emerald-500 to-teal-600",
    badgeColor: "bg-emerald-500/20 text-emerald-800 border-emerald-300",
  },
];

const stats = [
  { label: "Accidents Resolved", value: "8,420+", badge: "99.2% Rate" },
  { label: "Crime Incidents Handled", value: "12,190+", badge: "Secured" },
  { label: "Avg Response Time", value: "3.8 min", badge: "Live GPS" },
  { label: "Active Patrol Units", value: "328+", badge: "On Duty" },
];

const HeroSection = () => {
  const [activeCategory, setActiveCategory] = useState(incidentCategories[0]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveCategory((prev) => {
        const nextIndex = (incidentCategories.findIndex((c) => c.id === prev.id) + 1) % incidentCategories.length;
        return incidentCategories[nextIndex];
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section 
      className="relative w-full pt-36 pb-20 overflow-hidden bg-gradient-to-b from-[#f5f7fa] via-[#eef2f6] to-white text-slate-900 selection:bg-blue-600 selection:text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── AMBIENT SPECULAR GLASS ORBS & DROPLETS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-20 w-[550px] h-[550px] bg-gradient-to-br from-indigo-200/30 via-blue-200/20 to-transparent rounded-full blur-[110px]" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-sky-200/30 via-slate-200/40 to-transparent rounded-full blur-[100px]" />

        {/* Floating Specular Glass Droplet 1 (Top Right) */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-28 right-16 w-11 h-11 rounded-full bg-gradient-to-tr from-blue-400/40 via-purple-300/30 to-white/80 backdrop-blur-md border border-white/60 shadow-lg shadow-blue-500/10 flex items-center justify-center text-white"
        >
          <Sparkles className="w-5 h-5 text-blue-600 opacity-70" />
        </motion.div>

        {/* Floating Specular Glass Droplet 2 (Bottom Left) */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 left-16 w-9 h-9 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-md"
        />
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 sm:px-8">
        {/* ── TOP HERO GRID ── */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-16">
          {/* ── LEFT COLUMN: HEADLINE, COPY, CTA & DARK GLASS CARD ── */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Pill Badge */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/80 text-[11px] font-bold tracking-wider text-slate-700 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Bahir Dar • Emergency & Crime Response OS
              </span>
            </div>

            {/* Headline (Matching Reference Grotesque Typography) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-[-0.035em] text-slate-900 leading-[1.08] mb-6">
              Protect your community with smart digital response
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed mb-8 max-w-lg">
              A unified public safety system connecting citizens with rapid traffic accident rescue, crime prevention, and 24/7 emergency dispatch.
            </p>

            {/* Dual CTA Buttons (Matching Reference Pill Buttons) */}
            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-500/25 transition-all"
              >
                <span>Report Incident</span>
                <ArrowRight size={14} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/80 hover:bg-white text-slate-700 font-bold text-xs tracking-wide border border-slate-200/80 shadow-xs backdrop-blur-md transition-all"
              >
                <Search size={14} className="text-slate-400" />
                <span>Search Cases</span>
              </motion.button>
            </div>

            {/* ── FLOATING DARK GLASS CARD WIDGET (MATCHING REFERENCE EXACTLY) ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative p-5 rounded-3xl bg-slate-950/90 text-white backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-lg"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-blue-400 shadow-inner">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-tight">
                      Active Dispatch Grid
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Police • Traffic • Fire • Paramedic
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-white">
                    {activeCategory.eta}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">
                    {activeCategory.status}
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                  Live
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN: 3D GLASS CONTAINER WITH PROJECT CONTENT IMAGES ── */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            {/* Category Filter Pills (Traffic Accident, Crime, Fire, Medical) */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4 w-full">
              {incidentCategories.map((cat) => {
                const isSelected = activeCategory.id === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-105"
                        : "bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/80"
                    }`}
                  >
                    <IconComponent size={13} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* 3D Glass Showcase Container */}
            <motion.div
              layout
              className="relative w-full max-w-[490px] aspect-[4/3.5] rounded-[2.5rem] overflow-hidden p-2.5 bg-gradient-to-b from-white/80 to-slate-100/60 backdrop-blur-2xl border border-white/90 shadow-2xl shadow-indigo-500/10"
            >
              {/* Incident Image Render */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="relative w-full h-full rounded-[2rem] overflow-hidden"
                >
                  <img
                    src={activeCategory.img}
                    alt={activeCategory.headline}
                    className="w-full h-full object-cover"
                  />

                  {/* Frosted Glass Overlay Badge on Image */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-950/75 backdrop-blur-xl border border-white/15 text-white flex items-center justify-between shadow-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                          {activeCategory.tag}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {activeCategory.headline}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-1">
                        <MapPin size={11} className="text-red-400" />
                        <span>{activeCategory.location}</span>
                      </div>
                    </div>

                    <span className="px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-md">
                      {activeCategory.status}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* ── FLOATING GLASS SQUIRCLE TILE 1 (Top Left) ── */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="hidden sm:flex absolute -top-4 -left-3 p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-xl shadow-slate-900/5 items-center gap-3 select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle size={16} />
              </div>
              <div className="text-left pr-1">
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  Accident Triage
                </span>
                <span className="text-[9px] font-medium text-slate-400">
                  Real-time Collision SOS
                </span>
              </div>
            </motion.div>

            {/* ── FLOATING GLASS SQUIRCLE TILE 2 (Bottom Right) ── */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="hidden sm:flex absolute -bottom-5 -right-3 p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-xl shadow-slate-900/5 items-center gap-3 select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <ShieldAlert size={16} />
              </div>
              <div className="text-left pr-1">
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  Crime Alert 991
                </span>
                <span className="text-[9px] font-medium text-slate-400">
                  Police Rapid Unit
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── 4 HORIZONTAL METRIC PILL CARDS (MATCHING REFERENCE EXACTLY) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  {s.label}
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {s.value}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {s.badge}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;