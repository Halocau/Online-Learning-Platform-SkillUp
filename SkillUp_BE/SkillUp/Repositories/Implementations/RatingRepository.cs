using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using System.Linq; // Cần cho .Where, .AverageAsync

namespace SkillUp.Repositories.Implementations
{
    public class RatingRepository : IRatingRepository
    {
        private readonly SkillUp1Context _context;

        public RatingRepository(SkillUp1Context context)
        {
            _context = context;
        }

        // (Các hàm Create, GetById, Update, Delete, GetByStudentAndCourseAsync giữ nguyên)

        public async Task<Rating> CreateAsync(Rating rating)
        {
            _context.Ratings.Add(rating);
            await _context.SaveChangesAsync();
            return rating;
        }

        public async Task<Rating?> GetByIdAsync(int id)
        {
            return await _context.Ratings
                .Include(r => r.Student)
                    .ThenInclude(s => s.Account)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task UpdateAsync(Rating rating)
        {
            _context.Ratings.Update(rating);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Rating rating)
        {
            _context.Ratings.Remove(rating);
            await _context.SaveChangesAsync();
        }

        public async Task<Rating?> GetByStudentAndCourseAsync(Guid studentId, Guid courseId)
        {
            return await _context.Ratings
                .FirstOrDefaultAsync(r => r.StudentId == studentId && r.CourseId == courseId);
        }

        public async Task<IEnumerable<Rating>> GetRatingsByCourseIdAsync(Guid courseId)
        {
            return await _context.Ratings
                .Include(r => r.Student)
                    .ThenInclude(s => s.Account)
                .Where(r => r.CourseId == courseId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        // --- HÀM ĐÃ TỐI ƯU ---
        public async Task<double?> CalculateAverageRatingAsync(Guid courseId)
        {
            var query = _context.Ratings
                .Where(r => r.CourseId == courseId && r.Star.HasValue);

            // Kiểm tra xem có bất kỳ đánh giá hợp lệ nào không
            if (!await query.AnyAsync())
            {
                return null; // Trả về null nếu không có đánh giá
            }

            // Tính trung bình trực tiếp trên DB, chỉ trả về 1 con số
            return await query.AverageAsync(r => r.Star.Value);
        }
    }
}