// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import CategoryBar from "./components/CategoryBar";
import HeroCarousel from "./components/HeroCarousel";
import PopularCoursesSection from "./components/PopularCoursesSection";
import NewestCoursesSection from "./components/NewestCourse";
import TestimonialsSection from "./components/TestimonialsSection";

const API_URL = `${API_BASE_URL}/HomePage/GetAllHomePage`;

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
      <div className="min-h-screen flex items-center justify-center bg-[#fffffe]">
        <div className="text-center space-y-4">
          <p className="text-red-600 text-base">Lỗi: {error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#FFD54F] text-[#272343] hover:bg-[#F4C430] font-semibold px-6 py-2 rounded-full"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );

  return (
    <main className="min-h-screen bg-[#fffffe]">
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
    <div className="min-h-screen bg-[#fffffe]">
      {/* Hero Skeleton */}
      <div className="h-96 bg-gradient-to-b from-[#e3f6f5]/60 via-[#fffffe] to-[#bae8e8]/40 animate-pulse" />

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        <div className="h-10 bg-[#e3f6f5] rounded-full w-64 animate-pulse mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#272343]/15 p-4 space-y-3 shadow-sm"
            >
              <div className="h-48 bg-[#e3f6f5] rounded-xl animate-pulse" />
              <div className="h-5 bg-[#e3f6f5] rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-[#e3f6f5] rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
