import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronRight, 
  PhoneCall, 
  Radio 
} from "lucide-react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 40;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
          scrolled
            ? "py-3 px-4 sm:px-8"
            : "py-5 px-4 sm:px-8"
        }`}
      >
        <div
          className={`max-w-[1400px] mx-auto rounded-3xl transition-all duration-500 px-5 md:px-8 py-2.5 flex justify-between items-center ${
            scrolled
              ? "bg-white/85 backdrop-blur-2xl border border-white/60 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5 text-slate-900"
              : "bg-slate-950/45 backdrop-blur-xl border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.3)] text-white"
          }`}
        >
          {/* ── LOGO BRANDING ── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
            onClick={() => navigate("/")}
          >
            {/* Glowing Logo Container */}
            <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center p-1.5 transition-all duration-500 border ${
              scrolled
                ? "bg-white/80 border-slate-200/80 shadow-sm group-hover:border-blue-300"
                : "bg-slate-900/70 border-white/20 shadow-md group-hover:border-cyan-400/50"
            }`}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-sky-400/20 blur-[6px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img
                src="/logo.webp"
                alt="BahirLink Logo"
                className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-2">
                <span className={`text-xl md:text-2xl font-black tracking-tight transition-colors ${
                  scrolled ? "text-slate-900" : "text-white drop-shadow-sm"
                }`}>
                  BAHIR<span className="bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 bg-clip-text text-transparent">LINK</span>
                </span>
                <span className={`hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                  scrolled
                    ? "bg-emerald-500/10 text-emerald-700 border-emerald-300/60"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 backdrop-blur-md"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Dispatch
                </span>
              </div>
              <span className={`text-[8px] uppercase tracking-[0.28em] font-extrabold ${
                scrolled ? "text-slate-500" : "text-slate-300/90"
              }`}>
                Urban Coordination • Bahir Dar
              </span>
            </div>
          </motion.div>

          {/* ── DESKTOP NAVIGATION ── */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <nav className={`flex items-center p-1.5 rounded-2xl backdrop-blur-md transition-colors border ${
              scrolled
                ? "bg-slate-900/[0.04] border-slate-900/[0.05]"
                : "bg-white/10 border-white/15"
            }`}>
              {navLinks.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => navigate(item.path)}
                    className={`relative px-4 lg:px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-200 rounded-xl select-none ${
                      isActive
                        ? scrolled
                          ? "text-blue-700 font-extrabold"
                          : "text-white font-extrabold"
                        : scrolled
                        ? "text-slate-600 hover:text-slate-900"
                        : "text-slate-200 hover:text-white"
                    }`}
                  >
                    {/* Active Pill Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className={`absolute inset-0 rounded-xl ${
                          scrolled
                            ? "bg-white shadow-[0_2px_12px_rgba(37,99,235,0.12)] border border-blue-100"
                            : "bg-white/20 backdrop-blur-md shadow-lg border border-white/30"
                        }`}
                      />
                    )}

                    {/* Hover Glow Effect */}
                    {!isActive && hoveredIndex === index && (
                      <motion.div
                        layoutId="hoverNavPill"
                        transition={{ duration: 0.15 }}
                        className={`absolute inset-0 rounded-xl ${
                          scrolled ? "bg-white/60" : "bg-white/15"
                        }`}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-1.5">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Emergency Hotline Quick Badge */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold tracking-wider uppercase ${
              scrolled
                ? "bg-red-500/[0.08] border-red-500/20 text-red-600"
                : "bg-red-500/20 border-red-400/30 text-red-300 backdrop-blur-md"
            }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>SOS: 911 / 991</span>
            </div>

            {/* Command Center CTA Button */}
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="relative group overflow-hidden flex items-center gap-2.5 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[11px] uppercase tracking-[0.16em] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform" />
              
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200 transition-transform group-hover:scale-110" />
              <span>Command Center</span>
            </motion.button>
          </div>

          {/* ── MOBILE MENU TOGGLE ── */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2.5 rounded-2xl border backdrop-blur-md transition-all shadow-sm ${
              scrolled
                ? "text-slate-800 bg-white/80 border-slate-200 hover:bg-white"
                : "text-white bg-slate-900/60 border-white/20 hover:bg-slate-900/80"
            }`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[105] md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full max-w-[320px] bg-white/95 backdrop-blur-2xl z-[110] shadow-2xl flex flex-col p-6 md:hidden border-l border-slate-100 text-slate-900"
            >
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1.5 shadow-sm">
                    <img src="/logo.webp" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                      BAHIR<span className="text-blue-600">LINK</span>
                    </span>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                      Urban Safety Portal
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="my-5 p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Radio size={14} className="animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900">
                    24/7 Response Active
                  </div>
                  <div className="text-[9px] text-blue-600 font-medium">
                    Lake Tana • Bahir Dar Metro
                  </div>
                </div>
              </div>

              <nav className="flex flex-col gap-2.5">
                {navLinks.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      key={item.name}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                      className={`text-left py-3.5 px-5 rounded-2xl text-[12px] font-extrabold tracking-wider uppercase transition-all flex items-center justify-between group ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                          : "bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronRight
                        size={14}
                        className={`transition-transform group-hover:translate-x-1 ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                        }`}
                      />
                    </motion.button>
                  );
                })}
              </nav>

              <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <PhoneCall size={14} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-red-900">
                      Emergency Hotlines
                    </div>
                    <div className="text-[9px] text-red-600 font-bold">
                      Police: 991 • Fire: 911
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100">
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-blue-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl active:scale-95 transition-all"
                >
                  <ShieldCheck size={16} className="text-blue-300" />
                  <span>Access Command Center</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;