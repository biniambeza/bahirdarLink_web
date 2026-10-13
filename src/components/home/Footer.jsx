import React from "react";
import { PhoneCall, MapPin, Mail, ShieldAlert } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="relative w-full bg-white border-t border-slate-200/80 text-slate-700 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-100">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center p-1.5 text-white">
                <img
                  src="/logo.webp"
                  alt="BahirLink"
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Bahir<span className="text-blue-600">Link</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mb-4">
              Unified emergency and public safety platform connecting citizens directly with police, fire rescue, and paramedics in Bahir Dar.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin size={14} className="text-blue-600 shrink-0" />
              <span>Bahir Dar, Amhara Region, Ethiopia</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/" className="hover:text-blue-600 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-blue-600 transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-blue-600 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-blue-600 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency Hotlines (High Utility) */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Emergency Hotlines
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="tel:991"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 transition-colors block"
              >
                <div className="text-[11px] text-slate-500 font-medium">Police</div>
                <div className="text-sm font-bold text-slate-900">Dial 991</div>
              </a>
              <a
                href="tel:907"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 transition-colors block"
              >
                <div className="text-[11px] text-slate-500 font-medium">Accident / Medic</div>
                <div className="text-sm font-bold text-slate-900">Dial 907</div>
              </a>
              <a
                href="tel:939"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 transition-colors block"
              >
                <div className="text-[11px] text-slate-500 font-medium">Fire Rescue</div>
                <div className="text-sm font-bold text-slate-900">Dial 939</div>
              </a>
              <a
                href="tel:911"
                className="p-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200/80 transition-colors block"
              >
                <div className="text-[11px] text-red-600 font-medium">Central SOS</div>
                <div className="text-sm font-bold text-red-700">Dial 911</div>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>© {new Date().getFullYear()} BahirLink. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="/login" className="hover:text-blue-600 transition-colors">
              Responder Portal
            </a>
            <a href="/contact" className="hover:text-blue-600 transition-colors">
              Help Center
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;