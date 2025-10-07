import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Jane Doe",
    text: "SkillUp helped me switch careers into tech. The content and mentors are amazing!",
  },
  {
    name: "Mark Smith",
    text: "Courses are practical and easy to follow. I landed my first dev job thanks to SkillUp!",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">
          What Our Learners Say
        </h2>
        <div className="grid md:grid-cols-2 gap-8 px-6">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              className="p-8 bg-white shadow-lg rounded-2xl"
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 40 }}
              transition={{ delay: i * 0.3 }}
            >
              <p className="text-gray-700 italic mb-4">“{item.text}”</p>
              <h4 className="font-semibold text-indigo-600">{item.name}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
    