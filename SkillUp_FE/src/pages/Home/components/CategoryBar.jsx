import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoryBar({ categories }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  return (
    <section className="bg-[#fffffe] border-b border-[#272343]/15 shadow-sm relative z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 overflow-visible">
        <div className="flex justify-center gap-6 overflow-visible">
          {categories.map((cat) => (
            <div key={cat.id} className="relative">
              <Link
                to={`/courses/${cat.id}`}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="inline-block whitespace-nowrap px-4 py-2 text-sm font-medium tracking-tight text-[#2d334a] hover:text-[#272343] hover:bg-[#e3f6f5] rounded-full transition-all duration-200"
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
              className="absolute left-0 right-0 bg-[#e3f6f5]/60 border-t border-[#272343]/15 shadow-lg py-4 px-8 z-50"
            >
              <div className="max-w-7xl mx-auto flex justify-center items-center flex-wrap gap-x-6 gap-y-2">
                {categories
                  .find((c) => c.id === hoveredCategory)
                  ?.subCategories.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/courses/${hoveredCategory}?subcategory=${sub.id}`}
                      className="text-[#272343] text-sm font-medium tracking-tight hover:text-[#FFD54F] transition-colors whitespace-nowrap"
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