import { FaMapMarkedAlt, FaUsers, FaBell, FaShieldAlt, FaAmbulance, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";

const capabilities = [
  {
    icon: <FaBell />,
    title: "Incident Monitoring",
    description: "View and track incidents reported from mobile applications in real time with AI-powered analytics.",
    color: "from-blue-500 to-cyan-500",
    stats: "Real-time tracking"
  },
  {
    icon: <FaUsers />,
    title: "Agency Coordination",
    description: "Assign incidents to police, fire, medical, and public service units with smart routing.",
    color: "from-purple-500 to-pink-500",
    stats: "Multi-agency"
  },
  {
    icon: <FaMapMarkedAlt />,
    title: "Live Map View",
    description: "Visualize incidents geographically for faster and smarter response decisions with heat maps.",
    color: "from-green-500 to-emerald-500",
    stats: "3D visualization"
  },
  {
    icon: <FaShieldAlt />,
    title: "Resource Management",
    description: "Track and deploy resources efficiently with real-time availability updates.",
    color: "from-orange-500 to-red-500",
    stats: "Resource tracking"
  },
  {
    icon: <FaAmbulance />,
    title: "Emergency Dispatch",
    description: "Automated dispatch system with priority-based routing and ETA calculations.",
    color: "from-indigo-500 to-blue-500",
    stats: "Smart dispatch"
  },
  {
    icon: <FaChartLine />,
    title: "Analytics Dashboard",
    description: "Comprehensive analytics and reporting for performance optimization.",
    color: "from-yellow-500 to-orange-500",
    stats: "Real-time insights"
  }
];

const CapabilitiesSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-100 rounded-full text-blue-600 font-semibold text-sm mb-4">
            Platform Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Powerful Capabilities
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to manage emergencies effectively in one unified platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((cap, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cap.color} opacity-10 rounded-full -mr-16 -mt-16`} />
                
                <div className={`w-16 h-16 bg-gradient-to-br ${cap.color} rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {cap.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {cap.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {cap.description}
                </p>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-blue-50 rounded-full text-blue-600 font-medium">
                    {cap.stats}
                  </span>
                </div>
                
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;