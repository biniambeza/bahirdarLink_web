import React from "react";
import { PhoneCall, ArrowRight, ShieldCheck } from "lucide-react";

import accidentImg from "../../../assets/images/accident_response.jpg";
import crimeImg from "../../../assets/images/crime_response.jpg";
import fireImg from "../../../assets/images/fire.jpg";
import medicalImg from "../../../assets/images/medical.jpg";

const services = [
  {
    id: "accident",
    title: "Traffic Accident Rescue",
    desc: "Highway collision rescue, road clearance, and on-scene medical triage.",
    phone: "907",
    img: accidentImg,
    badge: "Traffic Unit",
  },
  {
    id: "crime",
    title: "Crime Prevention & Patrol",
    desc: "Rapid police response, neighborhood security patrol, and case investigation.",
    phone: "991",
    img: crimeImg,
    badge: "Police Department",
  },
  {
    id: "fire",
    title: "Fire & Urban Rescue",
    desc: "Emergency fire suppression, smoke control, and hazardous scene extraction.",
    phone: "939",
    img: fireImg,
    badge: "Fire Brigade",
  },
  {
    id: "medical",
    title: "Medical & Ambulance",
    desc: "24/7 paramedic support and direct transport to Felege Hiwot Hospital.",
    phone: "907",
    img: medicalImg,
    badge: "Paramedic Corps",
  },
];

const CapabilitiesSection = () => {
  return (
    <section id="services" className="relative w-full py-20 bg-white text-slate-900 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Simple Section Header */}
        <div className="max-w-xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            Public Safety Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-3">
            Immediate Response When You Need Help
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Directly dispatching specialized emergency teams across Bahir Dar.
          </p>
        </div>

        {/* 4 Clean Image Service Cards (Images Displayed Prominently) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-slate-50/70 border border-slate-200/80 overflow-hidden hover:shadow-lg transition-all flex flex-col group"
            >
              {/* Large, Unobstructed Image Display */}
              <div className="w-full aspect-[16/10] overflow-hidden bg-slate-200 relative">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-xs border border-white/60">
                  {item.badge}
                </span>
              </div>

              {/* Necessary Text Only */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                {/* Direct Dial Action */}
                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <a
                    href={`tel:${item.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-colors"
                  >
                    <PhoneCall size={12} />
                    <span>Dial {item.phone}</span>
                  </a>

                  <a
                    href="/login"
                    className="text-xs font-bold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Report Online</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CapabilitiesSection;