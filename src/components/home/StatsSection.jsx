import { useEffect, useState } from "react";
import { FaFire, FaUsers, FaBuilding, FaClock } from "react-icons/fa";

const StatsSection = () => {
  const statsData = [
    { label: "Incidents Managed", value: 1200, icon: <FaFire /> },
    { label: "Responders", value: 300, icon: <FaUsers /> },
    { label: "Agencies", value: 40, icon: <FaBuilding /> },
    {
      label: "System Availability",
      value: 24,
      suffix: "/7",
      icon: <FaClock />,
    },
  ];

  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const intervals = statsData.map((stat, idx) => {
      const increment = Math.ceil(stat.value / 100);
      return setInterval(() => {
        setCounts((prev) => {
          const newCounts = [...prev];
          if (newCounts[idx] < stat.value) {
            newCounts[idx] += increment;
            if (newCounts[idx] > stat.value) newCounts[idx] = stat.value;
          }
          return newCounts;
        });
      }, 20);
    });

    return () => intervals.forEach((i) => clearInterval(i));
  }, []);

  return (
    <section className="py-20 bg-blue-50 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-6 space-y-8 md:space-y-0 md:flex md:justify-between">
        {statsData.map((stat, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-2xl shadow-md animate-pulse">
              {stat.icon}
            </div>
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-blue-800">
                {counts[idx]}
                {stat.suffix ? stat.suffix : "+"}
              </h2>
              <p className="text-blue-700 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tailwind keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
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

export default StatsSection;
