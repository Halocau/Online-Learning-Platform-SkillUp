using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class QuizAnswerSubmissionRepository : IQuizAnswerSubmissionRepository
    {
        private readonly SkillUp1Context _context;

        public QuizAnswerSubmissionRepository(SkillUp1Context context)
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
