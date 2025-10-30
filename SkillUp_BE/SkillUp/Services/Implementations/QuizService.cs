using SkillUp.BussinessObjects.DTOs.Quiz;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class QuizService : IQuizService
    {  
        private readonly IQuizRepository _quizRepository;
        private readonly ILecturerRepository _lecturerRepository;
        private readonly ISectionRepository _sectionRepository;
        public QuizService(IQuizRepository quizRepository, ILecturerRepository lecturerRepository, ISectionRepository sectionRepository)
        {
            _quizRepository = quizRepository;
            _lecturerRepository = lecturerRepository;
            _sectionRepository = sectionRepository;
        }

        public async Task<bool> CreateQuizAsync(CreateQuizDTO dto, Guid accId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accId);
            if (lecturer == null)
                throw new Exception("Không tìm thấy giảng viên tương ứng với tài khoản này.");

            var section = await _sectionRepository.GetSectionByIdAsync(dto.SectionId);
            if (section == null)
                throw new Exception("Không tìm thấy section.");

            if (section.Course.LecturerId != lecturer.Id)
                throw new UnauthorizedAccessException("Bạn không có quyền thêm quiz vào section này.");

            var quiz = new Quiz
            {
                Id = Guid.NewGuid(),
                SectionId = dto.SectionId,
                Title = dto.Title,
                Description = dto.Description,
                PassPercent = dto.PassPercent,
                Timer = dto.Timer,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                IsActive = true
            };

            await _quizRepository.CreateQuizAsync(quiz);
            var success = await _quizRepository.SaveChangesAsync();

            return success; 
        }

    }
}
