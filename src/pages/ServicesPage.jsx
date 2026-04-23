import React from "react";
import { Shield, Flame, Ambulance, PhoneCall, ArrowRight, Zap, Target, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const services = [
  {
    title: "Police Emergency Response",
    desc: "Strategic unit coordination and real-time GPS dispatch tracking.",
    icon: Shield,
    color: "blue",
  },
  {
    title: "Fire & Rescue Services",
    desc: "Immediate hazard mitigation and thermal-assisted rescue routing.",
    icon: Flame,
    color: "slate",
  },
  {
    title: "Medical Emergency Support",
    desc: "Advanced life-support dispatch with integrated patient monitoring.",
    icon: Ambulance,
    color: "blue",
  },
  {
    title: "Unified Command Hub",
    desc: "A centralized AI-driven interface connecting all public sectors.",
    icon: PhoneCall,
    color: "slate",
  }
];

const ServicesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen bg-white text-slate-900 overflow-hidden flex flex-col font-sans selection:bg-blue-50">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50/60 blur-[120px] rounded-full" />
        <div className="absolute bottom-[0%] right-[-5%] w-[30%] h-[40%] bg-slate-50 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-[1200px] mx-auto px-8 pt-32 pb-10">
        
        {/* HEADER: Minimal & Non-Bold */}
        <header className="mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-[1px] w-12 bg-blue-600" />
            <span className="text-blue-600 font-medium uppercase text-[10px] tracking-[0.4em]">
              Service Ecosystem
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-light text-slate-900 tracking-tight leading-[1.1]"
          >
            Mission-critical services <br />
            <span className="text-slate-400 font-light italic">engineered for public safety.</span>
          </motion.h1>
        </header>

        {/* SERVICES GRID: Modern Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-grow">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white border border-slate-100 rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-blue-100"
            >
              {/* Card Decor */}
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                 <s.icon size={80} />
              </div>

              <div>
                <div className={`w-12 h-12 rounded-2xl ${s.color === 'blue' ? 'bg-blue-600' : 'bg-slate-900'} flex items-center justify-center mb-8 shadow-lg group-hover:rotate-[10deg] transition-transform`}>
                  <s.icon className="text-white h-5 w-5 font-light" />
                </div>
                
                {/* Unified Title Color, Not Bold */}
                <h3 className="text-xl font-normal text-slate-900 mb-4 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm font-light">
                  {s.desc}
                </p>
              </div>

              <div className="pt-6">
                <div className="h-[1px] w-0 group-hover:w-full bg-blue-600/20 transition-all duration-500 mb-4" />
                <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
                  Protocol 0{i + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FOOTER: Metrics & Navigation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col md:flex-row items-center justify-between border-t border-slate-100 pt-8 gap-8"
        >
          <div className="flex gap-12">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-900 tracking-wide">3min</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest">Avg Response</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-900 tracking-wide">24/7/365</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest">Availability</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-900 tracking-wide">50+ Cities</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest">Live Coverage</span>
            </div>
          </div>

          <button 
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 px-6 py-3 rounded-full border border-slate-900 text-slate-900 text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all group"
          >
            Access Command Center
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default ServicesPage;