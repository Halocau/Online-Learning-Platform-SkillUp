import { motion } from "framer-motion";

const features = [
  {
    title: "Expert Instructors",
    desc: "Learn from professionals with real-world experience.",
  },
  {
    title: "Flexible Learning",
    desc: "Study anytime, anywhere with lifetime course access.",
  },
  {
    title: "Recognized Certificates",
    desc: "Boost your career with verified SkillUp certifications.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
      {features.map((item, i) => (
        <motion.div
          key={i}
          className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition"
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ delay: i * 0.2, duration: 0.6 }}
        >
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            {item.title}
          </h3>
          <p className="text-gray-600">{item.desc}</p>
        </motion.div>
      ))}
    </section>
  );
}
