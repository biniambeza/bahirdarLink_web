import { useState } from "react";
import { 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaEnvelope, 
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaHeart 
} from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    setEmail("");
    alert("Thanks for subscribing!");
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Background pattern - using CSS gradient instead of SVG */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                B
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                BahirLink
              </span>
            </motion.div>
            
            <p className="text-gray-400 leading-relaxed">
              Centralized emergency response platform connecting agencies and 
              responders for faster, smarter, and coordinated action.
            </p>
            
            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="space-y-3">
              <label className="text-sm font-semibold text-gray-300">
                Subscribe to our newsletter
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
                  required
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold shadow-lg whitespace-nowrap"
                >
                  Subscribe
                </motion.button>
              </div>
            </form>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {["Home", "About", "Services", "Contact"].map((item, idx) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-colors group flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-blue-500 rounded-full group-hover:w-2 transition-all" />
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Contact Us
            </h3>
            <ul className="space-y-4">
              {[
                { icon: <FaEnvelope />, text: "support@bahirlink.com", delay: 0 },
                { icon: <FaPhoneAlt />, text: "+251 123 456 789", delay: 0.1 },
                { icon: <FaMapMarkerAlt />, text: "Addis Ababa, Ethiopia", delay: 0.2 }
              ].map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: item.delay }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <span className="text-blue-500 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  {item.text}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Connect With Us
            </h3>
            <div className="flex gap-4">
              {[
                { icon: <FaFacebookF />, color: "from-blue-600 to-blue-700", label: "Facebook" },
                { icon: <FaTwitter />, color: "from-sky-500 to-sky-600", label: "Twitter" },
                { icon: <FaLinkedinIn />, color: "from-blue-700 to-blue-800", label: "LinkedIn" }
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 bg-gradient-to-br ${social.color} rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-2xl transition-all relative group`}
                  aria-label={social.label}
                >
                  {social.icon}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {social.label}
                  </span>
                </motion.a>
              ))}
            </div>
            
            {/* Trust badges */}
            <div className="mt-8 p-4 bg-gray-800/30 rounded-xl border border-gray-800">
              <p className="text-sm text-gray-400 mb-2">Security & Compliance</p>
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-gray-800 rounded-lg text-xs text-gray-300">ISO 27001</span>
                <span className="px-3 py-1 bg-gray-800 rounded-lg text-xs text-gray-300">GDPR</span>
                <span className="px-3 py-1 bg-gray-800 rounded-lg text-xs text-gray-300">SOC 2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm flex items-center gap-2">
              © {new Date().getFullYear()} BahirLink. All rights reserved.
              <span className="flex items-center gap-1 text-gray-600">
                Made with <FaHeart className="text-red-500 text-xs" /> in Ethiopia
              </span>
            </p>
            
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;