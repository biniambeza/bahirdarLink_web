import { Phone, Mail, MapPin, Send, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactMethods = [
    {
      title: "Phone Support",
      description: "+251 912 345 678",
      subtext: "Available 24/7",
      icon: Phone,
      color: "from-blue-500 to-blue-700",
      action: "tel:+251912345678"
    },
    {
      title: "Email Us",
      description: "support@bahirlink.com",
      subtext: "Response within 2 hours",
      icon: Mail,
      color: "from-purple-500 to-purple-700",
      action: "mailto:support@bahirlink.com"
    },
    {
      title: "Visit Us",
      description: "Bahir Dar, Ethiopia",
      subtext: "Head Office",
      icon: MapPin,
      color: "from-green-500 to-green-700",
      action: "#"
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-2 bg-blue-100 rounded-full text-blue-600 font-semibold text-sm mb-6"
          >
            📞 Get in Touch
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Contact Us
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions or need assistance? Our team is here to help you 24/7.
          </p>
        </motion.div>
      </section>

      {/* Contact Cards */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <motion.a
                href={method.action}
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative block"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${method.color} 
                  rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
                <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 
                  rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${method.color} 
                    flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{method.title}</h3>
                  <p className="text-gray-600 text-lg mb-1">{method.description}</p>
                  <p className="text-sm text-gray-500 mb-4">{method.subtext}</p>
                  <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                    <span>Contact now</span>
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Send us a Message</h2>
            <p className="text-gray-500 mb-8">We'll get back to you within 24 hours</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none 
                    focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none 
                    focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none 
                    focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                  py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl 
                  flex items-center justify-center gap-2 group"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Message Sent!
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Map/Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Office Hours */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="h-6 w-6 text-blue-600" />
                Office Hours
              </h3>
              <div className="space-y-3">
                {[
                  { day: "Monday - Friday", hours: "8:00 AM - 8:00 PM" },
                  { day: "Saturday", hours: "9:00 AM - 6:00 PM" },
                  { day: "Sunday", hours: "10:00 AM - 4:00 PM" },
                  { day: "Emergency", hours: "24/7 Support Available" },
                ].map((schedule, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">{schedule.day}</span>
                    <span className="font-semibold text-gray-800">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Location</h3>
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl 
                flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590004951818-2c6c95b3f2e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] 
                  bg-cover bg-center group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent" />
                <div className="relative text-white text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-2 animate-bounce" />
                  <p className="font-semibold">Bahir Dar, Ethiopia</p>
                  <p className="text-sm opacity-90">Main Office</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;