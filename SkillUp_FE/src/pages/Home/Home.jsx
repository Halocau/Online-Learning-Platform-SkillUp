// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import CategoryBar from "./components/CategoryBar";
import HeroCarousel from "./components/HeroCarousel";
import PopularCoursesSection from "./components/PopularCoursesSection";
import NewestCoursesSection from "./components/NewestCourse";
import TestimonialsSection from "./components/TestimonialsSection";

const API_URL = "http://localhost:5120/api/HomePage/GetAllHomePage";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL);
        if (res.data.code === 200) {
          setData(res.data.data[0]);
        } else {
          throw new Error(res.data.message);
        }
      } catch (err) {
        setError(err.message || "Failed to load homepage data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) return <HomeSkeleton />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi: {error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );

  return (
    <main className="min-h-screen bg-amber-50">
      <CategoryBar categories={data.categories} />
      <HeroCarousel />

      <PopularCoursesSection popularCourses={data.popularCourses} />
      <NewestCoursesSection newestCourses={data.newestCourses} />
      <TestimonialsSection />
    </main>
  );
}

function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-amber-50">
      <div className="h-96 bg-gray-200 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        <div className="h-10 bg-gray-200 rounded-full w-64 animate-pulse mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white/80 rounded-2xl p-4 space-y-3 shadow"
            >
              <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}