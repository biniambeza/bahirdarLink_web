import { Users, Globe, Activity, Info } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Our Mission",
    description:
      "To connect emergency services and public safety agencies through a unified digital platform, reducing response time and saving lives.",
    icon: Activity,
    color: "from-blue-500 to-blue-700",
  },
  {
    title: "Global Vision",
    description:
      "We aim to implement scalable emergency response solutions across cities, regions, and nations using cutting-edge technology.",
    icon: Globe,
    color: "from-purple-500 to-purple-700",
  },
  {
    title: "Community Focus",
    description:
      "We prioritize community awareness and engagement, ensuring every citizen can access help when it matters most.",
    icon: Users,
    color: "from-green-500 to-green-700",
  },
  {
    title: "Trusted & Transparent",
    description:
      "BahirLink operates with complete transparency, providing accurate reporting and reliable coordination across services.",
    icon: Info,
    color: "from-red-500 to-red-700",
  },
];

const AboutPage = () => {
  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold text-blue-900 leading-tight">
            About <span className="text-blue-600">BahirLink</span>
          </h1>
          <p className="mt-6 text-lg text-blue-700">
            BahirLink is a unified emergency response platform designed to
            connect police, fire, and medical services with the community for
            faster, smarter, and safer coordination.
          </p>
        </div>
      </section>

      {/* FEATURES / INFO SECTIONS */}
      <section className="max-w-7xl mx-auto px-6 space-y-24">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const reverse = index % 2 !== 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`flex flex-col ${
                reverse ? "lg:flex-row-reverse" : "lg:flex-row"
              } items-center gap-12`}
            >
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-2xl`}
              >
                <Icon className="h-14 w-14 text-white drop-shadow-lg" />
              </motion.div>

              {/* Content */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/70 backdrop-blur-xl border border-blue-200 rounded-3xl p-8 shadow-xl w-full lg:max-w-xl transition-all"
              >
                <h3 className="text-3xl font-bold text-blue-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-blue-700 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </section>

      {/* CTA SECTION */}
      <section className="mt-28 bg-gradient-to-r from-blue-700 to-blue-900 py-24 px-6">
        <div className="max-w-5xl mx-auto text-center text-white">
          <h2 className="text-4xl font-extrabold mb-6">
            Join us in transforming emergency response
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            BahirLink empowers responders, agencies, and communities with a
            unified platform to save lives faster and more efficiently.
          </p>

          <button className="bg-white text-blue-800 px-8 py-4 rounded-3xl font-bold shadow-2xl hover:bg-blue-100 transition transform hover:-translate-y-1 hover:scale-105">
            Access Command Center
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
