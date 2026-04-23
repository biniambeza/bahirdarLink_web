import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen bg-white text-slate-900 flex flex-col overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-blue-50 blur-[120px] rounded-full opacity-60" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-grow max-w-[1400px] mx-auto px-8 md:px-12 flex flex-col lg:flex-row items-center gap-12 py-16">
        
        {/* Left Content Side */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-[1.2] w-full lg:text-left text-center"
        >
          {/* Status Indicator Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Platform Active</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-slate-900">
            Saving Lives, <br />
            <span className="text-blue-600">Protecting</span> <br />
            <span className="italic font-light text-slate-400">Communities</span> <br />
            <span className="relative">
              in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">Real Time</span>
            </span>
          </h1>

          <p className="text-slate-600 text-base mb-8 max-w-lg lg:mx-0 mx-auto leading-relaxed">
            A centralized platform for responders and government agencies to act <span className="text-blue-700 font-medium">faster</span>, <span className="text-blue-700 font-medium">smarter</span>, and <span className="text-blue-700 font-medium">together</span>.
          </p>

          <div className="flex items-center lg:justify-start justify-center">
            <a 
              href="#features"
              className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all inline-block shadow-sm active:scale-95"
            >
              Explore Features ↓
            </a>
          </div>
        </motion.div>

        {/* Right Content Side (Visual UI) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full relative"
        >
          <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200" 
              alt="Dashboard Preview" 
              className="w-full h-[450px] object-cover opacity-90"
            />
            
            {/* Overlay: Active Incidents */}
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-lg p-4 rounded-xl border border-slate-100 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100 text-sm">
                  📡
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">12</div>
                  <div className="text-[9px] uppercase tracking-widest text-blue-600 font-bold mt-1">Live Incidents</div>
                </div>
              </div>
            </div>

            {/* Overlay: Response Time */}
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-lg p-4 rounded-xl border border-slate-100 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm shadow-md">
                  ⚡
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Response</div>
                  <div className="text-xl font-black text-blue-600 leading-none">&lt; 3 min</div>
                </div>
              </div>
            </div>

            {/* Systems Indicator */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white">Secure Node</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Features Grid */}
      <div id="features" className="relative z-10 w-full max-w-[1400px] mx-auto px-8 md:px-12 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
          {[
            { label: "Real-Time Coordination", icon: "🛡️" },
            { label: "Live Tracking", icon: "📍" },
            { label: "Instant Alerts", icon: "🔔" },
            { label: "Smart Analytics", icon: "📊" },
          ].map((feature, i) => (
            <div key={i} className="p-4 flex items-center gap-4 hover:bg-white hover:shadow-md rounded-2xl transition-all cursor-default group border border-transparent hover:border-slate-100">
              <div className="w-10 h-10 bg-blue-100/50 text-blue-600 rounded-xl flex items-center justify-center text-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                {feature.icon}
              </div>
              <div>
                <span className="text-xs font-bold block text-slate-900">{feature.label}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Integrated</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;