import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Star } from "lucide-react";
import StarRating from "@/components/ui/StarRating";
import { ratingAPI } from "@/api/ratingAPI";
import { toast } from "react-toastify";
import { formatTimeAgo } from "@/utils/formatTimeAgo";

export default function ReviewsSection({
  courseId,
  courseRating,
  totalReviews,
}) {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    if (courseId) {
      fetchRatings();
    }
  }, [courseId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await ratingAPI.getCourseRatings(courseId);

      let fetchedRatings = [];
      let averageFromAPI = courseRating;

      if (response.data) {
        if (response.data.data) {
          fetchedRatings = response.data.data.ratings || [];
          averageFromAPI = response.data.data.averageRating || courseRating;
        } else if (response.data.ratings) {
          fetchedRatings = response.data.ratings || [];
          averageFromAPI = response.data.averageRating || courseRating;
        } else if (Array.isArray(response.data)) {
          fetchedRatings = response.data;
        }
      } else if (response.ratings) {
        fetchedRatings = response.ratings || [];
        averageFromAPI = response.averageRating || courseRating;
      }

      setRatings(fetchedRatings);
      calculateStats(fetchedRatings, averageFromAPI);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      toast.error("Không thể tải đánh giá");
      setRatings([]);
      calculateStats([], courseRating);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ratingsData, averageFromAPI = null) => {
    if (
      !ratingsData ||
      !Array.isArray(ratingsData) ||
      ratingsData.length === 0
    ) {
      setStats({
        average: averageFromAPI || courseRating || 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
      return;
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    ratingsData.forEach((rating) => {
      sum += rating.star;
      distribution[rating.star] = (distribution[rating.star] || 0) + 1;
    });

    const calculatedAverage =
      ratingsData.length > 0 ? sum / ratingsData.length : 0;

    setStats({
      average: averageFromAPI || calculatedAverage.toFixed(1),
      total: ratingsData.length,
      distribution,
    });
  };

  const getPercentage = (star) => {
    if (stats.total === 0) return 0;
    return Math.round((stats.distribution[star] / stats.total) * 100);
  };

  if (loading) {
    return (
      <Card className="border-2 border-[#FFD54F]/20">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-[#FFD54F] animate-spin mb-4" />
            <p className="text-gray-600">Đang tải đánh giá...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#FFD54F]/20">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#FFD54F]/20 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6 text-[#FFD54F]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Đánh giá từ học viên
          </h2>
        </div>

        {/* Rating Summary */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8 p-6 bg-gradient-to-br from-[#FFD54F]/10 to-[#FFC107]/10 rounded-xl border border-[#FFD54F]/20">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {parseFloat(stats.average).toFixed(1)}
            </div>
            <div className="flex gap-1 mb-2 justify-center">
              <StarRating rating={parseFloat(stats.average)} size="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-600">
              {stats.total} {stats.total === 1 ? "đánh giá" : "đánh giá"}
            </p>
          </div>

          <div className="flex-1 w-full space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const percentage = getPercentage(star);
              const count = stats.distribution[star];

              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12">{star} sao</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFD54F] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {percentage}% ({count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        {ratings.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có đánh giá
            </h3>
            <p className="text-gray-600">
              Hãy là người đầu tiên đánh giá khóa học này sau khi hoàn thành!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {ratings.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
              >
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage
                      src={review.studentAvatar || review.userAvatar}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#FFD54F] to-[#FFC107] text-gray-900">
                      {(review.studentName || review.userName)
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {review.studentName || review.userName || "Học viên"}
                      </h4>
                      <span className="text-sm text-gray-500 flex-shrink-0">
                        {formatTimeAgo(review.createdAt || review.updatedAt)}
                      </span>
                    </div>

                    <div className="flex gap-1 mb-3">
                      <StarRating rating={review.star} size="w-4 h-4" />
                    </div>

                    {review.contents && (
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        {review.contents}
                      </p>
                    )}

                    {/* Updated badge if the review was edited */}
                    {review.updatedAt &&
                      review.createdAt &&
                      new Date(review.updatedAt).getTime() >
                        new Date(review.createdAt).getTime() + 1000 && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Đã chỉnh sửa
                        </p>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
