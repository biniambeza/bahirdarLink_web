import React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  PhoneCall,
  CheckCircle,
  Radio,
  ArrowRight,
  Sparkles,
  MapPin,
  TrendingUp,
} from "lucide-react";

import dispatcherPortrait from "../../../assets/images/dispatcher_portrait.jpg";
import officerPortrait from "../../../assets/images/officer_portrait.jpg";
import glassCharts from "../../../assets/images/glass_3d_charts.jpg";

const CapabilitiesSection = () => {
  return (
    <section className="relative w-full py-24 bg-[#f8fafc] text-slate-900 overflow-hidden">
      {/* Ambient background droplets */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-4 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 sm:px-8">
        {/* ── BENTO GRID (DIRECTLY MATCHING REFERENCE LOWER SECTION) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* ── BENTO 1: DARK MOBILE EMERGENCY CARD (Left, span 4) ── */}
          <motion.div
            whileHover={{ y: -4 }}
            className="lg:col-span-4 p-8 rounded-[2.5rem] bg-slate-950 text-white border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden"
          >
            {/* Ambient top light */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Notch pill indicator */}
              <div className="flex items-center justify-between mb-8">
                <div className="w-10 h-3 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </div>

              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-400 block mb-2">
                Mobile SOS Relay
              </span>
              <h3 className="text-2xl font-black tracking-tight leading-snug mb-3">
                Rapid Emergency Dispatch
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-5 font-normal">
                Report incidents in seconds with auto-GPS coordinates, live audio stream, and direct dispatcher video link.
              </p>

              {/* Instant incident classification tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold border border-white/10">
                  🚨 Crime 991
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold border border-white/10">
                  🚗 Traffic Accident
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold border border-white/10">
                  🔥 Fire 939
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold border border-white/10">
                  🚑 Medical 907
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                // 911 PROTOCOL
              </span>
              <button className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-500/30 transition-all flex items-center gap-2">
                <span>Quick SOS</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </motion.div>

          {/* ── BENTO 2: DISPATCH OPERATOR PORTRAIT CARD (Center, span 5) ── */}
          <motion.div
            whileHover={{ y: -4 }}
            className="lg:col-span-5 p-7 rounded-[2.5rem] bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_12px_36px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              {/* Operator Image */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden shrink-0 border border-slate-100 shadow-md">
                <img
                  src={dispatcherPortrait}
                  alt="Verified Dispatcher"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Description */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold mb-3 border border-blue-100">
                  <CheckCircle size={11} />
                  Certified Officer
                </span>
                <h4 className="text-xl font-bold tracking-tight text-slate-900 mb-2">
                  Live Dispatch Team
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Dedicated 24/7 bilingual dispatchers safeguarding Bahir Dar with human compassion and real-time response.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">
                  Helen Mengistu • Head Dispatch
                </span>
              </div>
              <span className="text-[10px] font-semibold text-blue-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                Online
              </span>
            </div>
          </motion.div>

          {/* ── BENTO 3: STACKED TELEMETRY & SECOND OFFICER CARD (Right, span 3) ── */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Top Telemetry Widget */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-5 rounded-3xl bg-slate-900 text-white border border-white/10 shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Telemetry Relay
                </span>
                <Radio size={14} className="text-emerald-400 animate-pulse" />
              </div>
              <div className="text-lg font-black tracking-tight text-white mb-1">
                11.5742° N, 37.3614° E
              </div>
              <div className="text-[11px] text-blue-400 font-semibold">
                Lake Tana Central Grid
              </div>
            </motion.div>

            {/* Bottom Second Officer Card */}
            <motion.div
              whileHover={{ y: -2 }}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                <img
                  src={officerPortrait}
                  alt="Amanuel Tessema"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">
                  Commander Amanuel
                </h5>
                <p className="text-[10px] text-slate-500 mb-1">
                  Crime & Patrol Coordinator
                </p>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active Duty
                </span>
              </div>
            </motion.div>
          </div>

        </div>

        {/* ── ROW 2 BENTO: CIVIC SERVICES + 3D ANALYTICS (MATCHING REFERENCE) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ── BENTO 4: CIVIC SERVICES MULTI-PILL CARD (Left, span 6) ── */}
          <motion.div
            whileHover={{ y: -4 }}
            className="lg:col-span-6 p-8 rounded-[2.5rem] bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-600 block mb-2">
                Public Administration
              </span>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-3">
                Unified Civic Public Services
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                Seamless digital services for water utilities, business licensing, and civic infrastructure with automated tracking and resolution receipts.
              </p>

              {/* 3 Service Tiers / Pricing-style Pills (Matching Reference) */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Water Works</span>
                  <span className="text-base font-black text-slate-900">24 hr</span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-[10px] font-bold text-blue-600 block mb-1">Power Grid</span>
                  <span className="text-base font-black text-blue-900">12 hr</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Municipal</span>
                  <span className="text-base font-black text-slate-900">Instant</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-600">
                100% Digital Processing
              </span>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5">
                <span>View All Services</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>

          {/* ── BENTO 5: 3D CHARTS & DEPLOYED UNITS CARD (Right, span 6) ── */}
          <motion.div
            whileHover={{ y: -4 }}
            className="lg:col-span-6 p-8 rounded-[2.5rem] bg-slate-950 text-white border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              {/* 3D Chart Render Thumbnail */}
              <div className="w-full sm:w-44 h-44 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                <img
                  src={glassCharts}
                  alt="3D Analytics Graph"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Data & Telemetry (Matching Reference) */}
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-cyan-400 block mb-2">
                  Real-Time Analytics
                </span>
                <h4 className="text-2xl font-black tracking-tight text-white mb-2">
                  58 Active Units
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Autonomous priority routing and predictive deployment across all kebeles in Bahir Dar.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Peak Efficiency: 98.4%
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>ALGORITHM: SMART DISPATCH V2</span>
              <span className="text-blue-400 font-bold">ALL NODES SYNCHRONIZED</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;