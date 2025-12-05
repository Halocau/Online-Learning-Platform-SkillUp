// src/components/course-detail/MoreCoursesByLecturerSection.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lecturerAPI } from "@/api/lecturerAPI";
import { Spin } from "antd";
import { BookOpen } from "lucide-react";
import CourseCard from "@/pages/Home/components/CourseCard";

export default function MoreCoursesByLecturerSection({
  lecturer,
  currentCourseId,
}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLecturerCourses = async () => {
      if (!lecturer?.accountId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await lecturerAPI.getLecturerPublicProfile(
          lecturer.accountId
        );

        if (response.data?.code === 200 && response.data?.data) {
          const lecturerData = response.data.data[0];

          let lecturerCourses = [];

          if (lecturerData?.courses && Array.isArray(lecturerData.courses)) {
            lecturerCourses = lecturerData.courses;
          } else if (
            lecturerData?.Courses &&
            Array.isArray(lecturerData.Courses)
          ) {
            lecturerCourses = lecturerData.Courses;
          } else if (
            response.data.data.courses &&
            Array.isArray(response.data.data.courses)
          ) {
            lecturerCourses = response.data.data.courses;
          }

          const filteredCourses = lecturerCourses.filter((course) => {
            const isNotCurrent = course.id !== currentCourseId;
            const isActive = course.isActive !== false;

            return isNotCurrent && isActive;
          });

          setCourses(filteredCourses);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error("Error fetching lecturer courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLecturerCourses();
  }, [lecturer?.accountId, currentCourseId]);

  if (!lecturer) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#272343]">
          Những khóa học khác bởi {" "}
          <Link
            to={`/lecturer-info/${lecturer.accountId}`}
            className="text-[#FFD54F] hover:text-[#FFC107] transition-colors"
          >
            {lecturer.fullName}
          </Link>
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Spin size="large" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 3).map((course) => (
            <CourseCard
              key={course.id}
              course={{
                ...course,
                lecturerName: lecturer.fullName,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-600">
            This instructor doesn't have any other courses yet
          </p>
        </div>
      )}
    </section>
  );
}
