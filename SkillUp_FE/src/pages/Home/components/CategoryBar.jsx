import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoryBar({ categories }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  return (
    <section className="bg-white border-b border-gray-200 shadow-sm relative z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 overflow-visible">
        <div className="flex justify-center gap-6 overflow-visible">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <Link
                to={`/category/${cat.id}`}
                className="whitespace-nowrap px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-[#FFD54F] hover:bg-[#FFF3C4] rounded-full transition-all duration-200"
              >
                {cat.name}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {hoveredCategory &&
          categories.find((c) => c.id === hoveredCategory)?.subCategories
            ?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => setHoveredCategory(hoveredCategory)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="absolute left-0 right-0 bg-[#FFF8E1] border-t border-gray-200 shadow-lg py-3 px-8 z-50"
            >
              <div className="max-w-7xl mx-auto flex justify-center items-center flex-wrap gap-x-6 gap-y-2">
                {categories
                  .find((c) => c.id === hoveredCategory)
                  ?.subCategories.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/category/${hoveredCategory}/sub/${sub.id}`}
                      className="text-gray-800 text-sm font-medium hover:text-[#FFD54F] transition-colors whitespace-nowrap"
                    >
                      {sub.name}
                    </Link>
                  ))}
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </section>
  );
}
