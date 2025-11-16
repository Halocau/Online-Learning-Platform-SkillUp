using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using SkillUp.BussinessObjects.DTOs.Question;
using SkillUp.BussinessObjects.DTOs.QuestionBank;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class QuestionService : IQuestionService
    {
        private readonly IQuizRepository _quizRepository;
        private readonly ILecturerRepository _lecturerRepository;
        private readonly IQuestionBankRepository _questionBankRepository;
        private readonly CloudinaryService _cloudinaryService;
        private readonly IQuestionQuizRepository _questionQuizRepository;
        public QuestionService(IQuizRepository quizRepository, ILecturerRepository lecturerRepository, IQuestionBankRepository questionBankRepository, CloudinaryService cloudinaryService, IQuestionQuizRepository questionQuizRepository)
        {
            _quizRepository = quizRepository;
            _lecturerRepository = lecturerRepository;
            _questionBankRepository = questionBankRepository;
            _cloudinaryService = cloudinaryService;
            _questionQuizRepository = questionQuizRepository;
        }


        public async Task<QuestionResponseDto> AddQuestionWithAnswersToQuizAsync(CreateQuestionDTO createQuestionDTO, Guid accId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accId);
            if (lecturer == null)
            {
                throw new Exception("Không tìm thấy giảng viên tương ứng với tài khoản này.");
            }

            var quiz = await _quizRepository.GetQuizByIdAsync(createQuestionDTO.QuizId);
            if (quiz == null)
            {
                throw new Exception("Quiz không tồn tại");
            }

            if (string.IsNullOrWhiteSpace(createQuestionDTO.Type))
            {
                throw new Exception("Loại câu hỏi (Type) không được để trống.");
            }

            int correctAnswersCount = createQuestionDTO.Answers.Count(a => a.IsCorrect == true);

            if (createQuestionDTO.Type == "SingleChoice")
            {
                if (correctAnswersCount == 0)
                {
                    throw new Exception("Câu hỏi chọn 1 (SingleChoice) phải có 1 đáp án đúng.");
                }
                if (correctAnswersCount > 1)
                {
                    throw new Exception("Câu hỏi chọn 1 (SingleChoice) chỉ được có 1 đáp án đúng.");
                }
            }
            else if (createQuestionDTO.Type == "MultiChoice")
            {
                if (correctAnswersCount == 0)
                {
                    throw new Exception("Câu hỏi chọn nhiều (MultiChoice) phải có ít nhất 1 đáp án đúng.");
                }
            }
            else
            {
                throw new Exception($"Loại câu hỏi '{createQuestionDTO.Type}' không hợp lệ.");
            }

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
                IsActive = true,
                Image = createQuestionDTO.ImageUrl,
                IsHidden = false,
                Type = createQuestionDTO.Type
            };

            var newAnswersForDto = new List<AnswerBank>();
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
                newAnswersForDto.Add(answer);
            }

            await _questionBankRepository.CreateAsync(question);

            var questionQuiz = new QuestionQuiz
            {
                Id = Guid.NewGuid(),
                QuizId = quiz.Id,
                QuestionBankId = question.Id,
                Orders = createQuestionDTO.Orders,
                IsActive = true
            };

            quiz.QuestionQuizzes.Add(questionQuiz);

            var result = await _quizRepository.SaveChangesAsync();

            if (!result)
            {
                throw new Exception("Lỗi: Không thể lưu câu hỏi vào cơ sở dữ liệu.");
            }

            var responseDto = new QuestionResponseDto
            {
                Id = question.Id,
                Title = question.Title,
                Description = question.Description,
                Image = question.Image,
                Type = question.Type,
                Orders = (float?)questionQuiz.Orders,
                Answers = newAnswersForDto.Select(a => new AnswerResponseDto
                {
                    Id = a.Id,
                    AnswerName = a.AnswerName,
                    IsCorrect = a.IsCorrect
                }).ToList()
            };

            return responseDto;
        }

		public async Task<List<CreateQuestionQuizResponseDTO>> AddBulkQuestionFromBankToQuizAsync(
	List<CreateQuestionQuizDTO> createQuestionQuizDTOs, Guid accId)
		{
			var lecturer = await _lecturerRepository.GetByAccountIdAsync(accId);
			if (lecturer == null)
				throw new Exception("Không tìm thấy giảng viên tương ứng với tài khoản này.");

			var quiz = await _quizRepository.GetQuizByIdAsync(createQuestionQuizDTOs[0].QuizId);
			if (quiz == null)
				throw new Exception("Quiz không tồn tại");

			var result = new List<CreateQuestionQuizResponseDTO>();

			foreach (var dto in createQuestionQuizDTOs)
			{
				var questionBank = await _questionBankRepository.GetByIdAsync(dto.QuestionBankId);
				if (questionBank == null)
					throw new Exception($"Không tìm thấy câu hỏi ID: {dto.QuestionBankId}");

				int correctAnswersCount = questionBank.AnswerBanks.Count(a => a.IsCorrect == true);

				// Tạo và thêm câu hỏi
				var question = new QuestionQuiz
				{
					Id = Guid.NewGuid(),
					QuizId = quiz.Id,
					QuestionBankId = dto.QuestionBankId,
					Orders = dto.Orders,
                    IsActive = true
				};

                var existingLink = await _questionQuizRepository.GetLinkAsync(quiz.Id, dto.QuestionBankId);
                if (existingLink == null)
				    quiz.QuestionQuizzes.Add(question);
                if (existingLink != null && existingLink.IsActive != true)
                {
                    existingLink.IsActive = true;
                    existingLink.Orders = dto.Orders;
                    _questionQuizRepository.Update(existingLink);
				}

				result.Add(new CreateQuestionQuizResponseDTO
				{
					Id = question.Id,
					QuestionBankId = question.QuestionBankId,
					QuizId = question.QuizId,
					Title = questionBank.Title,
					Orders = question.Orders
				});
			}

			await _quizRepository.SaveChangesAsync();
			return result;
		}

		public async Task<bool> UpdateQuestionWithAnswersAsync(Guid questionId, UpdateQuestionDTO dto, Guid accId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accId);
            if (lecturer == null)
                throw new UnauthorizedAccessException("Không tìm thấy giảng viên tương ứng với tài khoản này.");

            var question = await _questionBankRepository.GetQuestionWithAnswersAsync(questionId);
            if (question == null)
                throw new Exception("Không tìm thấy câu hỏi.");

            if (question.LecturerId != lecturer.Id)
                throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa câu hỏi này.");

            // update question
            question.Title = dto.Title ?? question.Title;
            question.Description = dto.Description ?? question.Description;
            question.UpdatedAt = DateTime.Now;

            var answerIdsFromDto = dto.Answers
        .Where(a => a.AnswerId.HasValue)
        .Select(a => a.AnswerId.Value)
        .ToList();

            foreach (var answer in question.AnswerBanks)
            {
                if (!answerIdsFromDto.Contains(answer.Id))
                {
                    answer.IsActive = false;
                }
            }
            // update answer 
            foreach (var answerDto in dto.Answers)
            {
                if (answerDto.AnswerId.HasValue)
                {
                    var existingAnswer = question.AnswerBanks.FirstOrDefault(a => a.Id == answerDto.AnswerId.Value);
                    if (existingAnswer != null)
                    {
                        existingAnswer.AnswerName = answerDto.AnswerName;
                        existingAnswer.IsCorrect = answerDto.IsCorrect;
                        existingAnswer.IsActive = true;
                    }
                }
                else
                {
                    var newAnswer = new AnswerBank
                    {
                        Id = Guid.NewGuid(),
                        QuestionBankId = question.Id,
                        AnswerName = answerDto.AnswerName,
                        IsCorrect = answerDto.IsCorrect,
                        IsActive = true
                    };
                    question.AnswerBanks.Add(newAnswer);
                }
            }



            _questionBankRepository.Update(question);
            return await _questionBankRepository.SaveChangesAsync();
        }

        public async Task<QuestionResponseDto> UpdateQuestionInQuizAsync(Guid oldQuestionId,UpdateQuestionDTO dto,Guid accId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accId);
            if (lecturer == null)
                throw new Exception("Không tìm thấy giảng viên.");

            var oldQuestion = await _questionBankRepository.GetQuestionWithAnswersAsync(oldQuestionId);
            if (oldQuestion == null)
                throw new Exception("Không tìm thấy câu hỏi gốc.");

            if (oldQuestion.LecturerId != lecturer.Id)
                throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa câu hỏi này.");

            var link = await _questionQuizRepository.GetLinkAsync(dto.QuizId, oldQuestionId);
            if (link == null)
                throw new Exception("Không tìm thấy câu hỏi này trong quiz hiện tại.");

            int correctAnswersCount = dto.Answers.Count(a => a.IsCorrect == true);
            if (dto.Type == "SingleChoice" && correctAnswersCount != 1)
                throw new Exception("Câu hỏi chọn 1 (SingleChoice) phải có đúng 1 đáp án đúng.");
            if (dto.Type == "MultiChoice" && correctAnswersCount == 0)
                throw new Exception("Câu hỏi chọn nhiều (MultiChoice) phải có ít nhất 1 đáp án đúng.");

            // --- 3. TẠO CÂU HỎI MỚI (BẢN SAO) ---
            var newQuestion = new QuestionBank
            {
                Id = Guid.NewGuid(),
                SectionId = oldQuestion.SectionId,
                LecturerId = lecturer.Id,
                Title = dto.Title,
                Description = dto.Description,
                Type = dto.Type,
                Image = dto.ImageUrl ?? oldQuestion.Image,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                IsActive = true,
                IsHidden = false
            };

            var newAnswersForDto = new List<AnswerBank>();
            foreach (var answerDto in dto.Answers)
            {
                var newAnswer = new AnswerBank
                {
                    Id = Guid.NewGuid(),
                    QuestionBankId = newQuestion.Id,
                    AnswerName = answerDto.AnswerName,
                    IsCorrect = answerDto.IsCorrect,
                    IsActive = true
                };
                newQuestion.AnswerBanks.Add(newAnswer);
                newAnswersForDto.Add(newAnswer);
            }
            oldQuestion.IsHidden = true;
            _questionBankRepository.Update(oldQuestion);

            await _questionBankRepository.CreateAsync(newQuestion);

            link.QuestionBankId = newQuestion.Id;
            _questionQuizRepository.Update(link);

            if (!await _questionBankRepository.SaveChangesAsync())
            {
                throw new Exception("Lỗi: Không thể cập nhật câu hỏi.");
            }

            return new QuestionResponseDto
            {
                Id = newQuestion.Id,
                Title = newQuestion.Title,
                Description = newQuestion.Description,
                Image = newQuestion.Image,
                Type = newQuestion.Type,
                Orders = link.Orders,
                Answers = newAnswersForDto.Select(a => new AnswerResponseDto
                {
                    Id = a.Id,
                    AnswerName = a.AnswerName,
                    IsCorrect = a.IsCorrect
                }).ToList()
            };
        }
        public async Task<bool> RemoveQuestionFromQuizAsync(Guid quizId, Guid questionId, Guid accId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accId);
            if (lecturer == null)
                throw new Exception("Không tìm thấy giảng viên.");
            var quiz = await _quizRepository.GetQuizWithSectionAndCourseAsync(quizId);
            if (quiz == null)
                throw new Exception("Không tìm thấy quiz.");

            if (quiz.Section.Course.LecturerId != lecturer.Id)
                throw new UnauthorizedAccessException("Bạn không có quyền xóa câu hỏi khỏi quiz này.");

            var link = await _questionQuizRepository.GetLinkAsync(quizId, questionId);
            if (link == null)
                throw new Exception("Không tìm thấy câu hỏi này trong quiz.");

            link.IsActive = false;
            _questionQuizRepository.Update(link);

            return await _questionBankRepository.SaveChangesAsync();
        }
    }
}
