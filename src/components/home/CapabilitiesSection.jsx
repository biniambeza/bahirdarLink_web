import React from "react";
import { 
  Bell, 
  Users, 
  Map, 
  Shield, 
  Activity, 
  TrendingUp, 
  ArrowRight 
} from "lucide-react";
import { motion } from "framer-motion";

const capabilities = [
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Incident Monitoring",
    description: "Track incidents reported from mobile applications in real time with AI-powered diagnostics.",
    tag: "Real-time tracking",
    bgAccent: "bg-blue-50 text-blue-600 border-blue-100"
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Agency Coordination",
    description: "Unified dispatch for police, fire, and medical units with smart routing protocols.",
    tag: "Multi-agency",
    bgAccent: "bg-indigo-50 text-indigo-600 border-indigo-100"
  },
  {
    icon: <Map className="w-5 h-5" />,
    title: "Live Map View",
    description: "Geospatial visualization for faster response decisions using advanced heat mapping.",
    tag: "3D visualization",
    bgAccent: "bg-emerald-50 text-emerald-600 border-emerald-100"
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Resource Management",
    description: "Efficiently deploy personnel and equipment with real-time availability updates.",
    tag: "Resource tracking",
    bgAccent: "bg-amber-50 text-amber-600 border-amber-100"
  },
  {
    icon: <Activity className="w-5 h-5" />,
    title: "Emergency Dispatch",
    description: "Automated priority-based routing and ETA calculations for critical response.",
    tag: "Smart dispatch",
    bgAccent: "bg-sky-50 text-sky-600 border-sky-100"
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Analytics Dashboard",
    description: "Comprehensive reporting and performance optimization for administrative oversight.",
    tag: "Real-time insights",
    bgAccent: "bg-purple-50 text-purple-600 border-purple-100"
  }
];

// Stagger Animation Variants for the Grid Container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 }
  }
};

const CapabilitiesSection = () => {
  return (
    <div className="relative w-full min-h-screen bg-slate-50 text-slate-900 overflow-hidden flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* PREMIUM BRIGHT BACKGROUND GRAPHICS */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle geometric dot grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
        {/* Soft, professional gradient glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[60%] bg-blue-100/50 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] bg-sky-100/40 blur-[110px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-[1280px] mx-auto px-6 md:px-12 pt-32 pb-16 w-full flex-grow justify-between">
        
        {/* HEADER SECTION */}
        <header className="mb-16 md:mb-20 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5 mb-4"
          >
            <span className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
            <span className="text-blue-600 font-semibold uppercase text-xs tracking-[0.2em]">
              Platform Capabilities
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight font-extrabold leading-[1.15] mb-6"
          >
            Unified Emergency <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">Response Infrastructure</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-500 font-normal max-w-2xl leading-relaxed"
          >
            High-availability tools engineered for public safety agencies. Monitor, coordinate, and dispatch resources with absolute precision.
          </motion.p>
        </header>

        {/* FEATURE GRID */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        >
          {capabilities.map((cap, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/[0.04] transition-all duration-300"
            >
              <div>
                {/* Header Element Inside Card */}
                <div className="flex justify-between items-start mb-6">
                  {/* Icon wrapper with soft custom tint colors */}
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${cap.bgAccent}`}>
                    {cap.icon}
                  </div>
                  
                  {/* Tech-inspired index label */}
                  <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-blue-400 tracking-wider transition-colors duration-300">
                    // 0{index + 1}
                  </span>
                </div>

                {/* Card Title & Description */}
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {cap.title}
                </h3>
                <p className="text-sm text-slate-500 font-normal leading-relaxed mb-6">
                  {cap.description}
                </p>
              </div>

              {/* Bottom Interactive Area */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold group-hover:text-slate-600 transition-colors">
                  {cap.tag}
                </span>
                
                <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-300 group-hover:bg-blue-50 transition-all duration-200">
                  <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* BRIGHT SCHEME FOOTER */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20 pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-slate-200 text-[10px] text-slate-400 font-mono tracking-wider w-full"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
            <span className="text-slate-600 font-semibold">ALL PROTOCOLS ONLINE // ENCRYPTED LINK</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:block opacity-60">SYSTEM INTEGRITY SECURED</span>
            <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-[9px] font-bold shadow-sm">
              RELAY CORE V1.2
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default CapabilitiesSection;