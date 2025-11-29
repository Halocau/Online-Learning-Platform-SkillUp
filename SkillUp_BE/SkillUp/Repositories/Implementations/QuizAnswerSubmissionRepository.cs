using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class QuizAnswerSubmissionRepository : IQuizAnswerSubmissionRepository
    {
        private readonly SkillUpContext _context;

        public QuizAnswerSubmissionRepository(SkillUpContext context)
        {
            _context = context;
        }
        public async Task AddRangeAsync(IEnumerable<QuizAnswerSubmission> submissions)
        {
            await _context.QuizAnswerSubmissions.AddRangeAsync(submissions);
        }
        public async Task<List<QuizAnswerSubmission>> GetBySubmissionIdAsync(Guid submissionId)
        {
            return await _context.QuizAnswerSubmissions
                .Where(s => s.SubmissionId == submissionId)
                .ToListAsync();
        }
    }
}
