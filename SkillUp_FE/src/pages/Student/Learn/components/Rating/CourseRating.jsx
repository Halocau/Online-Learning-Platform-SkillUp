import { useState, useEffect } from "react";
import { Star, Edit2, Trash2, MessageSquare } from "lucide-react";
import { ratingAPI } from "@/api/ratingAPI";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils.js";
import RatingModal from "./RatingModal.jsx";
import { formatTimeAgo } from "@/utils/formatTimeAgo";


const CourseRatings = ({ courseId, currentUserId }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRating, setEditingRating] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchRatings();
  }, [courseId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await ratingAPI.getCourseRatings(courseId);

      // Handle nested structure
      let fetchedRatings = [];
      if (response.data?.data?.ratings) {
        fetchedRatings = response.data.data.ratings;
      } else if (response.data?.ratings) {
        fetchedRatings = response.data.ratings;
      } else if (Array.isArray(response.data)) {
        fetchedRatings = response.data;
      }

      setRatings(fetchedRatings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      toast.error("Không thể tải đánh giá");
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rating) => {
    setEditingRating(rating);
    setShowEditModal(true);
  };

  const handleUpdateRating = async (data) => {
    try {
      await ratingAPI.updateRating(data);
      await fetchRatings();
      setShowEditModal(false);
      setEditingRating(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (ratingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return;
    }

    try {
      setDeletingId(ratingId);
      await ratingAPI.deleteRating(ratingId);
      toast.success("Đã xóa đánh giá");
      await fetchRatings();
    } catch (error) {
      console.error("Error deleting rating:", error);
      toast.error("Không thể xóa đánh giá");
    } finally {
      setDeletingId(null);
    }
  };

  const calculateStats = () => {
    if (ratings.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    ratings.forEach((rating) => {
      sum += rating.star;
      distribution[rating.star] = (distribution[rating.star] || 0) + 1;
    });

    return {
      average: (sum / ratings.length).toFixed(1),
      total: ratings.length,
      distribution,
    };
  };

  const stats = calculateStats();

  const StarRating = ({ rating, size = "w-5 h-5" }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            size,
            star <= rating ? "fill-[#FFD54F] text-[#FFD54F]" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-12 h-12 border-4 border-[#FFD54F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Đang tải đánh giá... </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6 text-[#FFD54F]" />
        <h2 className="text-2xl font-bold text-gray-900">
          Đánh giá từ học viên
        </h2>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
        {/* Average Rating */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <div className="text-5xl font-bold text-gray-900">
              {stats.average}
            </div>
            <div>
              <StarRating rating={Math.round(stats.average)} size="w-6 h-6" />
              <p className="text-sm text-gray-600 mt-1">
                {stats.total} đánh giá
              </p>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star];
            const percentage =
              stats.total > 0 ? (count / stats.total) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">
                    {star}
                  </span>
                  <Star className="w-4 h-4 fill-[#FFD54F] text-[#FFD54F]" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFD54F] rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      {ratings.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có đánh giá
          </h3>
          <p className="text-gray-600">
            Hãy là người đầu tiên đánh giá khóa học này!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {ratings.map((rating) => {
            const isOwner =
              rating.studentId === currentUserId ||
              rating.userId === currentUserId;

            return (
              <div
                key={rating.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                {/* User Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD54F] to-[#FFC107] flex items-center justify-center text-gray-900 font-bold text-lg">
                      {(rating.studentName ||
                        rating.userName)?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {rating.studentName || rating.userName || "Học viên"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatTimeAgo(rating.createdAt || rating.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(rating)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rating.id)}
                        disabled={deletingId === rating.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="mb-3">
                  <StarRating rating={rating.star} />
                </div>

                {/* Review Content */}
                {rating.contents && (
                  <p className="text-gray-700 leading-relaxed">
                    {rating.contents}
                  </p>
                )}

                {/* Updated Badge */}
                {rating.updatedAt &&
                  rating.createdAt &&
                  new Date(rating.updatedAt).getTime() >
                  new Date(rating.createdAt).getTime() + 1000 && (
                    <p className="text-xs text-gray-500 mt-3 italic">
                      Đã chỉnh sửa
                    </p>
                  )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRating && (
        <RatingModal
          courseName="Khóa học của bạn"
          courseId={courseId}
          existingRating={editingRating}
          onSubmit={handleUpdateRating}
          onClose={() => {
            setShowEditModal(false);
            setEditingRating(null);
          }}
        />
      )}
    </div>
  );
};

export default CourseRatings;
