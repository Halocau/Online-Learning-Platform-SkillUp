// src/components/CourseSlider.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Button } from "@/components/ui/button";

export default function CourseSlider({ title, courses }) {
  return (
    <section className="max-w-6xl mx-auto py-16 px-6">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        slidesPerView={3}
        className="course-slider"
      >
        {courses.map((course, i) => (
          <SwiperSlide key={i}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="text-gray-500 text-sm">{course.instructor}</p>
                <p className="text-indigo-600 font-bold mt-2">{course.price}</p>
                <Button variant="outline" className="mt-3 w-full">
                  View Course
                </Button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
