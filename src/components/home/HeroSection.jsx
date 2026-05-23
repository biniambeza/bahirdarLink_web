import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight, FaVideo, FaComments,
  FaShieldAlt, FaApple, FaGooglePlay
} from "react-icons/fa";

import emergencyImg from "../../../assets/images/fire.jpg";
import serviceImg from "../../../assets/images/crime.jpg";
import safetyImg from "../../../assets/images/medical.jpg";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { img: emergencyImg, label: "Emergency Response" },
    { img: serviceImg,   label: "Public Service"     },
    { img: safetyImg,    label: "Public Safety"      },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center font-sans tracking-tight">

      {/* ── BACKGROUND: Almost full photo, very light veil only on left for text ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Photo — full bleed, Ken-Burns */}
            <motion.div
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${slides[currentSlide].img}')` }}
            />

            {/* Thin white-to-transparent veil — ONLY far left for text legibility */}
            <div className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.38) 32%, rgba(255,255,255,0.08) 58%, transparent 78%)",
              }}
            />

            {/* Very subtle blue tint across the whole image — natural coolness */}
            <div className="absolute inset-0"
              style={{ background: "rgba(219,234,254,0.10)" }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── CONTENT GRID ── */}
      <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-14 w-full grid lg:grid-cols-12 gap-10 items-center pt-28 pb-36">

        {/* ── LEFT ── */}
        <motion.div
          initial={{ opacity: 0, x: -22 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="lg:col-span-6"
        >
          {/* Badge */}
          <div className="mb-7">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase
                             text-blue-700 bg-white/60 border border-blue-200 px-4 py-[7px] rounded-full backdrop-blur-sm">
              <span className="w-[6px] h-[6px] rounded-full bg-blue-500 animate-pulse shrink-0" />
              Bahir Dar • Urban Hub
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black uppercase leading-[0.86] tracking-tighter mb-6"
            style={{ fontSize: "clamp(62px, 9vw, 108px)" }}
          >
            <span className="text-slate-900">BAHIR</span>
            <span className="text-blue-500">LINK</span>
          </h1>

          {/* Rule */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[2px] w-12 bg-blue-500 rounded-full" />
            <div className="h-[2px] w-4 bg-blue-300 rounded-full" />
          </div>

          {/* Body */}
          <p className="text-[17px] text-slate-700 max-w-[400px] leading-[1.75] mb-10">
            A unified digital ecosystem connecting citizens with
            real-time public services and safety response teams.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 items-center mb-12">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-8 py-[15px] rounded-2xl
                         bg-blue-600 hover:bg-blue-700
                         text-white font-bold text-[11px] uppercase tracking-[0.18em] transition-colors"
            >
              Start Exploring <FaArrowRight className="text-[9px]" />
            </motion.button>

            {[FaApple, FaGooglePlay].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 flex items-center justify-center rounded-2xl
                           bg-white/50 backdrop-blur-sm border border-white/70
                           text-slate-800 hover:bg-white/80 hover:text-blue-600
                           transition-all"
              >
                <Icon className="text-[17px]" />
              </motion.a>
            ))}
          </div>

          {/* Slide indicator */}
          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              <motion.span
                key={slides[currentSlide].label}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.35 }}
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-600"
              >
                {slides[currentSlide].label}
              </motion.span>
            </AnimatePresence>

            <div className="flex gap-[5px]">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-[3px] rounded-full transition-all duration-500 ${
                    i === currentSlide
                      ? "w-8 bg-blue-500"
                      : "w-3 bg-white/60 hover:bg-white/90"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT: Feature cards — frosted glass over the natural photo ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="lg:col-span-5 lg:col-start-8 hidden lg:grid grid-cols-2 gap-3"
        >
          {/* Card 1 – Video Call */}
          <div className="bg-white/30 backdrop-blur-md border border-white/50 rounded-[1.8rem] p-7
                          hover:bg-white/50 hover:border-white/70
                          transition-all duration-400 group cursor-default">
            <div className="w-11 h-11 rounded-xl bg-white/50 border border-white/60 flex items-center justify-center mb-5
                            group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors duration-300">
              <FaVideo className="text-slate-800 text-[15px] group-hover:text-white transition-colors duration-300" />
            </div>
            <h4 className="font-bold text-[11px] tracking-[0.14em] uppercase text-slate-900 mb-1">Video Call</h4>
            <p className="text-[11px] text-slate-700">Visual assessment</p>
          </div>

          {/* Card 2 – Direct Chat */}
          <div className="bg-blue-600/85 backdrop-blur-md border border-blue-400/60 rounded-[1.8rem] p-7
                          hover:bg-blue-600/95 transition-all duration-400 cursor-default">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-5">
              <FaComments className="text-white text-[15px]" />
            </div>
            <h4 className="font-bold text-[11px] tracking-[0.14em] uppercase text-white mb-1">Direct Chat</h4>
            <p className="text-[11px] text-blue-100">24/7 response</p>
          </div>

          {/* Card 3 – Amharic */}
          <div className="bg-white/30 backdrop-blur-md border border-white/50 rounded-[1.8rem] p-7
                          flex items-center gap-4 hover:bg-white/50 hover:border-white/70
                          transition-all duration-400 cursor-default">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center
                            text-[20px] font-black shrink-0">
              ሀ
            </div>
            <div>
              <h4 className="font-bold text-[11px] tracking-[0.14em] uppercase text-slate-900 mb-1">Amharic</h4>
              <p className="text-[11px] text-slate-700">Full support</p>
            </div>
          </div>

          {/* Card 4 – Secure */}
          <div className="bg-white/30 backdrop-blur-md border border-white/50 rounded-[1.8rem] p-7
                          flex items-center gap-4 hover:bg-white/50 hover:border-white/70
                          transition-all duration-400 cursor-default">
            <div className="w-12 h-12 rounded-xl bg-white/50 border border-white/70 flex items-center justify-center shrink-0">
              <FaShieldAlt className="text-blue-600 text-[15px]" />
            </div>
            <div>
              <h4 className="font-bold text-[11px] tracking-[0.14em] uppercase text-slate-900 mb-1">Secure</h4>
              <p className="text-[11px] text-slate-700">End-to-end</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── BOTTOM FADE — soft, not heavy ── */}
      <div
        className="absolute bottom-0 left-0 w-full h-24 z-30 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(255,255,255,0.55), transparent)" }}
      />
    </section>
  );
};

export default Hero;