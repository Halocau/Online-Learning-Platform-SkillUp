// src/components/home/PopularCoursesSection.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import SectionTitle from "./SectionTitle";
import CourseCard from "./CourseCard";

export default function PopularCoursesSection({ popularCourses }) {
  return (
    <section className="border-b border-[#272343]/10 bg-[#fffffe]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <SectionTitle title="Tất cả công cụ bạn cần để học tập chủ động" link="/popular" />
        <p className="text-base text-[#2d334a] mb-8 max-w-2xl">
          Khám phá các khóa học được yêu thích nhất, được đánh giá cao bởi cộng đồng học viên của chúng tôi.
        </p>
        
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          spaceBetween={24}
          slidesPerView={1.2}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="popular-courses-swiper"
        >
          {popularCourses.map((course) => (
            <SwiperSlide key={course.id}>
              <CourseCard course={course} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx>{`
        .popular-courses-swiper :global(.swiper-button-next),
        .popular-courses-swiper :global(.swiper-button-prev) {
          color: #272343;
          background: #e3f6f5;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(39, 35, 67, 0.1);
        }

        .popular-courses-swiper :global(.swiper-button-next:hover),
        .popular-courses-swiper :global(.swiper-button-prev:hover) {
          background: #FFD54F;
        }

        .popular-courses-swiper :global(.swiper-button-next:after),
        .popular-courses-swiper :global(.swiper-button-prev:after) {
          font-size: 14px;
          font-weight: bold;
        }
      `}</style>
    </section>
  );
}