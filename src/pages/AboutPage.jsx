import React from "react";
import { Users, Globe, Activity, Info, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { 
    title: "Our Mission", 
    desc: "Connecting emergency services through a unified digital pulse.", 
    icon: Activity, 
    gradient: "from-blue-600 to-blue-400" 
  },
  { 
    title: "Global Vision", 
    desc: "Scaling response technology across cities and borders.", 
    icon: Globe, 
    gradient: "from-slate-800 to-slate-600" 
  },
  { 
    title: "Community", 
    desc: "Citizen-first engagement for critical safety moments.", 
    icon: Users, 
    gradient: "from-blue-600 to-indigo-500" 
  },
  { 
    title: "Reliability", 
    desc: "Transparent, accurate, and military-grade coordination.", 
    icon: Info, 
    gradient: "from-slate-900 to-blue-900" 
  },
];

const capabilities = [
  "Real-time Incident Tracking",
  "Multi-Agency Interoperability",
  "AI-Driven Dispatch Optimization",
  "Encrypted Data Frameworks"
];

const AboutPage = () => {
  return (
    <div className="relative w-full min-h-screen lg:h-screen bg-white text-slate-900 overflow-hidden flex flex-col">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      <div className="absolute top-[-10%] right-[-5%] w-[50%] lg:w-[30%] h-[40%] lg:h-[50%] bg-blue-50 blur-[100px] rounded-full opacity-50" />

      <div className="relative z-10 flex flex-col h-full max-w-[1200px] mx-auto px-6 lg:px-8 pt-24 lg:pt-32 pb-8 lg:pb-12">
        
        {/* HEADER SECTION */}
        <div className="mb-10 lg:mb-14">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="h-px w-10 bg-blue-600" />
            <span className="text-blue-600 font-medium uppercase text-[10px] tracking-[0.4em]">
              The Core Architecture
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.1] font-normal text-slate-900"
          >
            <span className="block mb-1">
              Advancing emergency response
            </span>
            <span className="block italic text-slate-500">
              through integrated technology.
            </span>
          </motion.h1>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-10 lg:mb-12">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-6 flex flex-col transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 hover:border-blue-100/50"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-6 shadow-md shadow-blue-900/10`}>
                <f.icon className="text-white h-5 w-5" />
              </div>
              {/* Title: Slate-900 and Not Bold */}
              <h3 className="text-lg font-normal text-slate-900 mb-2 tracking-tight">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-xs lg:text-[13px]">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CAPABILITIES SECTION */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex-grow"
        >
          <div className="flex items-center gap-4 mb-6">
             <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Core Capabilities</p>
             <div className="h-px flex-grow bg-slate-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {capabilities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 group">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-sm text-slate-600 font-normal tracking-tight">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FOOTER */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 pt-8 text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] gap-4"
        >
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Systems Online // 2026</span>
          </div>
          <span className="opacity-50">v2.4.0 Deployment</span>
        </motion.div>

      </div>
    </div>
  );
};

export default AboutPage;