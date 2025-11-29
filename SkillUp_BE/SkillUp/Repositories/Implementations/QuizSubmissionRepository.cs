using Microsoft.EntityFrameworkCore;
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

        public async Task<QuizSubmission?> GetByIdAsync(Guid id)
        {
            return await _context.QuizSubmissions.FindAsync(id);
        }


        public void Update(QuizSubmission submission)
        {
            _context.QuizSubmissions.Update(submission);
        }


        public async Task<List<QuizSubmission>> GetSubmissionsByQuizAndStudentAsync(Guid quizId, Guid studentId)
        {
            return await _context.QuizSubmissions
                .Where(s => s.QuizId == quizId && s.StudentId == studentId)
                .Where(s => s.EndedAt != null)
                .OrderByDescending(s => s.StartedAt)
                .ToListAsync();
        }

        public async Task<QuizSubmission?> GetSubmissionWithDetailsAsync(Guid id, Guid studentId)
        {
            return await _context.QuizSubmissions
                .Include(s => s.Quiz) 
                .FirstOrDefaultAsync(s => s.Id == id && s.StudentId == studentId);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

    }
}
