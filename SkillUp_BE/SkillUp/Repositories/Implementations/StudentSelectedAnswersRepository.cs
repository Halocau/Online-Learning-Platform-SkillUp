using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class StudentSelectedAnswersRepository : IStudentSelectedAnswersRepository
    {
        private readonly SkillUpContext _context;

        public StudentSelectedAnswersRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task AddRangeAsync(IEnumerable<StudentSelectedAnswer> answers)
        {
            await _context.StudentSelectedAnswers.AddRangeAsync(answers);
        }
    }
}
