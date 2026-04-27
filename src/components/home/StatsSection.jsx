import { useEffect, useState, useRef } from "react";
import { FaFire, FaUsers, FaBuilding, FaClock, FaArrowUp } from "react-icons/fa";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

const statsData = [
  { 
    label: "Incidents Managed", 
    value: 1250, 
    icon: <FaFire />,
    suffix: "+",
    color: "text-orange-500",
    glow: "shadow-orange-500/10"
  },
  { 
    label: "Active Responders", 
    value: 328, 
    icon: <FaUsers />,
    suffix: "+",
    color: "text-blue-600",
    glow: "shadow-blue-500/10"
  },
  { 
    label: "Partner Agencies", 
    value: 42, 
    icon: <FaBuilding />,
    suffix: "",
    color: "text-indigo-600",
    glow: "shadow-indigo-500/10"
  },
  { 
    label: "System Availability", 
    value: 99.9, 
    icon: <FaClock />,
    suffix: "%",
    color: "text-emerald-600",
    glow: "shadow-emerald-500/10"
  },
];

const Counter = ({ value, suffix }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const springValue = useSpring(0, {
    stiffness: 40,
    damping: 20,
    restDelta: 0.001
  });

  useEffect(() => {
    if (inView) springValue.set(value);
  }, [inView, value, springValue]);

  const display = useTransform(springValue, (latest) => 
    value % 1 !== 0 ? latest.toFixed(1) : Math.floor(latest).toLocaleString()
  );

  return (
    <div ref={ref} className="flex items-baseline gap-1 mb-1">
      <motion.span className="text-4xl lg:text-5xl font-normal text-slate-900 tracking-tighter">
        {display}
      </motion.span>
      <span className="text-xl text-blue-600 font-medium tracking-tight">
        {suffix}
      </span >
    </div>
  );
};

const StatsSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative w-full py-32 bg-white overflow-hidden flex flex-col">
      {/* SHARED BACKGROUND DECOR */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-blue-50 blur-[100px] rounded-full" 
        />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-8 w-full">
        {/* HEADER SECTION */}
        <header className="mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="w-10 h-[1px] bg-blue-600"></span>
            <span className="text-blue-600 font-medium uppercase text-[10px] tracking-[0.4em]">
              Operational Intelligence
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
            className="text-4xl lg:text-5xl text-slate-900 tracking-tight leading-[1.1] font-normal"
          >
            Impact in Numbers <br />
            <span className="text-slate-400 italic font-light text-2xl lg:text-3xl">Systemized community safety protocols.</span>
          </motion.h2>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.7, 
                delay: 0.4 + (idx * 0.1),
                ease: [0.21, 0.47, 0.32, 0.98] 
              }}
              whileHover={{ y: -10 }}
              className="group relative h-full"
            >
              <div className="bg-slate-50/40 border border-slate-100 rounded-[2rem] p-8 transition-all duration-500 hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:border-blue-100/50 flex flex-col items-start h-full">
                
                {/* ICON BOX */}
                <div className={`w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center ${stat.color} mb-8 shadow-sm group-hover:shadow-lg ${stat.glow} transition-all duration-500`}>
                  <motion.span 
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    className="text-xl"
                  >
                    {stat.icon}
                  </motion.span>
                </div>
                
                {/* COUNTER COMPONENT */}
                <Counter value={stat.value} suffix={stat.suffix} />
                
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-semibold mb-8">
                  {stat.label}
                </p>

                {/* GROWTH INDICATOR */}
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100/60 w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                      <FaArrowUp size={7} className="text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold">+12.4%</span>
                  </div>
                  <span className="text-[9px] text-slate-300 uppercase tracking-widest font-bold">MoM Growth</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ANCHOR FOOTER */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-20 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] text-slate-400 font-semibold uppercase tracking-[0.3em]"
        >
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <motion.span 
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1 h-1 bg-blue-600 rounded-full"
                />
              ))}
            </div>
            <span>System Integrity: 100%</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="opacity-40">BahirLink Digital Assets</span>
            <span className="text-blue-600">Metric synchronization active</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;