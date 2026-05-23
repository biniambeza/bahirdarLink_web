import { useState } from "react";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  ArrowRight, 
  ShieldAlert, 
  MapPin, 
  Mail, 
  PhoneCall,
  Globe2,
  Radio
} from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Action logic
  };

  return (
    <footer className="relative w-full bg-white border-t border-slate-200/60 overflow-hidden font-sans">
      
      {/* ARCHITECTURAL MODERN BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        {/* Soft fluid light rings */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-gradient-to-tr from-blue-100/40 to-sky-100/10 blur-[130px] rounded-full" />
        <div className="absolute top-[10%] left-[-5%] w-[350px] h-[350px] bg-indigo-50/50 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-6 md:px-12 pt-24 pb-12">
        
        {/* TOP LAYER: BRAND PROFILE AND NEWSLETTER PLATFORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start pb-20 border-b border-slate-100">
          
          <div className="lg:col-span-7 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3.5 mb-6"
            >
              <div className="w-12 h-12 bg-blue-600 flex items-center justify-center text-white rounded-2xl shadow-xl shadow-blue-500/10 font-black text-xl">
                B
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                  BahirLink <span className="bg-slate-100 text-slate-600 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md font-bold border border-slate-200">CORE</span>
                </h2>
                <p className="text-[9px] uppercase tracking-[0.3em] text-blue-600 font-extrabold mt-0.5">
                  Infrastructure Coordination Agency
                </p>
              </div>
            </motion.div>
            
            <p className="text-slate-500 text-sm md:text-base font-normal leading-relaxed max-w-xl">
              The standardized architectural protocol for emergency dispatch and inter-agency synchronization. Delivering robust digital security protocols and critical structural networking across Bahir Dar and the Amhara region.
            </p>
          </div>

          {/* NEWSLETTER INTERFACE INPUT */}
          <div className="lg:col-span-5 w-full lg:max-w-md lg:ml-auto">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/60 shadow-sm">
              <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold mb-4 flex items-center gap-2">
                <Radio size={12} className="text-blue-500 animate-pulse" />
                Network System Logs
              </h4>
              <form onSubmit={handleSubscribe} className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.06)] transition-all duration-300">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@domain.et" 
                  className="bg-transparent border-0 text-sm w-full focus:ring-0 px-3 text-slate-800 placeholder:text-slate-300 font-medium outline-none"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/10 group">
                  <ArrowRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* MIDDLE LAYER: ASYMMETRICAL DIRECTORY SETUP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8 pt-20 pb-16">
          
          <div>
            <h5 className="text-[10px] uppercase tracking-widest text-slate-900 font-black mb-6">System Directory</h5>
            <ul className="space-y-3.5">
              {["Central Command", "Agency Portal", "Network Map", "Status Log"].map(item => (
                <li key={item}>
                  <a href="#" className="text-xs md:text-sm text-slate-400 hover:text-blue-600 transition-colors font-medium inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] uppercase tracking-widest text-slate-900 font-black mb-6">Documentation</h5>
            <ul className="space-y-3.5">
              {["API Integration", "Safety Protocols", "Deployment Guide", "Legal Hub"].map(item => (
                <li key={item}>
                  <a href="#" className="text-xs md:text-sm text-slate-400 hover:text-blue-600 transition-colors font-medium inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* REDESIGNED REGIONAL HEADQUARTERS SCHEME */}
          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 bg-slate-50/50 border border-slate-200/40 p-6 rounded-2xl">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin size={12} className="text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-wider">Regional HQ</span>
              </div>
              <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed">
                Kebele 14, Infrastructure Hub <br />
                <span className="font-bold text-slate-900">Bahir Dar, Ethiopia</span>
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Globe2 size={12} className="text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-wider">Communications</span>
              </div>
              <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed">
                terminal@bahirlink.com <br />
                <span className="font-mono font-semibold">+251 58 220 0000</span>
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM LAYER: COMPLIANCE CORE AND GLOBAL METRICS */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6">
            {/* Minimal Social Blocks */}
            <div className="flex gap-2">
              {[
                { icon: <Facebook size={13} />, label: "Facebook" },
                { icon: <Twitter size={13} />, label: "Twitter" },
                { icon: <Linkedin size={13} />, label: "LinkedIn" }
              ].map((item, i) => (
                <a key={i} href="#" aria-label={item.label} className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200">
                  {item.icon}
                </a>
              ))}
            </div>
            <div className="hidden md:block h-4 w-[1px] bg-slate-200" />
            <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
              Protocol Sync: 2026.05
            </span>
          </div>

          {/* Operational Encryption Badge */}
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-[10px] uppercase tracking-widest font-extrabold text-slate-400">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Compliance</a>
            </div>
            
            <motion.div 
              whileHover={{ y: -1 }}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-sm cursor-pointer"
            >
              <ShieldAlert className="text-blue-400 animate-pulse" size={12} />
              <span className="text-[9px] font-mono font-black tracking-widest uppercase">System Secure</span>
            </motion.div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;