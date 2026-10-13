import React, { useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";
import { ArrowUp } from "lucide-react";
import HeroSection from "../../components/home/HeroSection";
import CapabilitiesSection from "../../components/home/CapabilitiesSection";
import StatsSection from "../../components/home/StatsSection";
import Footer from "../../components/home/Footer";

const HomePage = () => {
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <main className="relative bg-white min-h-screen text-slate-900 overflow-x-hidden">
      {/* Subtle Blue Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-blue-600 z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 text-xs font-bold"
      >
        Skip to main content
      </a>

      {/* Page Sections */}
      <div id="main-content">
        <HeroSection />
        <CapabilitiesSection />
        <StatsSection />
        <Footer />
      </div>

      {/* Back to top button */}
      <BackToTopButton />
    </main>
  );
};

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const shouldShow = window.scrollY > 400;
      setIsVisible((prev) => (prev !== shouldShow ? shouldShow : prev));
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-105"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
};

export default HomePage;