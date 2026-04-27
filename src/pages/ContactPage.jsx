import React, { useState } from "react";
import { 
  Phone, Mail, MapPin, CheckCircle, ArrowRight, 
  Twitter, Linkedin, Github, Instagram 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const contactMethods = [
  {
    title: "Support Line",
    info: "+251 912 345 678",
    sub: "Direct response // 24/7",
    icon: Phone,
  },
  {
    title: "Email Dispatch",
    info: "support@bahirlink.com",
    sub: "Verified within 2 hours",
    icon: Mail,
  },
  {
    title: "Global HQ",
    info: "Bahir Dar, Ethiopia",
    sub: "Central operations",
    icon: MapPin,
  },
];

const socialLinks = [
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "GitHub", icon: Github, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
];

const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  return (
    <div className="relative w-full lg:h-screen min-h-screen bg-white text-slate-900 overflow-hidden flex flex-col selection:bg-blue-100">
      
      {/* SHARED BACKGROUND DECOR */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-blue-50 blur-[100px] rounded-full opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-[1200px] mx-auto px-8 pt-32 pb-12 w-full">
        
        {/* HEADER SECTION */}
        <header className="mb-10 lg:mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="w-8 h-[1px] bg-blue-600"></span>
            <span className="text-blue-600 font-medium uppercase text-[10px] tracking-[0.3em]">
              Contact Gateway
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-4xl text-slate-900 tracking-tight leading-tight font-normal"
          >
            Get in touch with our team <br />
            <span className="text-slate-400 italic">for critical support and inquiries.</span>
          </motion.h1>
        </header>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch flex-grow">
          
          {/* LEFT COLUMN: CONTACT & SOCIALS */}
          <div className="lg:col-span-5 flex flex-col justify-between py-2">
            <div className="space-y-8 lg:space-y-12">
              {contactMethods.map((method, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all duration-300">
                    <method.icon size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">
                      {method.title}
                    </h3>
                    <p className="text-lg font-normal text-slate-900 tracking-tight leading-none mb-1">{method.info}</p>
                    <p className="text-[11px] text-slate-400 font-light">{method.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* SOCIAL MEDIA SECTION */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 pt-8 border-t border-slate-100"
            >
              <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em] mb-5">Connect With Us</h3>
              <div className="flex gap-3">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/50 transition-all duration-300"
                  >
                    <social.icon size={18} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-8 lg:p-10 transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 flex flex-col justify-center"
          >
            <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400 font-medium ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600/50 transition-colors"
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400 font-medium ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600/50 transition-colors"
                    placeholder="name@domain.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-medium ml-1">Message</label>
                <textarea 
                  rows="4" 
                  required 
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600/50 transition-colors resize-none"
                  placeholder="How can we assist you?"
                />
              </div>

              {/* ATTRACTIVE BLUE BUTTON */}
              <button 
                type="submit"
                className="w-full lg:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[11px] font-medium uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 group shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle size={14} strokeWidth={2.5} />
                      <span>Dispatched Successfully</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="default"
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3"
                    >
                      <span>Send Message</span>
                      <ArrowRight 
                        size={14} 
                        className="group-hover:translate-x-1.5 transition-transform duration-300" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </form>
          </motion.div>
        </div>

        {/* SHARED FOOTER */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 lg:mt-12 pt-8 flex justify-between items-center border-t border-slate-100 text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]"
        >
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            <span>BahirLink Platforms // 2026</span>
          </div>
          <span className="hidden sm:block opacity-50 uppercase tracking-[0.3em]">Communication Protocol v1.2</span>
        </motion.div>

      </div>
    </div>
  );
};

export default ContactPage;