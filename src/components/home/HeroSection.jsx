import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowRight, FaVideo, FaComments, 
  FaShieldAlt, FaApple, FaGooglePlay 
} from "react-icons/fa";

// Relative paths for your assets
import emergencyImg from "../../../assets/images/fire.jpg";
import serviceImg from "../../../assets/images/crime.jpg";
import safetyImg from "../../../assets/images/medical.jpg";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { img: emergencyImg, label: "Emergency Response" },
    { img: serviceImg, label: "Public Service" },
    { img: safetyImg, label: "Public Safety" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full min-h-screen bg-blue-50/50 overflow-hidden flex items-center font-sans tracking-tight">
      
      {/* --- NATURAL BACKGROUND ENGINE --- */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Natural Exposure */}
            <motion.div 
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6, ease: "easeOut" }}
              className="w-full h-full bg-cover bg-center"
              style={{ 
                backgroundImage: `url('${slides[currentSlide].img}')`,
              }}
            />
            {/* Soft Blue-to-Transparent Gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/95 via-blue-50/40 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- MAIN INTERFACE --- */}
      <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-12 w-full grid lg:grid-cols-12 gap-12 items-center pt-24 pb-32">
        
        {/* Left: Content and Primary CTAs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-6"
        >
          <div className="mb-6">
            <span className="bg-blue-600/10 backdrop-blur-md text-blue-900 text-[10px] font-bold px-4 py-2 rounded-full tracking-[0.2em] uppercase border border-blue-200 inline-block">
              Bahir Dar • Urban Hub
            </span>
          </div>

          <h1 className="text-7xl md:text-[100px] font-black text-slate-900 leading-[0.85] tracking-tighter mb-8 uppercase">
            BAHIR<span className="text-blue-600/30">LINK</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-800 max-w-lg leading-relaxed mb-10 font-medium">
            A unified digital ecosystem connecting citizens with real-time public services and safety response teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-9 py-5 rounded-2xl bg-slate-950 text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-4 shadow-xl"
            >
              Start Exploring <FaArrowRight className="text-[10px]" />
            </motion.button>
            
            <div className="flex gap-2">
               <motion.a href="#" className="p-4 bg-blue-50/40 backdrop-blur-md border border-blue-100 rounded-2xl text-slate-900 hover:bg-white transition-all shadow-sm">
                  <FaApple className="text-xl" />
               </motion.a>
               <motion.a href="#" className="p-4 bg-blue-50/40 backdrop-blur-md border border-blue-100 rounded-2xl text-slate-900 hover:bg-white transition-all shadow-sm">
                  <FaGooglePlay className="text-lg" />
               </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Right: Feature HUD Cards (Light Blue Glass) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="lg:col-span-6 hidden lg:block"
        >
          <div className="grid grid-cols-2 gap-4">
            
            {/* Box 1: Glass Blue */}
            <div className="bg-blue-50/20 backdrop-blur-2xl p-8 rounded-[2.2rem] border border-white/40 shadow-sm hover:bg-blue-100/30 transition-all duration-500">
              <FaVideo className="text-2xl mb-4 text-slate-900" />
              <h4 className="font-bold text-sm text-slate-900 uppercase tracking-widest">Video Call</h4>
              <p className="text-[11px] text-slate-700 mt-1 font-semibold opacity-70">Visual assessment.</p>
            </div>

            {/* Box 2: Clear Frost */}
            <div className="bg-white/30 backdrop-blur-2xl p-8 rounded-[2.2rem] border border-white/50 shadow-sm transition-all duration-500">
              <FaComments className="text-2xl mb-4 text-slate-900" />
              <h4 className="font-bold text-sm text-slate-900 uppercase tracking-widest">Direct Chat</h4>
              <p className="text-[11px] text-slate-700 mt-1 font-semibold opacity-70">24/7 Response.</p>
            </div>

            {/* Box 3: Minimal Language */}
            <div className="bg-white/30 backdrop-blur-2xl p-8 rounded-[2.2rem] border border-white/50 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 bg-blue-600/90 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-200">ሀ</div>
              <div>
                <h4 className="font-bold text-[12px] text-slate-900 uppercase tracking-tighter">Amharic</h4>
                <p className="text-[10px] text-slate-700 font-semibold opacity-60">Full Support</p>
              </div>
            </div>

            {/* Box 4: Minimal Security */}
            <div className="bg-blue-50/20 backdrop-blur-2xl p-8 rounded-[2.2rem] border border-white/40 shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 border border-blue-200 rounded-xl flex items-center justify-center bg-white/50">
                <FaShieldAlt className="text-xl text-slate-900" />
              </div>
              <div>
                <h4 className="font-bold text-[12px] text-slate-900 uppercase tracking-tighter">Secure</h4>
                <p className="text-[10px] text-slate-700 font-semibold opacity-60">End-to-End</p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* --- NATURAL BOTTOM FADE --- */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-50 via-blue-50/50 to-transparent z-30" />
    </section>
  );
};

export default Hero;