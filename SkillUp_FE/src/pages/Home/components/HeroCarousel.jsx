// src/components/home/HeroSection.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const slides = [
    {
      title: "Upgrade Your Skills Anytime, Anywhere",
      desc: "Join thousands of learners around the world mastering new technologies.",
      img: "../../../assets/react.svg",
    },
    {
      title: "Teach on SkillUp",
      desc: "Empower others by sharing your knowledge and experience.",
      img: "/assets/hero2.png",
    },
  ];

  return (
    <section className="bg-gray">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000 }}
        pagination={{ clickable: true }}
        loop
        className="w-full h-[500px]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 h-full">
              <div className="max-w-xl space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-black">
                  {slide.title}
                </h1>
                <p className="text-gray-600">{slide.desc}</p>
                <div className="flex gap-3 mt-4">
                  <button className="bg-[#FFD500] hover:bg-[#E5C100] text-black px-6 py-3 rounded-xl font-medium shadow-md">
                    Get Started
                  </button>
                  <button className="border border-black text-black hover:bg-black hover:text-white px-6 py-3 rounded-xl transition-colors">
                    Become an Instructor
                  </button>
                </div>
              </div>
              <img
                src={slide.img}
                alt="Hero"
                className="hidden md:block w-[400px]"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
