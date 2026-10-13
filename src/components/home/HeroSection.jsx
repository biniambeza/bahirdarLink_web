import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight,
  FaVideo,
  FaComments,
  FaShieldAlt,
  FaExpand,
  FaCompress,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Sparkles, Radio } from "lucide-react";

import emergencyImg from "../../../assets/images/fire.jpg";
import serviceImg from "../../../assets/images/crime.jpg";
import safetyImg from "../../../assets/images/medical.jpg";

const slides = [
  {
    id: 0,
    img: emergencyImg,
    tag: "911 Emergency Response",
    title: "RAPID RESCUE & RESPONSE",
    subtitle: "Unified police, fire & rapid emergency dispatch along Lake Tana corridor",
    badge: "Active 911 Dispatch",
    color: "from-red-500 to-orange-500",
  },
  {
    id: 1,
    img: serviceImg,
    tag: "Lake Tana City Administration",
    title: "CIVIC URBAN HUB",
    subtitle: "Digital government portal connecting citizens with real-time municipal public services",
    badge: "Smart City Core",
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: 2,
    img: safetyImg,
    tag: "Public Safety & Healthcare",
    title: "ADVANCED MEDICAL CARE",
    subtitle: "24/7 emergency medical triage and paramedic coordination across Bahir Dar",
    badge: "Medical Response",
    color: "from-emerald-500 to-teal-400",
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const active = slides[currentSlide];

  return (
    <section 
      className="relative w-full min-h-screen overflow-hidden flex items-center font-sans tracking-tight bg-slate-950 text-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── 4K ULTRA HD CRYSTAL-CLEAR FULL BLEED IMAGE BACKGROUND ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Native High-Resolution 4K Image Render with hardware-accelerated Ken-Burns */}
            <motion.img
              src={active.img}
              alt={active.title}
              initial={{ scale: 1.04 }}
              animate={{ scale: 1 }}
              transition={{ duration: 9, ease: "easeOut" }}
              fetchPriority="high"
              decoding="sync"
              className="w-full h-full object-cover object-center transform-gpu will-change-transform brightness-[0.98] contrast-[1.03]"
              style={{ imageRendering: "-webkit-optimize-contrast" }}
            />

            {/* Cinematic non-destructive scrim: allows 100% 4K clarity on the right and center, while guaranteeing text legibility on the left */}
            {!isCinematicMode && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.6) 32%, rgba(15, 23, 42, 0.15) 60%, transparent 80%)",
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(15, 23, 42, 0.65) 0%, transparent 35%)",
                  }}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── 4K ULTRA HD RESOLUTION PILL & CINEMATIC MODE TOGGLE ── */}
      <div className="absolute top-28 right-6 md:right-12 z-30 flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-cyan-300">
            4K UHD • 3840×2160
          </span>
        </div>

        <button
          onClick={() => setIsCinematicMode(!isCinematicMode)}
          title={isCinematicMode ? "Show Text & Controls" : "View Pure 4K Image"}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl border border-white/30 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg"
        >
          {isCinematicMode ? (
            <>
              <FaCompress className="text-xs" />
              <span>Show UI</span>
            </>
          ) : (
            <>
              <FaExpand className="text-xs" />
              <span>View Full 4K</span>
            </>
          )}
        </button>
      </div>

      {/* ── MAIN CONTENT (Fades out when in pure 4K cinema view) ── */}
      <AnimatePresence>
        {!isCinematicMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-20 max-w-[1440px] mx-auto px-6 md:px-14 w-full grid lg:grid-cols-12 gap-8 items-center pt-28 pb-32"
          >
            {/* ── LEFT HERO COPY ── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7 xl:col-span-6"
            >
              {/* Dynamic Category Badge */}
              <div className="mb-6 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[0.24em] uppercase text-cyan-300 bg-slate-900/60 border border-cyan-400/30 px-4 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  {active.tag}
                </span>

                <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-slate-300 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  Bahir Dar Live
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-black uppercase leading-[0.92] tracking-tighter mb-6 text-white drop-shadow-md">
                <span>BAHIR</span>
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                  LINK
                </span>
              </h1>

              {/* Accent Line */}
              <div className="flex items-center gap-2 mb-6">
                <div className="h-[3px] w-14 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
                <div className="h-[3px] w-4 bg-cyan-400/60 rounded-full" />
              </div>

              {/* Dynamic Slide Subtitle & Description */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="mb-8 max-w-lg"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-200 mb-2">
                    {active.title}
                  </h3>
                  <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed font-normal drop-shadow-sm">
                    {active.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 items-center mb-10">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 transition-all"
                >
                  <span>Start Exploring</span>
                  <FaArrowRight className="text-[10px]" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsCinematicMode(true)}
                  className="flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md border border-white/25 transition-all"
                >
                  <FaExpand className="text-[10px] text-cyan-300" />
                  <span>Inspect 4K View</span>
                </motion.button>
              </div>

              {/* Slide Quick Navigation Thumbnails */}
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                  Scenes:
                </span>
                <div className="flex items-center gap-2">
                  {slides.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentSlide(idx)}
                      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                        idx === currentSlide
                          ? "w-20 sm:w-24 h-12 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg scale-105"
                          : "w-12 sm:w-14 h-10 border-white/30 opacity-60 hover:opacity-100 hover:border-white/60"
                      }`}
                    >
                      <img
                        src={s.img}
                        alt={s.tag}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 bg-slate-900/30 transition-opacity ${
                        idx === currentSlide ? "opacity-0" : "group-hover:opacity-10"
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── RIGHT FLOATING QUICK CAPABILITY PILLS (Non-obstructive) ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="lg:col-span-5 lg:col-start-8 flex flex-col gap-3 max-w-sm ml-auto"
            >
              {/* Mini Feature Pill 1 */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/15 hover:border-cyan-400/40 hover:bg-slate-900/70 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
                  <FaVideo className="text-sm" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    Live Video Dispatch
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Real-time visual incident streaming
                  </p>
                </div>
              </div>

              {/* Mini Feature Pill 2 */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/15 hover:border-blue-400/40 hover:bg-slate-900/70 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
                  <FaComments className="text-sm" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    Citizen Direct Chat
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    24/7 direct response desk
                  </p>
                </div>
              </div>

              {/* Mini Feature Pill 3 */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/15 hover:border-emerald-400/40 hover:bg-slate-900/70 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-black text-sm group-hover:scale-105 transition-transform">
                  ሀ
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    Amharic & English
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Full localized language support
                  </p>
                </div>
              </div>

              {/* Mini Feature Pill 4 */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/15 hover:border-indigo-400/40 hover:bg-slate-900/70 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
                  <FaShieldAlt className="text-sm" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    Encrypted Protocol
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Official municipal security relay
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CINEMATIC MODE HELPER TOOLTIP ── */}
      {isCinematicMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-slate-950/70 backdrop-blur-2xl border border-white/20 px-6 py-3 rounded-full shadow-2xl"
        >
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <FaChevronLeft size={14} />
          </button>
          
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-300 block">
              {active.tag}
            </span>
            <span className="text-[10px] text-slate-300 font-medium">
              4K Native Resolution • Lake Tana Corridor
            </span>
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <FaChevronRight size={14} />
          </button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          <button
            onClick={() => setIsCinematicMode(false)}
            className="text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            Exit 4K View
          </button>
        </motion.div>
      )}

      {/* ── BOTTOM LIGHT METRIC TICKER (Clean & Translucent) ── */}
      {!isCinematicMode && (
        <div className="absolute bottom-0 left-0 w-full z-20 py-3 px-6 md:px-12 bg-slate-950/40 backdrop-blur-md border-t border-white/10 flex flex-wrap justify-between items-center text-[10px] text-slate-300 font-mono tracking-wider">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">BAHIR DAR EMERGENCY NETWORK: ONLINE</span>
          </div>
          <div className="flex items-center gap-6">
            <span>RES: 3840×2160 UHD</span>
            <span className="hidden sm:inline">COORDINATES: 11.5742° N, 37.3614° E</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;