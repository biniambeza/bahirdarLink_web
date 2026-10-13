import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  PhoneCall,
  ShieldAlert,
  Car,
  Flame,
  Activity,
  MapPin,
  CheckCircle2,
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
    title: "Traffic Accident & Highway Rescue",
    location: "Lake Tana Boulevard",
    eta: "3.4 min",
    phone: "907",
  },
  {
    id: "crime",
    name: "Crime Prevention",
    icon: ShieldAlert,
    img: crimeImg,
    title: "Police Patrol & Crime Investigation",
    location: "Central District",
    eta: "2.8 min",
    phone: "991",
  },
  {
    id: "fire",
    name: "Fire Emergency",
    icon: Flame,
    img: fireImg,
    title: "Fire Suppression & Urban Rescue",
    location: "Kebele 04 Zone",
    eta: "4.1 min",
    phone: "939",
  },
  {
    id: "medical",
    name: "Medical Triage",
    icon: Activity,
    img: medicalImg,
    title: "Urgent Paramedic & Ambulance",
    location: "Felege Hiwot Corridor",
    eta: "3.9 min",
    phone: "907",
  },
];

const metrics = [
  { label: "Avg Response", value: "3.8 min" },
  { label: "Active Units", value: "320+" },
  { label: "Emergency Line", value: "24/7" },
  { label: "City Coverage", value: "100%" },
];

const HeroSection = () => {
  const [activeCategory, setActiveCategory] = useState(incidentCategories[0]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveCategory((prev) => {
        const nextIndex =
          (incidentCategories.findIndex((c) => c.id === prev.id) + 1) %
          incidentCategories.length;
        return incidentCategories[nextIndex];
      });
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      className="relative w-full pt-32 pb-16 bg-[#f8fafc] text-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center mb-16">
          
          {/* Left Column: Essential Text & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            
            {/* Simple Pill Tag */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Bahir Dar Public Safety
              </span>
            </div>

            {/* Clear, Strong Headline */}
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.1] mb-5">
              Fast Emergency & Crime Response
            </h1>

            {/* 1 Short, Concise Subtitle */}
            <p className="text-base text-slate-600 leading-relaxed mb-8 max-w-md">
              Direct connection to police patrol, traffic accident rescue, and 24/7 emergency dispatch in Bahir Dar.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-500/20 transition-all"
              >
                <span>Report Incident</span>
                <ArrowRight size={14} />
              </a>

              <a
                href="tel:991"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs tracking-wide border border-slate-200 shadow-xs transition-all"
              >
                <PhoneCall size={14} className="text-red-500" />
                <span>Call Emergency (991)</span>
              </a>
            </div>

            {/* Simple Dispatch Status */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Live Dispatch Grid Active
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Average response: {activeCategory.eta}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                Online
              </span>
            </div>
          </div>

          {/* Right Column: Clean Image Showcase */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* Category Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3.5 w-full">
              {incidentCategories.map((cat) => {
                const isSelected = activeCategory.id === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                    }`}
                  >
                    <IconComponent size={13} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Unobstructed, Crisp 4K Image Container */}
            <div className="relative w-full aspect-[16/11] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xl shadow-slate-900/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="relative w-full h-full"
                >
                  <img
                    src={activeCategory.img}
                    alt={activeCategory.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Clean, Subtle Bottom Caption Pill (Unobstructive) */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-slate-950/70 backdrop-blur-md text-white flex items-center justify-between border border-white/10 shadow-md">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-red-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold tracking-tight">
                          {activeCategory.title}
                        </div>
                        <div className="text-[10px] text-slate-300">
                          {activeCategory.location}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white">
                      Dial {activeCategory.phone}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Clean, Simple 4-Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-6 border-t border-slate-200/70">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs flex flex-col"
            >
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {m.value}
              </span>
              <span className="text-xs text-slate-500 font-medium mt-0.5">
                {m.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroSection;