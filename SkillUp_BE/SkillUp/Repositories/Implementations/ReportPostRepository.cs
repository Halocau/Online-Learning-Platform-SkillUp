using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using System;
using System.Threading.Tasks;
using System.Collections.Generic; 
using System.Linq;

namespace SkillUp.Repositories.Implementations
{
    public class ReportPostRepository : IReportPostRepository
    {
        private readonly SkillUpContext _context;

        public ReportPostRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<ReportPost> CreateAsync(ReportPost reportPost)
        {
            _context.ReportPosts.Add(reportPost);
            await _context.SaveChangesAsync();
            return reportPost;
        }

        public async Task<ReportPost?> GetByIdAsync(Guid id)
        {
            // Include Account để lấy được tên người báo cáo
            return await _context.ReportPosts
                .Include(r => r.Account)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<ReportPost?> GetExistingReportAsync(Guid postId, Guid accountId)
        {
            return await _context.ReportPosts
                .FirstOrDefaultAsync(r => r.PostId == postId && r.AccountId == accountId);
        }
        public async Task<IEnumerable<ReportPost>> GetAllPendingReportsAsync()
        {
            return await _context.ReportPosts
                .Include(r => r.Account) // Lấy thông tin người báo cáo
                .Include(r => r.Post)     // Lấy thông tin bài đăng (để lấy Title)
                .Where(r => r.Status == "Pending")
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }
        public async Task UpdateAsync(ReportPost reportPost)
        {
            _context.ReportPosts.Update(reportPost);
            await _context.SaveChangesAsync();
        }
    }
}