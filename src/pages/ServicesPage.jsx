import { Shield, Flame, Ambulance, PhoneCall, ArrowRight, Clock, CheckCircle, Users } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const ServicesPage = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const services = [
    {
      title: "Police Emergency Response",
      description:
        "Rapid coordination with police units for crime prevention, incident reporting, and real-time response management with GPS tracking.",
      icon: Shield,
      color: "from-blue-500 to-blue-700",
      features: ["Real-time tracking", "Automated dispatch", "Evidence management"],
      responseTime: "< 3 min",
    },
    {
      title: "Fire & Rescue Services",
      description:
        "Immediate fire alerts, rescue coordination, disaster mitigation, and hazard response management with thermal imaging.",
      icon: Flame,
      color: "from-red-500 to-red-700",
      features: ["Thermal mapping", "Resource allocation", "Evacuation routing"],
      responseTime: "< 5 min",
    },
    {
      title: "Medical Emergency Support",
      description:
        "Fast dispatch of ambulances and medical professionals to ensure life-saving response times with patient monitoring.",
      icon: Ambulance,
      color: "from-green-500 to-green-700",
      features: ["Live vitals", "Hospital coordination", "Priority routing"],
      responseTime: "< 4 min",
    },
    {
      title: "Unified Command Center",
      description:
        "A centralized digital command hub that connects all emergency services under one system with AI-powered analytics.",
      icon: PhoneCall,
      color: "from-purple-500 to-purple-700",
      features: ["AI analytics", "Resource optimization", "Cross-agency coordination"],
      responseTime: "24/7",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Hero Section with Parallax */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ scale }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 mix-blend-multiply" />
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1582139329536-e7284fece509?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
            }}
          />
        </motion.div>

        <div className="relative z-10 text-center text-white px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              Emergency Services,
              <br />
              <span className="text-blue-200">Unified</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100">
              BahirLink integrates police, fire, and medical services into a
              single intelligent coordination platform.
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Our Services
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive emergency response solutions for every situation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${service.color} 
                    rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
                  
                  <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 
                    rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} 
                        flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <span className={`px-3 py-1 bg-gradient-to-r ${service.color} 
                        text-white text-sm rounded-full font-semibold`}>
                        {service.responseTime}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-6">{service.description}</p>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className={`h-4 w-4 text-${service.color.split('-')[1]}-500`} />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Learn More */}
                    <button className="inline-flex items-center gap-2 text-blue-600 font-semibold 
                      group-hover:gap-4 transition-all">
                      Learn more about this service
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    {/* Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Response</div>
                        <div className="font-bold text-gray-800">{service.responseTime}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Available</div>
                        <div className="font-bold text-gray-800">24/7</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Teams</div>
                        <div className="font-bold text-gray-800">50+</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: "Active Responders", value: "500+", icon: <Users /> },
              { label: "Daily Incidents", value: "100+", icon: <PhoneCall /> },
              { label: "Cities Covered", value: "50+", icon: <Shield /> },
              { label: "Lives Saved", value: "1000+", icon: <Ambulance /> },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-blue-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900" />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ repeat: Infinity, duration: 20 }}
            className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            One Platform. One Command.
            <br />
            <span className="text-blue-300">Faster Response.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80 mb-10"
          >
            Designed for emergency responders and command centers operating
            under critical time constraints.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-4 bg-white rounded-full font-bold text-lg overflow-hidden shadow-2xl"
          >
            <span className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Access Command Center
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;