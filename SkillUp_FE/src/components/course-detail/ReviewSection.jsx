// src/components/course-detail/ReviewsSection.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp } from "lucide-react";
import StarRating from "@/components/ui/StarRating";

const FAKE_REVIEWS = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    avatar: null,
    rating: 5,
    date: "2 tuần trước",
    comment: "Khóa học rất chi tiết và dễ hiểu. Giảng viên giảng dạy nhiệt tình, nội dung được cập nhật thường xuyên. Tôi đã học được rất nhiều kiến thức hữu ích cho công việc.",
    helpful: 24
  },
  {
    id: 2,
    name: "Trần Thị Bích",
    avatar: null,
    rating: 5,
    date: "1 tháng trước",
    comment: "Nội dung khóa học rất phù hợp với người mới bắt đầu. Các ví dụ thực tế giúp tôi dễ dàng áp dụng vào dự án của mình. Rất đáng để đầu tư!",
    helpful: 18
  },
  {
    id: 3,
    name: "Lê Minh Hoàng",
    avatar: null,
    rating: 4,
    date: "2 tháng trước",
    comment: "Khóa học tốt, giảng viên có kinh nghiệm. Chỉ có điều một số phần giảng hơi nhanh, cần xem lại nhiều lần. Nhìn chung vẫn rất hài lòng với khóa học.",
    helpful: 12
  },
  {
    id: 4,
    name: "Phạm Thu Hà",
    avatar: null,
    rating: 5,
    date: "3 tháng trước",
    comment: "Đây là khóa học tốt nhất mà tôi từng tham gia. Giảng viên rất tận tâm, luôn sẵn sàng giải đáp thắc mắc. Tài liệu phong phú và được cập nhật liên tục.",
    helpful: 31
  }
];

export default function ReviewsSection({ courseRating, totalReviews }) {
  return (
    <Card className="border-2 border-[#FFD54F]/20">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-[#FFD54F]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Đánh giá từ học viên</h2>
        </div>

        {/* Rating Summary */}
        <div className="flex items-center gap-8 mb-8 p-6 bg-gradient-to-br from-[#FFD54F]/10 to-[#FFC107]/10 rounded-xl border border-[#FFD54F]/20">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {courseRating.toFixed(1)}
            </div>
            <div className="flex gap-1 mb-2">
              <StarRating rating={courseRating} size="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-600">{totalReviews} đánh giá</p>
          </div>
          
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-medium w-12">{star} sao</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFD54F] rounded-full transition-all"
                    style={{
                      width: `${star === 5 ? 75 : star === 4 ? 20 : 5}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {star === 5 ? "75%" : star === 4 ? "20%" : "5%"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {FAKE_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
            >
              <div className="flex gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={review.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-[#FFD54F] to-[#FFC107] text-gray-900">
                    {review.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{review.name}</h4>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  
                  <div className="flex gap-1 mb-3">
                    <StarRating rating={review.rating} size="w-4 h-4" />
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {review.comment}
                  </p>
                  
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#FFD54F] transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Hữu ích ({review.helpful})</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}