// src/components/home/Testimonials.jsx
import React from "react";
import SectionTitle from "../common/SectionTitle";

export default function Testimonials() {
  return (
    <section className="py-16 bg-background-dark">
      <SectionTitle
        title="What Our Learners Say"
        subtitle="Trusted by thousands worldwide"
      />
      <div className="text-center text-text-secondary mt-8">
        <p>“SkillUp helped me switch careers and land my dream job in tech.”</p>
        <p className="mt-2 font-semibold text-primary">– Sarah Nguyen</p>
      </div>
    </section>
  );
}
