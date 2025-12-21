// src/components/HeroCarousel.jsx
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PlayCircle, ArrowRight } from "lucide-react";

export default function HeroCarousel() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultSlides = [
    {
      title: "Quản lý việc học của bạn hiệu quả hơn",
      description:
        "SkillUp giúp bạn nâng cao kỹ năng AI, sự nghiệp và cuộc sống với những khóa học được cập nhật và hướng dẫn bởi chuyên gia.",
      image:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=1600&q=80",
      hyperlink: "/login",
      stats: [
        { label: "Học viên đang hoạt động", value: "12k+" },
        { label: "Tỷ lệ hoàn thành", value: "89%" },
        { label: "Khóa học được quản lý", value: "3.5k" },
      ],
    },
  ];

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5120/api/Banner/active-banners");
      
      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }

      const result = await response.json();
      
      if (result.code === 200 && result.data && result.data.length > 0) {
        const flattenedBanners = result.data.flat();
        setBanners(flattenedBanners);
      } else {
        setBanners(defaultSlides);
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError(err.message);
      setBanners(defaultSlides);
    } finally {
      setLoading(false);
    }
  };

  // Default stats for all slides
  const defaultStats = [
    { label: "Học viên đang hoạt động", value: "12k+" },
    { label: "Tỷ lệ hoàn thành", value: "89%" },
    { label: "Khóa học được quản lý", value: "3.5k" },
  ];

  if (loading) {
    return (
      <section className="w-full border-b border-[#272343]/10 bg-gradient-to-b from-[#e3f6f5]/60 via-[#fffffe] to-[#bae8e8]/40">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-20">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FFD54F] border-t-transparent mx-auto mb-4"></div>
            <p className="text-[#2d334a]">Đang tải...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full border-b border-[#272343]/10 bg-gradient-to-b from-[#e3f6f5]/60 via-[#fffffe] to-[#bae8e8]/40">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop={banners.length > 1}
        className="hero-swiper"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner.id || index}>
            <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:py-20">
              {/* Left Content */}
              <motion.div
                className="flex-1 space-y-6"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-[#272343]/10 bg-[#fffffe]/80 px-3 py-1 text-xs font-medium tracking-tight text-[#2d334a]">
                  <svg
                    className="h-3.5 w-3.5 text-[#FFD54F]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3l1.9 4.6L19 9.5l-4.1 1.9L12 16l-2.9-4.6L5 9.5l5.1-1.9L12 3z"></path>
                    <path d="M5 19l.5-1.5L7 17l-1.5-.5L5 15l-.5 1.5L3 17l1.5.5z"></path>
                    <path d="M19 19l.5-1.5L21 17l-1.5-.5L19 15l-.5 1.5L17 17l1.5.5z"></path>
                  </svg>
                  <span>Lộ trình học tập rõ ràng, dễ theo dõi</span>
                </div>

                <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[#272343] sm:text-4xl lg:text-5xl">
                  {banner.title && banner.title.includes("hiệu quả hơn") ? (
                    <>
                      {banner.title.split("hiệu quả hơn")[0]}
                      <span className="relative inline-block">
                        hiệu quả hơn
                        <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-[#FFD54F]/80"></span>
                      </span>
                    </>
                  ) : (
                    <span className="relative inline-block">
                      {banner.title || "Quản lý việc học của bạn hiệu quả hơn"}
                      <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-[#FFD54F]/80"></span>
                    </span>
                  )}
                </h1>

                <p className="max-w-xl text-base leading-relaxed text-[#2d334a]">
                  {banner.description || "Nâng cao kỹ năng và sự nghiệp của bạn với những khóa học chất lượng."}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {banner.hyperlink ? (
                    <a href={banner.hyperlink} target="_blank" rel="noopener noreferrer">
                      <Button
                        size="lg"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFD54F] px-5 py-2 text-sm font-semibold tracking-tight text-[#272343] shadow-sm hover:bg-[#F4C430]"
                      >
                        Bắt đầu học ngay
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                    </a>
                  ) : (
                    <Link to="/login">
                      <Button
                        size="lg"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFD54F] px-5 py-2 text-sm font-semibold tracking-tight text-[#272343] shadow-sm hover:bg-[#F4C430]"
                      >
                        Bắt đầu học ngay
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 sm:flex sm:flex-wrap sm:gap-6">
                  {(banner.stats || defaultStats).map((stat, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-xs font-medium uppercase tracking-tight text-[#2d334a]">
                        {stat.label}
                      </div>
                      <div className="text-2xl font-semibold tracking-tight text-[#272343]">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right Image/Illustration */}
              <div className="flex-1">
                <div
                  className="relative mx-auto max-w-md h-96 rounded-3xl border border-[#272343]/15 bg-cover bg-center shadow-[0_18px_60px_rgba(39,35,67,0.18)]"
                  style={{
                    backgroundImage: `url(${banner.image || 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=1600&q=80'})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#272343]/60 to-transparent rounded-3xl" />
                  <div className="absolute -top-3 -left-3 h-16 w-16 rounded-3xl bg-[#FFD54F]/40 blur-2xl"></div>
                  <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-[#e3f6f5] blur-3xl"></div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx>{`
        .hero-swiper :global(.swiper-button-next),
        .hero-swiper :global(.swiper-button-prev) {
          color: #ffd54f;
          background: rgba(255, 255, 255, 0.9);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .hero-swiper :global(.swiper-button-next:after),
        .hero-swiper :global(.swiper-button-prev:after) {
          font-size: 16px;
          font-weight: bold;
        }

        .hero-swiper :global(.swiper-pagination-bullet) {
          background: #272343;
          opacity: 0.3;
        }

        .hero-swiper :global(.swiper-pagination-bullet-active) {
          background: #ffd54f;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}