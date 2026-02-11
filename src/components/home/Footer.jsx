import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-r from-blue-800 to-blue-900 text-white overflow-hidden pt-20">
      {/* Diagonal top separation */}
      <div className="absolute top-0 left-0 w-full h-32 bg-blue-800 skew-y-[-6deg] origin-top-left"></div>

      {/* Background shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Logo & Description */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">BahirLink</h1>
          <p className="text-blue-200 text-sm">
            Centralized emergency response platform for agencies and responders.
            Act faster, smarter, and together.
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-blue-800/50 p-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-300 transition">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-300 transition">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-300 transition">
                Services
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-300 transition">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="bg-blue-800/50 p-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all">
          <h3 className="text-lg font-semibold mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2 hover:text-blue-300 transition">
              <FaEnvelope /> support@bahirlink.com
            </li>
            <li className="flex items-center gap-2 hover:text-blue-300 transition">
              <FaPhoneAlt /> +251 123 456 789
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div className="bg-blue-800/50 p-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all">
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex gap-4">
            <a
              href="#"
              className="bg-blue-700 p-3 rounded-full hover:bg-blue-600 transition shadow-md"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className="bg-blue-700 p-3 rounded-full hover:bg-blue-600 transition shadow-md"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className="bg-blue-700 p-3 rounded-full hover:bg-blue-600 transition shadow-md"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-12 border-t border-blue-700 py-6 text-center text-blue-200 text-sm">
        &copy; {new Date().getFullYear()} BahirLink. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
