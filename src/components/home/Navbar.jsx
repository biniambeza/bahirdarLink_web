import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Menu, 
  X, 
  ChevronRight, 
  PhoneCall, 
  Radio, 
  ShieldCheck 
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 30;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[100] px-4 sm:px-8 pt-5 transition-all duration-300">
        <div
          className={`max-w-[1240px] mx-auto rounded-full px-6 py-3 flex items-center justify-between transition-all duration-500 ${
            scrolled
              ? "bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5"
              : "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          }`}
        >
          {/* ── LOGO (MATCHING REFERENCE MINIMALIST STYLE) ── */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center p-1.5 shadow-sm text-white transition-transform group-hover:scale-105">
              <img
                src="/logo.webp"
                alt="BahirLink Logo"
                className="w-full h-full object-contain brightness-0 invert"
              />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              BAHIR<span className="text-blue-600">LINK</span>
            </span>
          </div>

          {/* ── CENTER NAVIGATION WITH SUBTLE ARROW (EXACT MATCH TO REFERENCE) ── */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`text-[12px] font-semibold tracking-wide transition-colors ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ArrowRight size={11} />
            </div>
          </nav>

          {/* ── RIGHT PILL CTA BUTTON (EXACT MATCH TO REFERENCE DARK PILL) ── */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-blue-600 text-white font-bold text-[11px] tracking-wide transition-all duration-300 shadow-md shadow-slate-900/10"
            >
              Command Center
            </motion.button>
          </div>

          {/* ── MOBILE MENU TOGGLE ── */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full text-slate-800 bg-white/80 border border-slate-200/60 shadow-xs"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
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
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[105] md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full max-w-[300px] bg-white z-[110] shadow-2xl flex flex-col p-6 md:hidden border-l border-slate-100 text-slate-900"
            >
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center p-1.5 text-white">
                    <img src="/logo.webp" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
                  </div>
                  <span className="text-base font-black text-slate-900">
                    BAHIR<span className="text-blue-600">LINK</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-col gap-2.5 my-6">
                {navLinks.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                      className={`text-left py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-between ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronRight size={14} />
                    </button>
                  );
                })}
              </nav>

              <div className="mt-auto">
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-full font-bold text-xs shadow-lg hover:bg-blue-600 transition-colors"
                >
                  Command Center
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