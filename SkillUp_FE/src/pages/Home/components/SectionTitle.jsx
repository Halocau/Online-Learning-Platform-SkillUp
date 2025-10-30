// src/components/home/SectionTitle.jsx
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function SectionTitle({ title, link }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      {link && (
        <Link
          to={link}
          className="flex items-center gap-1 text-[#FFD54F] hover:text-amber-600 font-medium transition-colors"
        >
          Xem tất cả <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}