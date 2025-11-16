import { Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const ProgressBar = ({ progress }) => {
  const roundedProgress = Math.round(progress);
  const isComplete = roundedProgress === 100;

  return (
    <div className="flex items-center gap-4">
      {/* Progress Circle */}
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke={isComplete ? "#22c55e" : "#FFD54F"}
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isComplete ? (
            <Trophy className="w-6 h-6 text-green-500" />
          ) : (
            <span className="text-sm font-bold text-gray-700">
              {roundedProgress}%
            </span>
          )}
        </div>
      </div>

      {/* Progress Info */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-700">
          {isComplete ? "Đã hoàn thành khóa học!" : "Tiến độ của bạn"}
        </span>
        <div className="flex items-center gap-2 mt-1">
          {isComplete ? (
            <span className="text-xs text-green-600 font-medium">
              Chức mừng bạn đã hoàn thành!
            </span>
          ) : (
            <>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    isComplete
                      ? "bg-gradient-to-r from-green-400 to-green-600"
                      : "bg-gradient-to-r from-[#FFD54F] to-[#FFC107]"
                  )}
                  style={{ width: `${roundedProgress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                Còn {100 - roundedProgress}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
