using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class StudentSelectedAnswersRepository : IStudentSelectedAnswersRepository
    {
        private readonly SkillUp1Context _context;

        public StudentSelectedAnswersRepository(SkillUp1Context context)
        {
            _context = context;
        }

        public async Task AddRangeAsync(IEnumerable<StudentSelectedAnswer> answers)
        {
            await _context.StudentSelectedAnswers.AddRangeAsync(answers);
        }

        public async Task<List<StudentSelectedAnswer>> GetSelectedAnswersBySubmissionIdAsync(Guid submissionId)
        {
            return await _context.StudentSelectedAnswers
         .Include(ssa => ssa.QuizAnswerSubmission)
         .Where(ssa => ssa.QuizAnswerSubmission.SubmissionId == submissionId)
         .ToListAsync();
        }
    }
}
