import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-4 sm:px-6 pt-4 transition-all duration-300">
        <div
          className={`max-w-5xl mx-auto rounded-full px-5 py-2.5 flex items-center justify-between transition-all duration-300 ${
            scrolled
              ? "bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md shadow-slate-900/5"
              : "bg-white/80 backdrop-blur-md border border-white/80 shadow-xs"
          }`}
        >
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center p-1.5 shadow-xs text-white">
              <img
                src="/logo.webp"
                alt="BahirLink"
                className="w-full h-full object-contain brightness-0 invert"
              />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              Bahir<span className="text-blue-600">Link</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Simple CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition-all shadow-xs"
            >
              Sign In
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 left-4 right-4 bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 z-50 md:hidden flex flex-col gap-3"
            >
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className={`text-left py-2.5 px-4 rounded-xl text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
              <div className="pt-2 border-t border-slate-100 mt-1">
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                  className="w-full py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs"
                >
                  Sign In
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