// src/pages/home/components/PopularCourses.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function PopularCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔌 Simulate API call (replace later)
  useEffect(() => {
    setTimeout(() => {
      setCourses([
        {
          id: 1,
          title: "Web Development Bootcamp",
          desc: "Master React, Node.js and MongoDB.",
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
        },
        {
          id: 2,
          title: "UI/UX Design Mastery",
          desc: "Design stunning, user-friendly interfaces.",
          image: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
        },
        {
          id: 3,
          title: "Data Science with Python",
          desc: "Build data-driven apps and dashboards.",
          image: "https://images.unsplash.com/photo-1555949963-aa79dcee981d",
        },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Popular Courses
        </h2>

        <div className="grid md:grid-cols-3 gap-8 px-6">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-xl shadow animate-pulse"
                >
                  <div className="h-40 bg-gray-200 rounded mb-4"></div>
                  <div className="h-5 bg-gray-200 w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 w-1/2"></div>
                </div>
              ))
            : courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 shadow hover:shadow-lg"
                >
                  <LazyLoadImage
                    src={course.image}
                    alt={course.title}
                    effect="blur"
                    className="rounded-lg mb-4 w-full h-40 object-cover"
                  />
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="text-gray-500 mt-2">{course.desc}</p>
                  <Button variant="outline" className="mt-4">
                    View Course
                  </Button>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
