import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight,
  FaVideo,
  FaComments,
  FaShieldAlt,
  FaApple,
  FaGooglePlay,
  FaExpand,
  FaCompress,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import emergencyImg from "../../../assets/images/fire.jpg";
import serviceImg from "../../../assets/images/crime.jpg";
import safetyImg from "../../../assets/images/medical.jpg";

const slides = [
  {
    id: 0,
    img: emergencyImg,
    badge: "Bahir Dar • Emergency Response",
    title: "RAPID EMERGENCY DISPATCH",
    description:
      "A unified digital ecosystem connecting citizens with real-time public safety and rapid emergency response teams across Bahir Dar.",
    tag: "911 Dispatch",
  },
  {
    id: 1,
    img: serviceImg,
    badge: "Bahir Dar • City Administration",
    title: "LAKE TANA CIVIC HUB",
    description:
      "Seamless public service coordination and digital administrative portals for citizens along the scenic Lake Tana waterfront corridor.",
    tag: "Civic Services",
  },
  {
    id: 2,
    img: safetyImg,
    badge: "Bahir Dar • Healthcare & Safety",
    title: "ADVANCED MEDICAL CARE",
    description:
      "Modern healthcare response, paramedic coordination, and 24/7 medical rescue infrastructure safeguarding our community.",
    tag: "Medical Safety",
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullView, setIsFullView] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const active = slides[currentSlide];

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden flex items-center font-sans tracking-tight bg-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── 4K ULTRA-HD NATURAL PHOTO BACKGROUND (NO COLOR SHIFTS) ── */}
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
            {/* Raw Natural 4K Image Render with hardware-accelerated Ken-Burns */}
            <motion.img
              src={active.img}
              alt={active.title}
              initial={{ scale: 1.04 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "easeOut" }}
              fetchPriority="high"
              decoding="sync"
              className="w-full h-full object-cover object-center transform-gpu will-change-transform"
            />

            {/* Subtle natural left-gradient scrim only when not in full-image view */}
            {!isFullView && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0.1) 60%, transparent 80%)",
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── 4K RESOLUTION BADGE & FULL-VIEW TOGGLE ── */}
      <div className="absolute top-28 right-6 md:right-12 z-30 flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-white/90 text-slate-800 shadow-md">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-700">
            4K UHD • 3840×2160
          </span>
        </div>

        <button
          onClick={() => setIsFullView(!isFullView)}
          title={isFullView ? "Show Content" : "View Pure 4K Photo"}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 backdrop-blur-xl border border-white/90 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md hover:text-blue-600"
        >
          {isFullView ? (
            <>
              <FaCompress className="text-xs" />
              <span>Show UI</span>
            </>
          ) : (
            <>
              <FaExpand className="text-xs" />
              <span>Full 4K View</span>
            </>
          )}
        </button>
      </div>

      {/* ── MAIN CONTENT (Fades out cleanly in Full 4K View) ── */}
      <AnimatePresence>
        {!isFullView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-20 max-w-[1440px] mx-auto px-6 md:px-14 w-full grid lg:grid-cols-12 gap-8 items-center pt-28 pb-32"
          >
            {/* ── LEFT: REFINED GLASS CARD WITH ORIGINAL COLOR SCHEME ── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7 xl:col-span-6 bg-white/70 backdrop-blur-2xl border border-white/90 rounded-[2.5rem] p-8 md:p-11 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
            >
              {/* Badge (Original Style) */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase text-blue-700 bg-white/80 border border-blue-200 px-4 py-[7px] rounded-full backdrop-blur-sm shadow-xs">
                  <span className="w-[6px] h-[6px] rounded-full bg-blue-500 animate-pulse shrink-0" />
                  {active.badge}
                </span>
              </div>

              {/* Headline (Exact Original Colors: BAHIR in slate-900, LINK in blue-500) */}
              <h1
                className="font-black uppercase leading-[0.88] tracking-tighter mb-5"
                style={{ fontSize: "clamp(54px, 7.5vw, 92px)" }}
              >
                <span className="text-slate-900">BAHIR</span>
                <span className="text-blue-500">LINK</span>
              </h1>

              {/* Original Blue Rules */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-[2.5px] w-12 bg-blue-500 rounded-full" />
                <div className="h-[2.5px] w-4 bg-blue-300 rounded-full" />
              </div>

              {/* Body Text */}
              <p className="text-[16px] sm:text-[17px] text-slate-700 max-w-[460px] leading-[1.7] mb-8 font-normal">
                {active.description}
              </p>

              {/* CTAs (Original Royal Blue CTA + App Store Buttons) */}
              <div className="flex flex-wrap gap-3 items-center mb-8">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-8 py-[15px] rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-[0.18em] shadow-lg shadow-blue-500/25 transition-all"
                >
                  Start Exploring <FaArrowRight className="text-[9px]" />
                </motion.button>

                {[FaApple, FaGooglePlay].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.05 }}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 text-slate-800 hover:bg-white hover:text-blue-600 shadow-sm transition-all"
                  >
                    <Icon className="text-[17px]" />
                  </motion.a>
                ))}
              </div>

              {/* 4K Scene Switcher Thumbnails */}
              <div className="flex items-center gap-4 pt-5 border-t border-slate-200/60">
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-blue-600 shrink-0">
                  {active.tag}
                </span>

                <div className="flex items-center gap-2">
                  {slides.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentSlide(idx)}
                      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                        idx === currentSlide
                          ? "w-16 h-10 border-blue-500 ring-2 ring-blue-400/40 shadow-sm scale-105"
                          : "w-11 h-8 border-slate-300/80 opacity-60 hover:opacity-100 hover:border-blue-300"
                      }`}
                    >
                      <img
                        src={s.img}
                        alt={s.tag}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── RIGHT: SLEEK FLOATING CAPABILITY CARDS (ORIGINAL BLUE ACCENTS) ── */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="lg:col-span-5 lg:col-start-8 hidden lg:grid grid-cols-2 gap-3"
            >
              {/* Card 1 – Video Call */}
              <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-[1.8rem] p-6 hover:bg-white/90 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group cursor-default shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-white/80 border border-slate-200/60 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors duration-300 shadow-xs">
                  <FaVideo className="text-slate-800 text-[15px] group-hover:text-white transition-colors duration-300" />
                </div>
                <h4 className="font-bold text-[11px] tracking-[0.14em] uppercase text-slate-900 mb-1">
                  Video Call
                </h4>
                <p className="text-[11px] text-slate-600 font-normal">
                  Visual assessment
                </p>
              </div>

              {/* Card 2 – Direct Chat (Iconic Original Blue Card) */}
              <div className="bg-blue-600/90 backdrop-blur-md border border-blue-400/60 rounded-[1.8rem] p-6 hover:bg-blue-600 transition-all duration-300 cursor-default shadow-lg shadow-blue-500/20">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-4 shadow-xs">
                  <FaComments className="text-white text-[15px]" />
                </div>
                <h4 className="font-bold text-[11px] tracking-[0.14em] uppercase text-white mb-1">
                  Direct Chat
                </h4>
                <p className="text-[11px] text-blue-100 font-normal">
                  24/7 response
                </p>
              </div>

              {/* Card 3 – Amharic (ሀ) */}
              <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-[1.8rem] p-6 flex items-center gap-4 hover:bg-white/90 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-default shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-[20px] font-black shrink-0 shadow-sm">
                  ሀ
                </div>
                <div>
                  <h4 className="font-bold text-[11px] tracking-[0.14em] uppercase text-slate-900 mb-1">
                    Amharic
                  </h4>
                  <p className="text-[11px] text-slate-600 font-normal">
                    Full support
                  </p>
                </div>
              </div>

              {/* Card 4 – Secure */}
              <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-[1.8rem] p-6 flex items-center gap-4 hover:bg-white/90 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-default shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-white/80 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-xs">
                  <FaShieldAlt className="text-blue-600 text-[15px]" />
                </div>
                <div>
                  <h4 className="font-bold text-[11px] tracking-[0.14em] uppercase text-slate-900 mb-1">
                    Secure
                  </h4>
                  <p className="text-[11px] text-slate-600 font-normal">
                    End-to-end
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FULL 4K VIEW CONTROLLER (When in expanded photo mode) ── */}
      {isFullView && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-white/85 backdrop-blur-2xl border border-white/90 px-6 py-3 rounded-full shadow-2xl"
        >
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
            }
            className="p-2 rounded-full hover:bg-slate-100 text-slate-800 transition-colors"
          >
            <FaChevronLeft size={14} />
          </button>

          <div className="text-center px-2">
            <span className="text-xs font-black uppercase tracking-widest text-blue-600 block">
              {active.tag}
            </span>
            <span className="text-[10px] text-slate-600 font-medium">
              Bahir Dar • Lake Tana 4K Photography
            </span>
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-800 transition-colors"
          >
            <FaChevronRight size={14} />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <button
            onClick={() => setIsFullView(false)}
            className="text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-blue-600 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 transition-all"
          >
            Exit 4K View
          </button>
        </motion.div>
      )}

      {/* ── BOTTOM METRIC TICKER (Clean Light Glass) ── */}
      {!isFullView && (
        <div className="absolute bottom-0 left-0 w-full z-20 py-3 px-6 md:px-14 bg-white/60 backdrop-blur-md border-t border-slate-200/60 flex flex-wrap justify-between items-center text-[10px] text-slate-600 font-mono tracking-wider">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-bold text-slate-900">
              BAHIR DAR CIVIC & EMERGENCY NETWORK: ONLINE
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span>NATURAL 4K ULTRA-HD</span>
            <span className="hidden sm:inline">COORDINATES: 11.5742° N, 37.3614° E</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;