// src/components/home/NewestCoursesSection.jsx
import SectionTitle from "./SectionTitle";
import CourseCard from "./CourseCard";

export default function NewestCoursesSection({ newestCourses }) {
  return (
    <section className="bg-[#e3f6f5]/60 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionTitle title="Khóa học mới nhất" link="/newest" />
        <p className="text-base text-[#2d334a] mb-8 max-w-2xl">
          Cập nhật những khóa học mới nhất được thiết kế để giúp bạn theo kịp xu hướng công nghệ và kỹ năng hiện đại.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newestCourses.slice(0, 4).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}