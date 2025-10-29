// src/components/home/NewestCoursesSection.jsx
import SectionTitle from "./SectionTitle";
import CourseCard from "./CourseCard";

export default function NewestCoursesSection({ newestCourses, renderStars }) {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle title="Khóa học mới nhất" link="/newest" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newestCourses.slice(0, 4).map((course) => (
            <CourseCard key={course.id} course={course} renderStars={renderStars} />
          ))}
        </div>
      </div>
    </section>
  );
}