import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "/assets/images/logo.webp";
import { motion } from "framer-motion";

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
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-lg bg-white/30 border-b border-blue-300 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={Logo} alt="BahirLink Logo" className="h-10 w-10" />
          <span className="text-blue-900 text-2xl font-bold tracking-wide">
            BahirLink
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 font-semibold">
          {navLinks.map((item) => (
            <motion.button
              key={item.name}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.1 }}
              className="relative text-blue-900 hover:text-blue-500 transition-all
                after:content-[''] after:absolute after:-bottom-1 after:left-0
                after:w-0 after:h-[2px] after:bg-blue-500 hover:after:w-full after:transition-all"
            >
              {item.name}
            </motion.button>
          ))}

          {/* Login */}
          <motion.button
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.05 }}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full text-white shadow-lg transition-all"
          >
            Login
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-blue-900 text-2xl focus:outline-none"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 120 }}
        className="md:hidden fixed top-16 left-0 w-full bg-white/95 backdrop-blur-lg shadow-2xl"
      >
        <div className="flex flex-col px-6 py-6 gap-4 font-semibold text-blue-900">
          {navLinks.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
              className="text-left hover:text-blue-500 transition-all"
            >
              {item.name}
            </button>
          ))}

          <button
            onClick={() => {
              navigate("/login");
              setIsOpen(false);
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full text-white shadow-lg transition transform hover:scale-105"
          >
            Access Command Center
          </button>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
