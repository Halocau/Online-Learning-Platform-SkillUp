using SkillUp.BussinessObjects.DTOs.Rating;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class RatingService : IRatingService
    {
        private readonly IRatingRepository _ratingRepo;
        private readonly ICourseRepository _courseRepo;
        private readonly IStudentRepository _studentRepo; // Dịch vụ sửa lỗi FK

        public RatingService(
            IRatingRepository ratingRepo,
            ICourseRepository courseRepo,
            IStudentRepository studentRepo)
        {
            _ratingRepo = ratingRepo;
            _courseRepo = courseRepo;
            _studentRepo = studentRepo;
        }

        // --- CREATE ---
        public async Task<RatingDto> CreateRatingAsync(CreateRatingDto dto, Guid accountId)
        {
            // BƯỚC 1: SỬA LỖI FK - Tìm StudentId từ AccountId (token)
            var student = await _studentRepo.GetStudentByAccountIdAsync(accountId);
            if (student == null)
            {
                throw new InvalidOperationException("Không tìm thấy thông tin học viên cho tài khoản này.");
            }
            var studentId = student.Id;

            // BƯỚC 2: Kiểm tra trùng lặp
            var existingRating = await _ratingRepo.GetByStudentAndCourseAsync(studentId, dto.CourseId);
            if (existingRating != null)
            {
                throw new InvalidOperationException("Bạn đã đánh giá khóa học này rồi.");
            }

            // BƯỚC 3: Tạo mới
            var rating = new Rating
            {
                StudentId = studentId, // <-- Dùng studentId đã tìm được
                CourseId = dto.CourseId,
                Contents = dto.Contents,
                Star = dto.Star,
                CreatedAt = DateTime.Now
            };
            var savedRating = await _ratingRepo.CreateAsync(rating);

            // BƯỚC 4: Cập nhật điểm trung bình
            await UpdateCourseAverageRating(dto.CourseId);

            // Lấy lại data (đã Include) để MapToDto
            var fullRating = await _ratingRepo.GetByIdAsync(savedRating.Id);
            return MapToDto(fullRating!);
        }

        // --- UPDATE ---
        public async Task<RatingDto> UpdateRatingAsync(UpdateRatingDto dto, Guid accountId)
        {
            var student = await _studentRepo.GetStudentByAccountIdAsync(accountId);
            if (student == null)
            {
                throw new InvalidOperationException("Không tìm thấy thông tin học viên.");
            }

            var rating = await _ratingRepo.GetByIdAsync(dto.RatingId);
            if (rating == null)
            {
                throw new KeyNotFoundException("Không tìm thấy đánh giá.");
            }

            // Kiểm tra quyền sở hữu
            if (rating.StudentId != student.Id)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền sửa đánh giá này.");
            }

            rating.Contents = dto.Contents;
            rating.Star = dto.Star;
            await _ratingRepo.UpdateAsync(rating);

            await UpdateCourseAverageRating(rating.CourseId);
            return MapToDto(rating);
        }

        // --- DELETE ---
        public async Task DeleteRatingAsync(int ratingId, Guid accountId)
        {
            var student = await _studentRepo.GetStudentByAccountIdAsync(accountId);
            if (student == null)
            {
                throw new InvalidOperationException("Không tìm thấy thông tin học viên.");
            }

            var rating = await _ratingRepo.GetByIdAsync(ratingId);
            if (rating == null)
            {
                throw new KeyNotFoundException("Không tìm thấy đánh giá.");
            }

            if (rating.StudentId != student.Id)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xóa đánh giá này.");
            }

            await _ratingRepo.DeleteAsync(rating);
            await UpdateCourseAverageRating(rating.CourseId);
        }

        // --- READ ---
        public async Task<RatingResponseDto> GetRatingsByCourseIdAsync(Guid courseId)
        {
            // SỬA LỖI: Chúng ta phải chạy các lệnh này tuần tự,
            // không được dùng Task.WhenAll vì chúng dùng chung 1 DbContext.

            // 1. Lấy danh sách ratings trước
            var ratings = await _ratingRepo.GetRatingsByCourseIdAsync(courseId);

            // 2. Sau khi (1) hoàn thành, lấy điểm trung bình
            var average = await _ratingRepo.CalculateAverageRatingAsync(courseId);

            // Map danh sách ratings sang DTO
            var ratingDtos = ratings.Select(MapToDto);

            // Trả về đối tượng DTO mới
            return new RatingResponseDto
            {
                AverageRating = average.HasValue ? Math.Round(average.Value, 2) : (double?)null,

                Ratings = ratingDtos
            };
        }

        // --- HÀM HELPER TÍNH TOÁN ---
        private async Task UpdateCourseAverageRating(Guid courseId)
        {
            var newAverage = await _ratingRepo.CalculateAverageRatingAsync(courseId);
            var course = await _courseRepo.GetByIdAsync(courseId);
            if (course != null)
            {
                course.Rating = newAverage;
                await _courseRepo.UpdateAsync(course);
            }
        }

        // --- HÀM HELPER MAP DTO ---
        private RatingDto MapToDto(Rating rating)
        {
            // Repo đã Include(r => r.Student.Account)
            var studentName = rating.Student?.Account?.Fullname ?? "Học viên";

            return new RatingDto
            {
                Id = rating.Id,
                StudentId = rating.StudentId,
                StudentName = studentName,
                CourseId = rating.CourseId,
                Contents = rating.Contents,
                Star = rating.Star,
                CreatedAt = rating.CreatedAt
            };
        }

    }
}