const CTASection = () => {
  return (
    <section className="relative py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white overflow-hidden">
      {/* Background shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-4xl mx-auto px-6 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold animate-fadeIn">
          Access the Emergency <br />
          Command Center
        </h2>

        <p className="text-blue-100 text-lg md:text-xl animate-fadeIn delay-200">
          Respond faster and coordinate effectively with your emergency response
          system.
        </p>

        <button className="mt-4 bg-white text-blue-700 px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 animate-bounceHover">
          Go to Login
        </button>
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

        @keyframes bounceHover {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-bounceHover:hover {
          animation: bounceHover 0.5s ease forwards;
        }
      `}</style>
    </section>
  );
};

export default CTASection;
