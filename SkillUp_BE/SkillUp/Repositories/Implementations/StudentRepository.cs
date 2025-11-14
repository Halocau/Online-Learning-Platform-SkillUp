using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class StudentRepository : IStudentRepository
    {
        private readonly SkillUpContext _context;

        public StudentRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Student student)
        {
            await _context.Set<Student>().AddAsync(student);
        }


        public async Task<Student> GetByAccountIdAsync(Guid accountId)
        {
            return await _context.Set<Student>().FirstOrDefaultAsync(s => s.AccountId == accountId);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Student?> GetStudentByAccountIdAsync(Guid accountId)
        {
            return await _context.Students
                .FirstOrDefaultAsync(s => s.AccountId == accountId);
        }
    }
}
