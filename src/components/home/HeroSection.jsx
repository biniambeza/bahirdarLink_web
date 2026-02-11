import Navbar from "./Navbar";
import { useEffect } from "react";

const HeroSection = () => {
  // Load Google Fonts dynamically
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <section className="relative w-full h-screen flex overflow-hidden font-poppins bg-blue-50">
      {/* Navbar */}
      <Navbar />

      {/* Left Half: Text */}
      <div className="relative flex-1 flex flex-col justify-center px-8 md:px-16 h-full">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-snug mb-4 text-blue-700 animate-fadeIn">
          We’re Here to <br />
          Save Lives and <br />
          Protect Communities
        </h1>

        <p className="text-blue-500 text-base md:text-lg mb-6 max-w-md animate-fadeIn delay-200">
          Centralized emergency response system for responders and government
          agencies to act faster, smarter, and together.
        </p>

        <div className="flex flex-wrap gap-4 animate-fadeIn delay-400">
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold text-base text-white transition-all duration-300">
            Access Command Center
          </button>
          <button className="border border-blue-600 px-6 py-3 rounded-full font-semibold text-base hover:bg-blue-600 hover:text-white transition-all duration-300">
            Learn More
          </button>
        </div>
      </div>

      {/* Right Half: Hero Image with diagonal */}
      <div className="relative flex-1 h-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/assets/images/hero-firefighters.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            clipPath: "polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)", // diagonal
          }}
        ></div>
      </div>

      {/* Tailwind keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease forwards;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
