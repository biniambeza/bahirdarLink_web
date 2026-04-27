import React from "react";
import { 
  FaMapMarkedAlt, FaUsers, FaBell, 
  FaShieldAlt, FaAmbulance, FaChartLine 
} from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const capabilities = [
  {
    icon: <FaBell />,
    title: "Incident Monitoring",
    description: "Track incidents reported from mobile applications in real time with AI-powered diagnostics.",
    stats: "Real-time tracking",
    color: "from-blue-500 to-cyan-400"
  },
  {
    icon: <FaUsers />,
    title: "Agency Coordination",
    description: "Unified dispatch for police, fire, and medical units with smart routing protocols.",
    stats: "Multi-agency",
    color: "from-indigo-500 to-purple-400"
  },
  {
    icon: <FaMapMarkedAlt />,
    title: "Live Map View",
    description: "Geospatial visualization for faster response decisions using advanced heat mapping.",
    stats: "3D visualization",
    color: "from-emerald-500 to-teal-400"
  },
  {
    icon: <FaShieldAlt />,
    title: "Resource Management",
    description: "Efficiently deploy personnel and equipment with real-time availability updates.",
    stats: "Resource tracking",
    color: "from-orange-500 to-amber-400"
  },
  {
    icon: <FaAmbulance />,
    title: "Emergency Dispatch",
    description: "Automated priority-based routing and ETA calculations for critical response.",
    stats: "Smart dispatch",
    color: "from-blue-600 to-indigo-500"
  },
  {
    icon: <FaChartLine />,
    title: "Analytics Dashboard",
    description: "Comprehensive reporting and performance optimization for administrative oversight.",
    stats: "Real-time insights",
    color: "from-violet-500 to-fuchsia-400"
  }
];

const CapabilitiesSection = () => {
  return (
    <div className="relative w-full min-h-screen bg-white text-slate-900 overflow-hidden flex flex-col selection:bg-blue-50">
      
      {/* SHARED BACKGROUND DECOR */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-blue-50 blur-[100px] rounded-full opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-[1200px] mx-auto px-8 pt-32 pb-12 w-full">
        
        {/* HEADER SECTION */}
        <header className="mb-12 lg:mb-16 relative">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="w-8 h-[1px] bg-blue-600"></span>
            <span className="text-blue-600 font-medium uppercase text-[10px] tracking-[0.3em]">
              Platform Capabilities
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-5xl text-slate-900 tracking-tight leading-tight font-normal"
          >
            Unified Emergency Response <br />
            <span className="text-slate-400 italic font-light">Advanced infrastructure for public safety.</span>
          </motion.h1>
        </header>

        {/* FEATURE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 flex-grow">
          {capabilities.map((cap, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative flex flex-col"
            >
              {/* Card Index Number (Subtle) */}
              <span className="absolute -top-4 right-2 text-slate-100 font-bold text-6xl group-hover:text-blue-50 transition-colors duration-500 pointer-events-none">
                0{index + 1}
              </span>

              {/* Icon with Color Glow */}
              <div className="relative mb-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${cap.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-full w-14 h-14`} />
                <div className={`relative w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-white transition-all duration-500 overflow-hidden shadow-sm`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${cap.color} translate-y-14 group-hover:translate-y-0 transition-transform duration-500`} />
                  <span className="relative text-xl z-10">{cap.icon}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-normal text-slate-900 tracking-tight mb-3">
                {cap.title}
              </h3>
              
              <p className="text-sm text-slate-500 font-light leading-relaxed mb-6 max-w-[90%]">
                {cap.description}
              </p>
              
              {/* Bottom Interactive Element */}
              <div className="mt-auto flex items-center gap-4">
                <div className="h-[1px] flex-grow bg-slate-100 group-hover:bg-blue-100 transition-colors" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 group-hover:text-blue-600 transition-colors font-medium">
                  {cap.stats}
                </span>
                <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all duration-300">
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SHARED FOOTER */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 pt-8 flex justify-between items-center border-t border-slate-100 text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]"
        >
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            <span>Systems Online // 2026</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="hidden md:block opacity-50">Ensuring 100% Data Integrity</span>
            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[9px] tracking-widest">
              Core Protocol v1.2
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default CapabilitiesSection;