// src/pages/home/Home.jsx
import React from "react";

import { BookOpen, Users, Award, Shield } from "lucide-react";
import HeroSection from "./components/HeroCarousel";
import SectionTitle from "./common/SectionTitle";
import InfoCard from "./common/InfoCard";
import FeaturedCourses from "./components/FeaturesSection";
import Testimonials from "./components/Testimonials";
import Newsletter from "./components/Newsletter";

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* 🔹 Hero Swiper Section */}
      <HeroSection />

      {/* 🔹 Why Choose Us (STATIC, embedded directly) */}
      <section className="py-16 bg-white text-center">
        <SectionTitle
          title="Why Choose SkillUp"
          subtitle="Empower your learning journey with the best"
        />
        <div className="grid gap-8 md:grid-cols-4 mt-12 px-6 md:px-16">
          {[
            {
              icon: <BookOpen />,
              title: "Diverse Courses",
              desc: "Thousands of curated courses in tech, design, and business.",
            },
            {
              icon: <Users />,
              title: "Expert Instructors",
              desc: "Learn from professionals with real-world experience.",
            },
            {
              icon: <Award />,
              title: "Certificates",
              desc: "Earn certificates to showcase your learning achievements.",
            },
            {
              icon: <Shield />,
              title: "Trusted Platform",
              desc: "Secure, reliable, and learner-friendly system.",
            },
          ].map((f, i) => (
            <InfoCard key={i} icon={f.icon} title={f.title} desc={f.desc} />
          ))}
        </div>
      </section>

      {/* 🔹 Featured Courses (Dynamic, reusable) */}
      <FeaturedCourses />

      {/* 🔹 How It Works (STATIC, embedded directly) */}
      <section className="py-16 bg-white">
        <SectionTitle
          title="How It Works"
          subtitle="Start your learning journey in 4 simple steps"
        />
        <div className="flex flex-wrap justify-center gap-8 mt-10">
          {[
            { step: "1", title: "Sign Up", desc: "Create your free account in minutes." },
            { step: "2", title: "Choose a Course", desc: "Pick from thousands of available topics." },
            { step: "3", title: "Start Learning", desc: "Watch lessons and complete exercises." },
            { step: "4", title: "Get Certified", desc: "Earn credentials for your skills." },
          ].map((s, i) => (
            <div key={i} className="w-64 text-center">
              <div className="text-5xl font-bold text-secondary-light mb-2">{s.step}</div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 Testimonials */}
      <Testimonials />

      {/* 🔹 Newsletter
      <Newsletter /> */}
    </div>
  );
}
