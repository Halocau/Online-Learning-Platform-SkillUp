// src/components/HeroCarousel.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HeroCarousel() {
  const slides = [
    {
      title: "Master tomorrow's skills today",
      subtitle:
        "Power up your AI, career, and life skills with the most up-to-date, expert-led learning.",
      image:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=1600&q=80",
      button1: "Get started",
      
    },
    {
      title: "Boost your career with tech skills",
      subtitle: "Learn coding, design, marketing, and more from top mentors.",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
      button1: "Explore Courses",
      
    },
  ];

  return (
    <section id="hero-section" className="w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000 }}
        loop
        className="rounded-3xl overflow-hidden"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative h-[500px] flex items-center justify-center text-white"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Dark gradient overlay for better readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />

              <motion.div
                className="relative z-10 text-center max-w-2xl px-4"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-lg mb-6 opacity-90">{slide.subtitle}</p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-indigo-600 font-semibold hover:bg-indigo-50"
                  >
                    <Link to="/login">{slide.button1}</Link>
                    
                  </Button>
                  
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
