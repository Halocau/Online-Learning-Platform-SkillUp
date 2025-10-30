using SkillUp.BussinessObjects.DTOs.Question;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class QuestionService : IQuestionService
    {
        private readonly IQuizRepository _quizRepository;
        private readonly ILecturerRepository _lecturerRepository;
        private readonly IQuestionBankRepository _questionBankRepository;
        public QuestionService(IQuizRepository quizRepository, ILecturerRepository lecturerRepository , IQuestionBankRepository questionBankRepository)
        {
            _quizRepository = quizRepository;
            _lecturerRepository = lecturerRepository;   
            _questionBankRepository = questionBankRepository;
        }

        public async Task<bool> AddQuestionWithAnswersToQuizAsync(CreateQuestionDTO createQuestionDTO, Guid accId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accId);
            if (lecturer == null)
                throw new Exception("Không tìm thấy giảng viên tương ứng với tài khoản này.");
            var quiz = await _quizRepository.GetQuizByIdAsync(createQuestionDTO.QuizId);
            if (quiz == null)
                throw new Exception("Quiz không tồn tại");
            var sectionId = quiz.SectionId;
            var question = new QuestionBank
            {
                Id = Guid.NewGuid(),
                SectionId = sectionId,
                LecturerId = lecturer.Id,
                Title = createQuestionDTO.Title,
                Description = createQuestionDTO.Description,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                IsActive = true
            };
            foreach (var answerDto in createQuestionDTO.Answers)
            {
                var answer = new AnswerBank
                {
                    Id = Guid.NewGuid(),
                    QuestionBankId = question.Id,
                    AnswerName = answerDto.AnswerName,
                    IsCorrect = answerDto.IsCorrect,
                    IsActive = true
                };
                question.AnswerBanks.Add(answer);
            }
            await _questionBankRepository.CreateAsync(question);

     
            var questionQuiz = new QuestionQuiz
            {
                Id = Guid.NewGuid(),
                QuizId = quiz.Id,
                QuestionBankId = question.Id
            };
            quiz.QuestionQuizzes.Add(questionQuiz);

        
            var result = await _quizRepository.SaveChangesAsync();

        
            return result;
        }
    }
}
