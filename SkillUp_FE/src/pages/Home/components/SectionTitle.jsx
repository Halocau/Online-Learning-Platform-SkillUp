// src/components/home/SectionTitle.jsx
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function SectionTitle({ title, link }) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#272343] sm:text-3xl">
          {title}
        </h2>
      </div>
      {link && (
        <Link
          to={link}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#272343]/15 bg-[#fffffe] px-4 py-1.5 text-xs font-medium tracking-tight text-[#272343] hover:bg-[#e3f6f5] transition-colors"
        >
          Xem tất cả
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}