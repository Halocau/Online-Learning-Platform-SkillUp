using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _studentRepository;

        public StudentService(IStudentRepository studentRepository)
        {
            _studentRepository = studentRepository;
        }


        public async Task<Student> GetStudentByAccountIdAsync(Guid accountId)
        {
            return await _studentRepository.GetByAccountIdAsync(accountId);
        }


        public async Task<bool> RegisterStudentAsync(Guid accountId)
        {
            var student = new Student
            {
                Id = Guid.NewGuid(),
                AccountId = accountId 
            };

            await _studentRepository.AddAsync(student);
            return await _studentRepository.SaveChangesAsync();
        }
    }
}
