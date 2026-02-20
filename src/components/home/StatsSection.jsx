import { useEffect, useState, useRef } from "react";
import { FaFire, FaUsers, FaBuilding, FaClock, FaArrowUp } from "react-icons/fa";
import { motion } from "framer-motion";

const statsData = [
  { 
    label: "Incidents Managed", 
    value: 1250, 
    icon: <FaFire />,
    suffix: "+",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50"
  },
  { 
    label: "Active Responders", 
    value: 328, 
    icon: <FaUsers />,
    suffix: "+",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50"
  },
  { 
    label: "Partner Agencies", 
    value: 42, 
    icon: <FaBuilding />,
    suffix: "",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50"
  },
  { 
    label: "System Availability", 
    value: 99.9, 
    icon: <FaClock />,
    suffix: "%",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50"
  },
];

const StatsSection = () => {
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const intervals = statsData.map((stat, idx) => {
      const increment = Math.ceil(stat.value / 50);
      let currentCount = 0;
      
      return setInterval(() => {
        currentCount += increment;
        if (currentCount >= stat.value) {
          currentCount = stat.value;
          clearInterval(intervals[idx]);
        }
        
        setCounts(prev => {
          const newCounts = [...prev];
          newCounts[idx] = Math.floor(currentCount);
          return newCounts;
        });
      }, 30);
    });

    return () => intervals.forEach(interval => clearInterval(interval));
  }, [isInView]);

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
        {/* Simple pattern overlay instead of SVG data URL */}
        <div className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Real-time statistics showing our commitment to community safety
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-white rounded-2xl transform group-hover:scale-105 transition-transform duration-300 opacity-0 group-hover:opacity-10" />
              
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all">
                {/* Icon with gradient */}
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white text-2xl mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                
                {/* Counter */}
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {typeof stat.value === 'number' ? 
                      (stat.value % 1 !== 0 ? counts[idx].toFixed(1) : counts[idx].toLocaleString()) 
                      : counts[idx].toLocaleString()}
                  </span>
                  <span className="text-2xl text-blue-200 font-semibold">
                    {stat.suffix}
                  </span>
                </div>
                
                {/* Label */}
                <p className="text-blue-100 font-medium mb-4">
                  {stat.label}
                </p>
                
                {/* Growth indicator */}
                <div className="flex items-center gap-2 text-sm">
                  <FaArrowUp className="text-green-300" />
                  <span className="text-green-300">+12% this month</span>
                </div>
                
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: "75%" } : {}}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className={`h-full bg-gradient-to-r ${stat.color}`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom decorative elements */}
        <div className="mt-16 flex justify-center gap-4">
          {[1,2,3].map((dot) => (
            <motion.div
              key={dot}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: dot * 0.3 }}
              className="w-2 h-2 bg-white/50 rounded-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;