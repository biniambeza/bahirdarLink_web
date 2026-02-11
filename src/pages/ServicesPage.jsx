import { Shield, Flame, Ambulance, PhoneCall, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    title: "Police Emergency Response",
    description:
      "Rapid coordination with police units for crime prevention, incident reporting, and real-time response management.",
    icon: Shield,
    color: "from-blue-500 to-blue-700",
  },
  {
    title: "Fire & Rescue Services",
    description:
      "Immediate fire alerts, rescue coordination, disaster mitigation, and hazard response management.",
    icon: Flame,
    color: "from-red-500 to-red-700",
  },
  {
    title: "Medical Emergency Support",
    description:
      "Fast dispatch of ambulances and medical professionals to ensure life-saving response times.",
    icon: Ambulance,
    color: "from-green-500 to-green-700",
  },
  {
    title: "Unified Command Center",
    description:
      "A centralized digital command hub that connects all emergency services under one system.",
    icon: PhoneCall,
    color: "from-purple-500 to-purple-700",
  },
];

const ServicesPage = () => {
  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold text-blue-900 leading-tight">
            Emergency Services,
            <span className="text-blue-600"> Unified</span>
          </h1>
          <p className="mt-6 text-lg text-blue-700">
            BahirLink integrates police, fire, and medical services into a
            single intelligent coordination platform.
          </p>
        </div>
      </section>

      {/* SERVICES FEATURE SECTION */}
      <section className="max-w-7xl mx-auto px-6 space-y-24">
        {services.map((service, index) => {
          const Icon = service.icon;
          const reverse = index % 2 !== 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`flex flex-col lg:flex-row ${
                reverse ? "lg:flex-row-reverse" : "lg:flex-row"
              } items-center gap-12`}
            >
              {/* Icon Block */}
              <div className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-2xl`}
                >
                  <Icon className="h-14 w-14 text-white drop-shadow-lg" />
                </motion.div>
              </div>

              {/* Content Card */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/70 backdrop-blur-xl border border-blue-200 rounded-3xl p-8 shadow-xl w-full lg:max-w-xl transition-all"
              >
                <h3 className="text-3xl font-bold text-blue-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-blue-700 text-lg leading-relaxed mb-6">
                  {service.description}
                </p>
                <button className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900 transition">
                  Learn More <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            </motion.div>
          );
        })}
      </section>

      {/* CTA SECTION */}
      <section className="mt-28 bg-gradient-to-r from-blue-700 to-blue-900 py-24 px-6">
        <div className="max-w-5xl mx-auto text-center text-white">
          <h2 className="text-4xl font-extrabold mb-6">
            One Platform. One Command. Faster Response.
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Designed for emergency responders and command centers operating
            under critical time constraints.
          </p>

          <button className="bg-white text-blue-800 px-8 py-4 rounded-3xl font-bold shadow-2xl hover:bg-blue-100 transition transform hover:-translate-y-1 hover:scale-105">
            Access Command Center
          </button>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
