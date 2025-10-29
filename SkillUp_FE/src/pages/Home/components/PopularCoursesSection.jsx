// src/components/home/PopularCoursesSection.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import SectionTitle from "./SectionTitle";
import CourseCard from "./CourseCard";

export default function PopularCoursesSection({ popularCourses, renderStars }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <SectionTitle title="Khóa học nổi bật" link="/popular" />
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        autoplay={{ delay: 5000 }}
        spaceBetween={24}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          768: { slidesPerView: 3.2 },
          1024: { slidesPerView: 4.2 },
        }}
        className="popular-courses-swiper"
      >
        {popularCourses.map((course) => (
          <SwiperSlide key={course.id}>
            <CourseCard course={course} renderStars={renderStars} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}