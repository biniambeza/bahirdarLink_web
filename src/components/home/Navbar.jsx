import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaChevronRight } from "react-icons/fa";

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 ${
          scrolled
            ? "bg-white/80 backdrop-blur-2xl py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-blue-50"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* Logo Branding */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
              <img 
                src="/logo.webp" 
                alt="BahirLink Logo" 
                className={`w-full h-full object-contain transition-all duration-500 ${
                  scrolled ? "drop-shadow-md" : "brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                }`}
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`text-xl md:text-2xl font-black tracking-tighter transition-colors duration-500 ${
                scrolled ? "text-slate-900" : "text-white"
              }`}>
                BAHIR<span className={scrolled ? "text-blue-600" : "text-blue-400"}>LINK</span>
              </span>
              <span className={`text-[8px] uppercase tracking-[0.3em] font-bold ${
                scrolled ? "text-slate-400" : "text-blue-200/60"
              }`}>
                Secure Portal
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <ul className={`flex items-center gap-2 px-2 py-1.5 rounded-2xl border transition-all duration-500 ${
              scrolled 
                ? "bg-slate-100/50 border-slate-200/50" 
                : "bg-white/10 border-white/20 backdrop-blur-md"
            }`}>
              {navLinks.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all rounded-xl relative group ${
                      scrolled 
                        ? "text-slate-600 hover:text-blue-600 hover:bg-white" 
                        : "text-slate-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <motion.button
              whileHover={{ y: -2, shadow: "0 20px 25px -5px rgb(37 99 235 / 0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className={`px-7 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                scrolled 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-slate-900" 
                  : "bg-white text-slate-900 hover:bg-blue-50 shadow-xl shadow-black/10"
              }`}
            >
              Command Center
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-3 rounded-2xl transition-all ${
              scrolled 
                ? "text-slate-900 bg-slate-100" 
                : "text-white bg-white/10 backdrop-blur-md border border-white/20"
            }`}
          >
            {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[105] md:hidden"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-[300px] bg-white z-[110] shadow-2xl flex flex-col p-8 md:hidden"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-2">
                  <img src="/logo.webp" alt="Logo" className="w-8 h-8 object-contain" />
                  <span className="text-xl font-black text-slate-900 tracking-tighter">
                    BAHIR<span className="text-blue-600">LINK</span>
                  </span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400">
                  <FaTimes size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-4">
                {navLinks.map((item, idx) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => { navigate(item.path); setIsOpen(false); }}
                    className="text-left py-4 px-6 rounded-2xl bg-slate-50 text-sm font-black text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-between group"
                  >
                    {item.name}
                    <FaChevronRight size={10} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </motion.button>
                ))}
              </nav>

              <div className="mt-auto">
                <button
                  onClick={() => { navigate("/login"); setIsOpen(false); }}
                  className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                >
                  Access Center
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