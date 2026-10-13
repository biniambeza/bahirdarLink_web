import React from "react";
import { PhoneCall, ArrowRight, ShieldCheck } from "lucide-react";

const stats = [
  { value: "1,250+", label: "Incidents Resolved" },
  { value: "320+", label: "Active Responders" },
  { value: "40+", label: "Partner Stations" },
  { value: "99.9%", label: "System Availability" },
];

const StatsSection = () => {
  return (
    <section id="about" className="relative w-full py-20 bg-[#f8fafc] text-slate-900 border-t border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Simple Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            Citywide Safety
          </span>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">
            Ready 24/7 Across Bahir Dar
          </h2>
          <p className="text-sm text-slate-600">
            Dedicated emergency crews and law enforcement on standby to protect our community.
          </p>
        </div>

        {/* 4 Clean Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center"
            >
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-1">
                {s.value}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Simple Quick Action Banner */}
        <div className="p-8 rounded-3xl bg-blue-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-blue-600/15">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                Need Immediate Assistance?
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Reach our emergency dispatch team in seconds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:991"
              className="px-5 py-2.5 rounded-full bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <PhoneCall size={13} />
              <span>Emergency 991</span>
            </a>
            <a
              href="/login"
              className="px-5 py-2.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <span>File Report</span>
              <ArrowRight size={13} />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default StatsSection;