using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using System;
using System.Threading.Tasks;

namespace SkillUp.Repositories.Implementations
{
    public class CommentReportRepository : ICommentReportRepository
    {
        private readonly SkillUpContext _context;

        public CommentReportRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<CommentReportPost> CreateAsync(CommentReportPost report)
        {
            _context.CommentReportPosts.Add(report);
            await _context.SaveChangesAsync();

            // Load thông tin Account của người report để trả về tên
            await _context.Entry(report).Reference(r => r.Account).LoadAsync();

            return report;
        }

        public async Task<bool> HasAlreadyReportedAsync(Guid accountId, Guid commentPostId)
        {
            return await _context.CommentReportPosts
                .AnyAsync(r => r.AccountId == accountId && r.CommentPostId == commentPostId);
        }

        public async Task<CommentReportPost?> GetByIdAsync(Guid reportId)
        {
            // Lấy report VÀ comment liên quan để xử lý
            return await _context.CommentReportPosts
                .Include(r => r.CommentPost)
                .Include(r => r.Account) // Lấy luôn tên người report
                .FirstOrDefaultAsync(r => r.Id == reportId);
        }

        public async Task UpdateAsync(CommentReportPost report)
        {
            _context.CommentReportPosts.Update(report);
            await _context.SaveChangesAsync();
        }
    }
}