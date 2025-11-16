import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";

const CourseOverview = ({ courseData, completedItems, courseId }) => {
  const navigate = useNavigate();

  const getProgress = (section) => {
    if (!section.items?.length) return 0;
    return (
      (section.items.filter((i) => completedItems.has(i.id)).length /
        section.items.length) *
      100
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {courseData.sections.map((section) => (
        <div
          key={section.id}
          className="bg-white rounded-lg border p-4 hover:shadow transition-shadow"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-gray-900 text-base">
                {section.title}
              </h3>
            </div>

            <button
              onClick={() =>
                navigate(`/student/learn/${courseId}/${section.id}`)
              }
              className="px-3 py-1.5 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 text-sm font-medium rounded-lg"
            >
              Bắt đầu
            </button>
          </div>
          <ProgressBar progress={getProgress(section)} height="h-1.5" />
        </div>
      ))}
    </div>
  );
};

export default CourseOverview;
