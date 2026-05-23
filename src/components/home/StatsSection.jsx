import { useEffect, useState, useRef } from "react";
import { 
  Flame, 
  Users, 
  Building2, 
  Clock, 
  ArrowUpRight,
  Activity,
  Globe,
  Radio
} from "lucide-react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

const statsData = [
  { 
    label: "Incidents Managed", 
    value: 1250, 
    icon: <Flame className="w-5 h-5" />,
    suffix: "+",
    growth: "+14.2%",
    color: "text-orange-600 bg-orange-500/10 border-orange-200/50",
    glow: "from-orange-500/20 to-transparent",
    featured: true // Takes up 2 columns for layout variety
  },
  { 
    label: "Active Responders", 
    value: 328, 
    icon: <Users className="w-5 h-5" />,
    suffix: "+",
    growth: "+8.4%",
    color: "text-blue-600 bg-blue-500/10 border-blue-200/50",
    glow: "from-blue-500/20 to-transparent",
    featured: false
  },
  { 
    label: "Partner Agencies", 
    value: 42, 
    icon: <Building2 className="w-5 h-5" />,
    suffix: "",
    growth: "+2.1%",
    color: "text-indigo-600 bg-indigo-500/10 border-indigo-200/50",
    glow: "from-indigo-500/20 to-transparent",
    featured: false
  },
  { 
    label: "System Availability", 
    value: 99.9, 
    icon: <Clock className="w-5 h-5" />,
    suffix: "%",
    growth: "Stable",
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-200/50",
    glow: "from-emerald-500/20 to-transparent",
    featured: false
  },
];

const Counter = ({ value, suffix }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const springValue = useSpring(0, {
    stiffness: 45,
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
    <div ref={ref} className="flex items-baseline gap-0.5 select-none font-sans">
      <motion.span className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
        {display}
      </motion.span>
      <span className="text-xl md:text-2xl text-blue-600 font-extrabold tracking-tight">
        {suffix}
      </span>
    </div>
  );
};

const StatsSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section ref={containerRef} className="relative w-full py-28 md:py-36 bg-[#f8fafc] overflow-hidden flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* HIGH-END VECTOR MATRIX BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Modern technical linear grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)] opacity-50" />
        
        {/* Soft, professional gradient fluid colors */}
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-200/30 to-sky-200/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-gradient-to-tr from-indigo-200/20 to-purple-200/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 w-full">
        
        {/* HEADER SECTION */}
        <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-5"
            >
              <Radio size={12} className="text-blue-600 animate-pulse" />
              <span className="text-blue-700 font-bold uppercase text-[10px] tracking-widest">
                Live Engine Metrics
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl md:text-5xl lg:text-6xl text-slate-900 tracking-tight font-black leading-[1.05]"
            >
              Systemized Impact <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                In Absolute Numbers
              </span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-500 font-medium text-sm md:text-base max-w-sm border-l-2 border-slate-200 pl-4 py-1"
          >
            Real-time public safety orchestration, secure coordination, and diagnostic tracking parameters.
          </motion.p>
        </header>

        {/* ASYMMETRICAL BENTO CARD GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {statsData.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.6, 
                delay: idx * 0.06,
                type: "spring",
                stiffness: 90,
                damping: 16
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative flex flex-col justify-between p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all duration-300 shadow-[0_2px_8px_rgba(15,23,42,0.01)] hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.05)] ${
                stat.featured ? "lg:col-span-2" : "col-span-1"
              }`}
            >
              {/* Dynamic Inner Glow Overlay */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-3xl pointer-events-none`} />

              <div>
                {/* Card Header Structure */}
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  
                  {/* Premium sleek arrow icon placeholder */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowUpRight size={16} className="text-slate-400 hover:text-slate-900" />
                  </div>
                </div>

                {/* Main Dynamic Counter Value */}
                <Counter value={stat.value} suffix={stat.suffix} />
                
                <h3 className="text-xs uppercase tracking-widest text-slate-400 font-extrabold mt-3 mb-6 group-hover:text-slate-900 transition-colors">
                  {stat.label}
                </h3>
              </div>

              {/* Real-time analytical micro-chart row */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto w-full">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs text-emerald-600 font-extrabold">{stat.growth}</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                  Live Stream
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* COMPREHENSIVE RUNTIME SYSTEM STATUS FOOTER */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-24 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-slate-500 font-mono tracking-wider w-full"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-2.5">
              <Globe size={12} className="text-blue-500 animate-spin-slow" />
              <span className="text-slate-700 font-bold uppercase">Global Sync Node Active</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              <span>LATENCY: &lt;14MS</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span className="hidden lg:inline opacity-60 font-semibold">BAHIRLINK PLATFORM ASSETS</span>
            <div className="flex items-center gap-2.5 px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black shadow-sm tracking-widest">
              <Activity size={10} className="text-blue-400 animate-pulse" />
              <span>CORE OPERATIONS SECURED // 100%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;