import { useState } from "react";
import { 
  FaFacebookF, FaTwitter, FaLinkedinIn, 
  FaEnvelope, FaPhoneAlt, FaMapMarkerAlt,
  FaArrowRight, FaShieldAlt
} from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="relative w-full bg-white border-t border-slate-100 overflow-hidden font-sans">
      
      {/* ARCHITECTURAL BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.15]" />
        {/* Subtle Blue Glow to match button energy */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/60 blur-[120px] rounded-full -ml-48 -mb-48 opacity-70" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-8 pt-24 pb-10">
        
        {/* TOP LEVEL: SYSTEM IDENTITY & SUBSCRIPTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
          
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="w-14 h-14 bg-blue-600 flex items-center justify-center text-white rounded-[1.25rem] shadow-xl shadow-blue-200">
                <span className="text-2xl font-bold tracking-tighter">B</span>
              </div>
              <div>
                <h2 className="text-2xl font-normal tracking-tight text-slate-900 leading-none">
                  BahirLink <span className="text-slate-400 font-light italic ml-1 text-xl">Core</span>
                </h2>
                <p className="text-[10px] uppercase tracking-[0.5em] text-blue-600 font-bold mt-1.5">
                  Infrastructure Agency
                </p>
              </div>
            </motion.div>
            
            <p className="text-slate-500 text-[15px] font-light leading-relaxed">
              The standardized protocol for emergency dispatch and inter-agency coordination. 
              Delivering high-integrity digital infrastructure to the heart of Ethiopia.
            </p>
          </div>

          {/* ATTRACTIVE NEWSLETTER BOX */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="w-full lg:w-[400px] bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] relative"
          >
            <h4 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Network Updates
            </h4>
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-2 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
              <input 
                type="email" 
                placeholder="system@access.et" 
                className="bg-transparent border-none text-sm w-full focus:ring-0 px-4 placeholder:text-slate-300 font-light"
              />
              <button className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                <FaArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* MIDDLE LEVEL: GRID DIRECTORY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pb-20">
          <div>
            <h5 className="text-[10px] uppercase tracking-[0.3em] text-slate-900 font-bold mb-8">System Directory</h5>
            <ul className="space-y-4">
              {["Central Command", "Agency Portal", "Network Map", "Status Log"].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-blue-600 transition-all font-light hover:translate-x-1 inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] uppercase tracking-[0.3em] text-slate-900 font-bold mb-8">Documentation</h5>
            <ul className="space-y-4">
              {["API Integration", "Safety Protocols", "Deployment Guide", "Legal Hub"].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-blue-600 transition-all font-light hover:translate-x-1 inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 space-y-8">
            <h5 className="text-[10px] uppercase tracking-[0.3em] text-slate-900 font-bold mb-8">Operational HQ</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Location</p>
                <p className="text-sm text-slate-700 font-light leading-relaxed">
                  Bole District, Sub-City 03 <br />
                  Addis Ababa, Ethiopia
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Communication</p>
                <p className="text-sm text-slate-700 font-light leading-relaxed">
                  terminal@bahirlink.com <br />
                  +251 900 00 00 00
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM LEVEL: COMPLIANCE & SOCIAL */}
        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-8">
            <div className="flex gap-2">
              {[<FaFacebookF />, <FaTwitter />, <FaLinkedinIn />].map((icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                  <span className="text-xs">{icon}</span>
                </a>
              ))}
            </div>
            <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">
              Protocol Sync: 2026.04
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-6 text-[10px] uppercase tracking-widest font-bold text-slate-400">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Compliance</a>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05, backgroundColor: "#1d4ed8" }}
              className="flex items-center gap-2.5 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 cursor-pointer transition-colors"
            >
              <FaShieldAlt className="text-white opacity-80" size={10} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">System Secure</span>
            </motion.div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;