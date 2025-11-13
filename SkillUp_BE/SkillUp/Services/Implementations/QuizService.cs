using SkillUp.BussinessObjects.DTOs.Question;
using SkillUp.BussinessObjects.DTOs.Quiz;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System.Text;

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

        public async Task<Guid> CreateQuizAsync(CreateQuizDTO dto, Guid accId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accId);
            if (lecturer == null)
            {
 
                throw new Exception("Không tìm thấy giảng viên tương ứng với tài khoản này.");
            }

            var section = await _sectionRepository.GetSectionByIdAsync(dto.SectionId);
            if (section == null)
            {
                throw new Exception("Không tìm thấy section.");
            }

            if (section.Course == null)
            {
                throw new Exception("Lỗi hệ thống: Không thể tải thông tin Khóa học của Section này.");
            }

            if (section.Course.LecturerId != lecturer.Id)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền thêm quiz vào section này.");
            }

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
                IsActive = true,
                Orders = dto.Orders
            };

            await _quizRepository.CreateQuizAsync(quiz);
            var success = await _quizRepository.SaveChangesAsync();

            if (!success)
            {
                throw new Exception("Lỗi: Không thể lưu bài quiz vào cơ sở dữ liệu.");
            }
            return quiz.Id;
        }

        public async Task<bool> DeleteQuizAsync(Guid quizId, Guid accountId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accountId);
            if (lecturer == null)
                throw new Exception("Không tìm thấy giảng viên tương ứng với tài khoản này.");

            var quiz = await _quizRepository.GetQuizWithSectionAndCourseAsync(quizId);
            if (quiz == null)
                throw new Exception("Không tìm thấy quiz.");

            if (quiz.Section.Course.LecturerId != lecturer.Id)
                throw new UnauthorizedAccessException("Bạn không có quyền xóa quiz này.");
            if (!quiz.IsActive)
                throw new Exception("Quiz này đã bị xóa trước đó.");

            quiz.IsActive = false;
            quiz.UpdatedAt = DateTime.Now;

            _quizRepository.UpdateQuiz(quiz);
            var success = await _quizRepository.SaveChangesAsync();

            return success;
        }

        public async Task<QuizDetailDTO?> GetQuizDetailAsync(Guid quizId, Guid accountId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accountId);
            if (lecturer == null)
                throw new UnauthorizedAccessException("Không tìm thấy giảng viên tương ứng với tài khoản này.");

            var quiz = await _quizRepository.GetQuizWithQuestionsAsync(quizId);
            if (quiz == null)
                throw new Exception("Không tìm thấy quiz.");

     
            if (quiz.Section.Course.LecturerId != lecturer.Id)
                throw new UnauthorizedAccessException("Bạn không có quyền xem quiz này.");

            return new QuizDetailDTO
            {
                QuizId = quiz.Id,
                Title = quiz.Title ?? string.Empty,
                Description = quiz.Description,
                Questions = quiz.QuestionQuizzes
                    .Where(qq => qq.QuestionBank != null && qq.QuestionBank.IsActive)
                    .Select(qq => new QuestionDetailDTO
                    {
                        QuestionId = qq.QuestionBank.Id,
                        Title = qq.QuestionBank.Title,
                        Description = qq.QuestionBank.Description,
                        Answers = qq.QuestionBank.AnswerBanks
                            .Where(a => a.IsActive)
                            .Select(a => new AnswerDetailDTO
                            {
                                AnswerId = a.Id,
                                AnswerName = a.AnswerName,
                                IsCorrect = a.IsCorrect
                            }).ToList()
                    }).ToList()
            };
        }

        public async Task<bool> UpdateQuizAsync(Guid quizId, UpdateQuizDTO dto, Guid accountId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accountId);
            if (lecturer == null)
                throw new Exception("Không tìm thấy giảng viên tương ứng với tài khoản này.");
            var quiz = await _quizRepository.GetQuizWithSectionAndCourseAsync(quizId);
            if (quiz == null)
                throw new Exception("Không tìm thấy quiz.");
            if (quiz.Section.Course.LecturerId != lecturer.Id)
                throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa quiz này.");
            quiz.Title = dto.Title ?? quiz.Title;
            quiz.Description = dto.Description ?? quiz.Description;
            quiz.PassPercent = dto.PassPercent != default ? dto.PassPercent : quiz.PassPercent;
            quiz.Timer = dto.Timer != default ? dto.Timer : quiz.Timer;
            quiz.UpdatedAt = DateTime.Now;

            _quizRepository.UpdateQuiz(quiz);
            var success = await _quizRepository.SaveChangesAsync();

            return success;
        }
    }
}
