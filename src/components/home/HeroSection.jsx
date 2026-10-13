import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Video,
  Activity,
  Radio,
  CheckCircle2,
  Users,
  Flame,
  Clock,
  Sparkles,
} from "lucide-react";

import glassCenterpiece from "../../../assets/images/glass_3d_centerpiece.jpg";

const stats = [
  { label: "Managed Cases", value: "22,397+", badge: "Active" },
  { label: "Active Responders", value: "328+", badge: "Online" },
  { label: "Avg Response Time", value: "4.2 min", badge: "Live" },
  { label: "System Reliability", value: "99.9%", badge: "Stable" },
];

const HeroSection = () => {
  return (
    <section className="relative w-full pt-36 pb-20 overflow-hidden bg-gradient-to-b from-[#f5f7fa] via-[#eef2f6] to-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* ── AMBIENT SPECULAR GLASS ORBS & DROPLETS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft atmospheric gradients */}
        <div className="absolute top-10 right-20 w-[550px] h-[550px] bg-gradient-to-br from-indigo-200/35 via-blue-200/25 to-transparent rounded-full blur-[110px]" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-sky-200/30 via-slate-200/40 to-transparent rounded-full blur-[100px]" />

        {/* Floating Specular Glass Droplet 1 (Top Right) */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-28 right-16 w-11 h-11 rounded-full bg-gradient-to-tr from-blue-400/40 via-purple-300/30 to-white/80 backdrop-blur-md border border-white/60 shadow-lg shadow-blue-500/10 flex items-center justify-center text-white text-sm"
        >
          <Sparkles className="w-5 h-5 text-blue-600 opacity-70" />
        </motion.div>

        {/* Floating Specular Glass Droplet 2 (Mid Right) */}
        <motion.div
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-96 right-8 w-8 h-8 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-md shadow-indigo-500/10"
        />

        {/* Floating Specular Glass Droplet 3 (Bottom Left) */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-32 left-16 w-9 h-9 rounded-full bg-white/50 backdrop-blur-md border border-white/70 shadow-md"
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
                Bahir Dar • Urban Response OS
              </span>
            </div>

            {/* Headline (Matching Reference Grotesque Typography) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-[-0.035em] text-slate-900 leading-[1.08] mb-6">
              Grow your community with smart digital solutions
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed mb-8 max-w-lg">
              A unified digital ecosystem connecting citizens with real-time public services, smart civic governance, and rapid emergency response teams.
            </p>

            {/* Dual CTA Buttons (Matching Reference Pill Buttons) */}
            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-500/25 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/80 hover:bg-white text-slate-700 font-bold text-xs tracking-wide border border-slate-200/80 shadow-xs backdrop-blur-md transition-all"
              >
                <Search size={14} className="text-slate-400" />
                <span>Explore Services</span>
              </motion.button>
            </div>

            {/* ── FLOATING DARK GLASS CARD WIDGET (EXACT MATCH TO REFERENCE) ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative p-5 rounded-3xl bg-slate-950/90 text-white backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-lg"
            >
              {/* Left Identity */}
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-blue-400 shadow-inner">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-tight">
                      BahirLink Relay
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    24/7 Encrypted Network
                  </span>
                </div>
              </div>

              {/* Right Counter & Status Pill */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-white">
                    1,250+ Cases
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">
                    100% Resolved
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                  Live
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN: 3D GLASS CENTERPIECE WITH FLOATING SQUIRCLE TILES ── */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* The 3D Glass Pedestal Image (Exact match to reference style) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="relative w-full max-w-[480px] aspect-square rounded-[2.5rem] overflow-hidden p-2 bg-gradient-to-b from-white/60 to-slate-100/40 backdrop-blur-xl border border-white/80 shadow-2xl shadow-indigo-500/10"
            >
              <img
                src={glassCenterpiece}
                alt="3D Glass Centerpiece"
                className="w-full h-full object-cover rounded-[2rem]"
              />

              {/* Glossy Refraction Sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none rounded-[2.5rem]" />
            </motion.div>

            {/* ── FLOATING GLASS SQUIRCLE TILE 1 (Top Left) ── */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-2 sm:left-4 p-3.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-xl shadow-slate-900/5 flex items-center gap-3 select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Radio size={16} />
              </div>
              <div className="text-left pr-1">
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  Rapid 911
                </span>
                <span className="text-[9px] font-medium text-slate-400">
                  Instant Dispatch
                </span>
              </div>
            </motion.div>

            {/* ── FLOATING GLASS SQUIRCLE TILE 2 (Top Right) ── */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="absolute -top-6 -right-2 p-3.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-xl shadow-slate-900/5 flex items-center gap-3 select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Activity size={16} />
              </div>
              <div className="text-left pr-1">
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  Medical Care
                </span>
                <span className="text-[9px] font-medium text-slate-400">
                  Ambulance Triage
                </span>
              </div>
            </motion.div>

            {/* ── FLOATING GLASS SQUIRCLE TILE 3 (Bottom Right) ── */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute -bottom-6 -right-3 p-3.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-xl shadow-slate-900/5 flex items-center gap-3 select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                ሀ
              </div>
              <div className="text-left pr-1">
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  Amharic Ready
                </span>
                <span className="text-[9px] font-medium text-slate-400">
                  Full Localization
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── 4 HORIZONTAL METRIC PILL CARDS (EXACT MATCH TO REFERENCE) ── */}
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