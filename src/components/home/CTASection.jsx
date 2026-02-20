import { motion } from "framer-motion";
import { FaArrowRight, FaShieldAlt, FaRocket } from "react-icons/fa";

const CTASection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        {/* Simple pattern overlay instead of SVG data URL */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px'
          }}
        />
      </div>
      
      {/* Animated circles */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          borderRadius: ["30%", "50%", "30%"]
        }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [90, 0, 90],
          borderRadius: ["50%", "30%", "50%"]
        }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Floating icons */}
          <div className="flex justify-center gap-4 mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center text-white text-2xl"
            >
              <FaShieldAlt />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
              className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center text-white text-2xl"
            >
              <FaRocket />
            </motion.div>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Ready to Transform
            <br />
            <span className="relative">
              Emergency Response?
              <motion.span
                animate={{ width: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -bottom-2 left-0 h-1 bg-white/50"
                style={{ width: "100%" }}
              />
            </span>
          </h2>

          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Join hundreds of agencies already using BahirLink to save lives 
            and protect communities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 bg-white rounded-full font-bold text-lg overflow-hidden shadow-2xl"
            >
              <span className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                Get Started Now
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Watch Demo
            </motion.button>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
            className="pt-12 flex flex-wrap justify-center gap-8 items-center"
          >
            <p className="text-white/60 text-sm">Trusted by leading agencies:</p>
            {[1,2,3,4].map((i) => (
              <div 
                key={i} 
                className="w-20 h-8 bg-white/20 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;