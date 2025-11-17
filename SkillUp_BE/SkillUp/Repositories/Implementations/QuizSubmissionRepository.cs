using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class QuizSubmissionRepository : IQuizSubmissionRepository
    {
        private readonly SkillUpContext _context; 

        public QuizSubmissionRepository(SkillUpContext context)
        {
            _context = context;
        }
        public async Task AddAsync(QuizSubmission submission)
        {
            await _context.QuizSubmissions.AddAsync(submission);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
