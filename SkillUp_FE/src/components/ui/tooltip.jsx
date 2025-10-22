// src/components/ui/tooltip.jsx
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export function Tooltip({ children, text, position = "top", delay = 300 }) {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const show = () => {
    const id = setTimeout(() => setVisible(true), delay);
    setTimeoutId(id);
  };

  const hide = () => {
    clearTimeout(timeoutId);
    setVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex items-center"
      >
        {children}
      </div>

      {visible && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs rounded-md bg-gray-800 text-white whitespace-nowrap shadow-lg",
            "transition-opacity duration-200",
            positionClasses[position]
          )}
        >
          {text}
          <span
            className={cn(
              "absolute border-4 border-transparent",
              position === "top" &&
                "border-t-gray-800 bottom-[-8px] left-1/2 -translate-x-1/2",
              position === "bottom" &&
                "border-b-gray-800 top-[-8px] left-1/2 -translate-x-1/2",
              position === "left" &&
                "border-l-gray-800 right-[-8px] top-1/2 -translate-y-1/2",
              position === "right" &&
                "border-r-gray-800 left-[-8px] top-1/2 -translate-y-1/2"
            )}
          ></span>
        </div>
      )}
    </div>
  );
}

export default Tooltip;
