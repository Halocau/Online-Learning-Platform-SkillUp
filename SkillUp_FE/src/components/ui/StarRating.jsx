// src/components/ui/StarRating.jsx
import { Star } from "lucide-react";

export default function renderStars({ rating, size = "w-4 h-4" }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-400"
          }`}
        />
      ))}
    </>
  );
}