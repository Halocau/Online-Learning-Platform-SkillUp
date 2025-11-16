import { useNavigate } from "react-router-dom";
import { PlayCircle, FileText, HelpCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ProgressBar from "./ProgressBar";

const CourseSidebar = ({
  courseData,
  currentItem,
  currentSection,
  completedItems,
  onItemSelect,
  isOverview,
  courseId,
}) => {
  const navigate = useNavigate();

  const getItemIcon = (item) => {
    if (item.kind === "Lesson") {
      return item.lessonType === "Video" ? (
        <PlayCircle className="w-4 h-4" />
      ) : (
        <FileText className="w-4 h-4" />
      );
    }
    return <HelpCircle className="w-4 h-4" />;
  };

  const calculateSectionProgress = (section) => {
    if (!section.items?.length) return 0;
    const done = section.items.filter((i) => completedItems.has(i.id)).length;
    return (done / section.items.length) * 100;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b bg-gradient-to-r from-[#FFD54F] to-[#FFC107]">
        <h2 className="font-bold text-center text-gray-900 text-lg ">Nội dung</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {isOverview ? (
          courseData.sections?.map((section) => (
            <button
              key={section.id}
              onClick={() =>
                navigate(`/student/learn/${courseId}/${section.id}`)
              }
              className="w-full text-left"
            >
              <div className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium text-gray-800 text-sm">
                    {section.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {section.items?.length} mục
                  </span>
                </div>
                <ProgressBar
                  progress={calculateSectionProgress(section)}
                  height="h-1.5"
                />
              </div>
            </button>
          ))
        ) : (
          <>
            <h3 className="font-bold text-gray-900 text-base mb-2">
              {currentSection?.title}
            </h3>
            <div className="space-y-0.5">
              {currentSection?.items?.map((item) => {
                const isActive = currentItem?.id === item.id;
                const isDone = completedItems.has(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => onItemSelect(item, currentSection)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors",
                      isActive
                        ? "bg-[#FFF9E6] text-[#F57C00]"
                        : "hover:bg-gray-50"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <div
                        className={cn(
                          "w-4 h-4",
                          isActive ? "text-[#FFD54F]" : "text-gray-400"
                        )}
                      >
                        {getItemIcon(item)}
                      </div>
                    )}
                    <span
                      className={cn(
                        "truncate",
                        isActive ? "font-medium" : "text-gray-700"
                      )}
                    >
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="p-3 border-t bg-gray-50 text-xs">
        <div className="flex items-center gap-2">
          <img
            src={courseData.lecturer?.avartar || "/default-avatar.png"}
            alt=""
            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#FFD54F]"
          />
          <div>
            <p className="font-medium text-gray-900 truncate">
              {courseData.lecturer?.fullName}
            </p>
            <p className="text-gray-500 truncate">
              {courseData.lecturer?.profession || "Giảng viên"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSidebar;
