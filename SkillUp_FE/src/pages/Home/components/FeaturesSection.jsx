// src/components/home/FeaturedCourses.jsx
import React from "react";
import SectionTitle from "../common/SectionTitle";
import CardGrid from "../common/CardGrid";


export default function FeaturedCourses() {
  const courses = [
    { title: "React for Beginners", desc: "Learn React step by step", image: "/assets/react.png" },
    { title: "UI/UX Design Mastery", desc: "Build modern user experiences", image: "/assets/uiux.png" },
    { title: "Fullstack JavaScript", desc: "Become a professional developer", image: "/assets/js.png" },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <SectionTitle title="Featured Courses" subtitle="Our most popular learning paths" />
      <CardGrid data={courses} />
    </section>
  );
}
