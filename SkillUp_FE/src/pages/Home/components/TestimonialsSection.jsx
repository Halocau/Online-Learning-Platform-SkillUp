// src/components/home/TestimonialsSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import SectionTitle from "./SectionTitle";

const reviews = [
  {
    name: "Sarah Nguyen",
    role: "Lập trình viên Fullstack",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    quote: "SkillUp giúp tôi chuyển nghề và đạt được công việc mơ ước trong ngành công nghệ.",
  },
  {
    name: "John Doe",
    role: "Nhà thiết kế đồ họa",
    avatar: "https://i.pravatar.cc/150?img=2",
    rating: 5,
    quote: "Các khóa học chất lượng cao, giảng viên nhiệt tình. Tôi đã nâng cao kỹ năng thiết kế đồ họa rất nhiều.",
  },
  {
    name: "Emily Chen",
    role: "Chuyên viên Marketing",
    avatar: "https://i.pravatar.cc/150?img=3",
    rating: 4.5,
    quote: "Nền tảng học tập tuyệt vời với nội dung cập nhật và dễ tiếp cận. Rất khuyến khích cho người mới bắt đầu.",
  },
  {
    name: "Michael Lee",
    role: "Quản lý dự án",
    avatar: "https://i.pravatar.cc/150?img=4",
    rating: 5,
    quote: "Tôi đã học được cách quản lý dự án hiệu quả nhờ các khóa học Scrum. Cảm ơn SkillUp!",
  },
];

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < fullStars
              ? "fill-[#FFD54F] text-[#FFD54F]"
              : i === fullStars && hasHalf
              ? "fill-[#FFD54F]/50 text-[#FFD54F]"
              : "text-[#e3f6f5]"
          }`}
        />
      ))}
    </div>
  );
};

export default function TestimonialsSection() {
  return (
    <section className="bg-[#fffffe] py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionTitle title="Đánh giá từ học viên" />
        <p className="text-base text-[#2d334a] mb-8 max-w-2xl">
          Khám phá những câu chuyện thành công và đánh giá từ các học viên đã trải nghiệm khóa học tại SkillUp.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, i) => (
            <Card
              key={i}
              className="bg-[#fffffe] border border-[#272343]/15 rounded-2xl shadow-sm hover:shadow-[0_18px_60px_rgba(39,35,67,0.12)] transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#e3f6f5]"
                    />
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#FFD54F] ring-2 ring-[#fffffe]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#272343] tracking-tight">
                      {review.name}
                    </p>
                    <p className="text-sm text-[#2d334a]">{review.role}</p>
                  </div>
                </div>

                <div>{renderStars(review.rating)}</div>

                <p className="text-[#2d334a] text-sm leading-relaxed">
                  "{review.quote}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}