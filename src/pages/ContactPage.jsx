import { Phone, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const contactMethods = [
  {
    title: "Phone",
    description: "+251 912 345 678",
    icon: Phone,
    bgColor: "from-blue-500 to-blue-700",
  },
  {
    title: "Email",
    description: "support@bahirlink.com",
    icon: Mail,
    bgColor: "from-purple-500 to-purple-700",
  },
  {
    title: "Location",
    description: "Bahir Dar, Ethiopia",
    icon: MapPin,
    bgColor: "from-green-500 to-green-700",
  },
];

const ContactPage = () => {
  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-blue-100 min-h-screen pt-32 px-6">
      {/* HERO SECTION */}
      <section className="text-center mb-16">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold text-blue-900"
        >
          Get in <span className="text-blue-600">Touch</span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-4 text-blue-700 text-lg max-w-2xl mx-auto"
        >
          Have questions or need assistance? Reach out to us, and our team will
          respond promptly.
        </motion.p>
      </section>

      {/* CONTACT INFO CARDS */}
      <section className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-8 mb-20">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="flex flex-col items-center bg-white/60 backdrop-blur-xl border border-blue-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl"
            >
              <div
                className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${method.bgColor} flex items-center justify-center mb-4 shadow-lg`}
              >
                <Icon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                {method.title}
              </h3>
              <p className="text-blue-700 text-center">{method.description}</p>
            </motion.div>
          );
        })}
      </section>

      {/* CONTACT FORM */}
      <section className="max-w-3xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/70 backdrop-blur-xl border border-blue-200 rounded-3xl p-8 shadow-2xl"
        >
          <h2 className="text-3xl font-extrabold text-blue-900 mb-6 text-center">
            Send Us a Message
          </h2>
          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 border border-blue-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-3 border border-blue-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition"
            />
            <textarea
              placeholder="Your Message"
              rows="5"
              className="w-full px-4 py-3 border border-blue-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition resize-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              Send Message
            </motion.button>
          </form>
        </motion.div>
      </section>
    </div>
  );
};

export default ContactPage;
