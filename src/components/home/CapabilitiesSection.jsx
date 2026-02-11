import { FaMapMarkedAlt, FaUsers, FaBell } from "react-icons/fa";

const CapabilitiesSection = () => {
  return (
    <section className="py-20 bg-blue-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-blue-900 mb-16">
          Platform Capabilities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Incident Monitoring */}
          <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <FaBell className="text-blue-500 text-4xl" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-blue-900 mb-2 text-center">
              Incident Monitoring
            </h3>
            <p className="text-blue-700 text-center">
              View and track incidents reported from mobile applications in real
              time.
            </p>
          </div>

          {/* Agency Coordination */}
          <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <FaUsers className="text-blue-500 text-4xl" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-blue-900 mb-2 text-center">
              Agency Coordination
            </h3>
            <p className="text-blue-700 text-center">
              Assign incidents to police, fire, medical, and public service
              units efficiently.
            </p>
          </div>

          {/* Live Map View */}
          <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <FaMapMarkedAlt className="text-blue-500 text-4xl" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-blue-900 mb-2 text-center">
              Live Map View
            </h3>
            <p className="text-blue-700 text-center">
              Visualize incidents geographically for faster and smarter response
              decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
