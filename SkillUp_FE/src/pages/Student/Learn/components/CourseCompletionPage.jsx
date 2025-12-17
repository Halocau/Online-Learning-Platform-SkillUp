import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Trophy,
  Star,
  ArrowRight,
  Download,
  Share2,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";

const CourseCompletionPage = ({
  courseData,
  onOpenRatingModal,
  userRating,
}) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  const handleBackToCourse = () => {
    navigate(`/student/learn/${courseId}`);
  };

  const handleGoToDashboard = () => {
    navigate("/my-courses");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative z-10 animate-fadeIn">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-6 shadow-xl transform hover:scale-110 transition-transform duration-300">
              <Trophy className="w-20 h-20 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PartyPopper className="w-8 h-8 text-yellow-500 animate-bounce" />
            <h1 className="text-3xl md:text-2xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
              Chúc Mừng!
            </h1>
            <PartyPopper
              className="w-8 h-8 text-yellow-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>

          <p className="text-xl md:text-2xl text-gray-700 font-semibold mb-3">
            Bạn đã hoàn thành khóa học
          </p>

          <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            "{courseData?.title}"
          </p>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Thật tuyệt vời! Bạn đã nỗ lực và hoàn thành tất cả các bài học. Hãy
            tiếp tục phát triển kỹ năng của mình!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {courseData?.sections?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Chương</div>
          </div>
          <div className="text-center border-x border-gray-300">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {courseData?.sections?.reduce(
                (acc, section) => acc + (section.items?.length || 0),
                0
              ) || 0}
            </div>
            <div className="text-sm text-gray-600">Bài học</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 mb-1">100%</div>
            <div className="text-sm text-gray-600">Hoàn thành</div>
          </div>
        </div>

        {!userRating && (
          <div className="mb-8  rounded-full p-6 border-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FFD54F] flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" fill="white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Đánh giá khóa học
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chia sẻ trải nghiệm của bạn với chúng tôi
                  </p>
                </div>
              </div>
              <Button
                onClick={onOpenRatingModal}
                className="flex items-center gap-2 px-6 py-3 bg-[#FFD54F] hover:bg-[#FFC107] text-gray-900 font-bold rounded-lg transition-colors shadow-sm"
              >
                Đánh giá ngay
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleBackToCourse}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Xem lại khóa học
          </Button>

          <Button
            onClick={handleGoToDashboard}
            variant="outline"
            className="flex-1 border-2 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50 text-gray-700 font-semibold py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-lg"
          >
            Về Khóa học của tôi
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCompletionPage;
