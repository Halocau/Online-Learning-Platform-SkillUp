// src/components/ui/separator.jsx
import { cn } from "@/lib/utils";

export function Separator({ orientation = "horizontal", className = "" }) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={cn(
        "bg-gray-200",
        isHorizontal ? "h-px w-full my-2" : "w-px h-full mx-2",
        className
      )}
    />
  );
}

export default Separator;
