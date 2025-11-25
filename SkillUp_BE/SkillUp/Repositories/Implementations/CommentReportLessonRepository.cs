// File: /Repositories/Implementations/CommentReportLessonRepository.cs
using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class CommentReportLessonRepository : ICommentReportLessonRepository
    {
        private readonly SkillUp1Context _context;
        public CommentReportLessonRepository(SkillUp1Context context) { _context = context; }

        public async Task<CommentReportLesson> CreateAsync(CommentReportLesson report)
        {
            _context.CommentReportLessons.Add(report);
            await _context.SaveChangesAsync();

            // Load thông tin relations để Service map sang DTO
            await _context.Entry(report).Reference(r => r.Account).LoadAsync(); // Người báo cáo
            await _context.Entry(report).Reference(r => r.CommentLesson).LoadAsync(); // Comment

            // Load tác giả của comment (vì CommentLesson có virtual Account)
            await _context.Entry(report.CommentLesson).Reference(c => c.Account).LoadAsync();

            return report;
        }

        public async Task<CommentReportLesson?> GetByIdAsync(Guid reportId)
        {
            return await _context.CommentReportLessons
                .Include(r => r.Account) // Include người báo cáo
                .Include(r => r.CommentLesson).ThenInclude(c => c.Account) // Include comment và tác giả
                .FirstOrDefaultAsync(r => r.Id == reportId);
        }

        public async Task<IEnumerable<CommentReportLesson>> GetPendingReportsAsync()
        {
            return await _context.CommentReportLessons
                .Where(r => r.Status == "Pending")
                .Include(r => r.Account)
                .Include(r => r.CommentLesson).ThenInclude(c => c.Account)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task UpdateAsync(CommentReportLesson report)
        {
            _context.CommentReportLessons.Update(report);
            await _context.SaveChangesAsync();
        }
    }
}