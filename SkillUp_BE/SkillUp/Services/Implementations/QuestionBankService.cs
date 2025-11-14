using CloudinaryDotNet;
using Microsoft.Identity.Client;
using OfficeOpenXml;
using OfficeOpenXml.Configuration;
using SkillUp.BussinessObjects.DTOs.Question;
using SkillUp.BussinessObjects.DTOs.QuestionBank;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System.ComponentModel;
using System.Text;

namespace SkillUp.Services.Implementations
{
	public class QuestionBankService : IQuestionBankService
	{
		private readonly IQuestionBankRepository _questionBankRepository;
		private readonly ICurrentUserService _currentUserService;
		private readonly ILecturerRepository _lecturerRepository;
		private readonly ICourseRepository _courseRepository;
		public QuestionBankService(IQuestionBankRepository questionBankRepository, ICurrentUserService currentUserService, ILecturerRepository lecturerRepository, ICourseRepository courseRepository)
		{
			_questionBankRepository = questionBankRepository;
			_currentUserService = currentUserService;
			_lecturerRepository = lecturerRepository;
			_courseRepository = courseRepository;
		}
		public async Task<DetailQuestionBankDTO> CreateQuestionBankAsync(CreateQuestionBankDTO createQuestionBankDTO, Guid accountId, Guid courseId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			var course = await _courseRepository.GetCourseByIdAsync(courseId);

			if (lecturer == null || course!.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không phải là giảng viên của khoá học này");
			}
			QuestionBank questionBank = new QuestionBank
			{
				Id = Guid.NewGuid(),
				SectionId = createQuestionBankDTO.SectionId,
				LecturerId = lecturer.Id,
				Title = createQuestionBankDTO.Title,
				Description = createQuestionBankDTO.Description,
				CreatedAt = DateTime.Now,
				UpdatedAt = DateTime.Now,
				IsActive = true
			};
			foreach (var answerDto in createQuestionBankDTO.Answers)
			{
				var answer = new AnswerBank
				{
					Id = Guid.NewGuid(),
					QuestionBankId = questionBank.Id,
					AnswerName = answerDto.AnswerName,
					IsCorrect = answerDto.IsCorrect,
					IsActive = true
				};
				questionBank.AnswerBanks.Add(answer);
			}

			await _questionBankRepository.CreateAsync(questionBank);
			await _questionBankRepository.SaveChangesAsync();

			return new DetailQuestionBankDTO
			{
				Id = (Guid)questionBank.Id,
				SectionId = questionBank.SectionId,
				LecturerId = questionBank.LecturerId,
				Title = questionBank.Title,
				Description = questionBank.Description,
				CreatedAt = questionBank.CreatedAt,
				UpdatedAt = questionBank.UpdatedAt,
				IsActive = questionBank.IsActive,
				Answers = questionBank.AnswerBanks.Select(a => new AnswerBankDetailDTO
				{
					AnswerId = (Guid)a.Id,
					AnswerName = a.AnswerName,
					IsCorrect = a.IsCorrect,
				}).ToList()
			};
		}

		public async Task DeleteQuestionBank(Guid id, Guid accountId, Guid courseId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			var course = await _courseRepository.GetCourseByIdAsync(courseId);
			if (lecturer == null || course!.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không phải là giảng viên của khoá học này");
			}
			var questionBank = await _questionBankRepository.GetByIdAsync(id);
			if (questionBank == null)
			{
				throw new Exception("Không tìm thấy câu hỏi!");
			}
			questionBank.IsActive = false;
			_questionBankRepository.Update(questionBank);
			await _questionBankRepository.SaveChangesAsync();
		}

		public async Task<DetailQuestionBankDTO> GetQuestionBankByIdAsync(Guid id, Guid accountId, Guid courseId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			var course = await _courseRepository.GetCourseByIdAsync(courseId);
			if (lecturer == null || course!.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không phải là giảng viên của khoá học này");
			}
			var questionBank = await _questionBankRepository.GetByIdAsync(id);
			if (questionBank == null)
			{
				throw new Exception("Không tìm thấy câu hỏi!");
			}

			return new DetailQuestionBankDTO
			{
				Id = (Guid)questionBank.Id,
				SectionId = questionBank.SectionId,
				LecturerId = questionBank.LecturerId,
				Title = questionBank.Title,
				Description = questionBank.Description,
				CreatedAt = questionBank.CreatedAt,
				UpdatedAt = questionBank.UpdatedAt,
				IsActive = questionBank.IsActive,
				Answers = questionBank.AnswerBanks.Select(a => new AnswerBankDetailDTO
				{
					AnswerId = (Guid)a.Id,
					AnswerName = a.AnswerName,
					IsCorrect = a.IsCorrect,
					IsActive = a.IsActive
				}).ToList()
			};
		}

		public async Task<List<DetailQuestionBankDTO>> GetQuestionBanksBySectionIdAsync(Guid sectionId, Guid accountId, Guid courseId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			var course = await _courseRepository.GetCourseByIdAsync(courseId);
			if (lecturer == null || course!.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không phải là giảng viên của khoá học này");
			}
			var questionBanks = await _questionBankRepository.GetBySectionId(sectionId);
			var questionBankDTOs = questionBanks.Select(q => new DetailQuestionBankDTO
			{
				Id = (Guid)q.Id,
				SectionId = q.SectionId,
				LecturerId = q.LecturerId,
				Title = q.Title,
				Description = q.Description,
				CreatedAt = q.CreatedAt,
				UpdatedAt = q.UpdatedAt,
				IsActive = q.IsActive,
				Answers = q.AnswerBanks.Select(a => new AnswerBankDetailDTO
				{
					AnswerId = (Guid)a.Id,
					AnswerName = a.AnswerName,
					IsCorrect = a.IsCorrect,
					IsActive = a.IsActive,
				}).ToList()
			}).ToList();
			return questionBankDTOs;
		}

		public async Task<UpdateQuestionBankDTO> UpdateQuestionBank(UpdateQuestionBankDTO updateQuestionBankDTO, Guid questionBankId, Guid accountId, Guid courseId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			var course = await _courseRepository.GetCourseByIdAsync(courseId);
			if (lecturer == null || course!.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không phải là giảng viên của khoá học này");
			}
			var existingQuestion = await _questionBankRepository.GetByIdAsync(questionBankId);
			if (existingQuestion == null)
			{
				throw new Exception("Không tìm thấy câu hỏi!");
			}
			existingQuestion.SectionId = updateQuestionBankDTO.SectionId;
			existingQuestion.Title = updateQuestionBankDTO.Title;
			existingQuestion.UpdatedAt = DateTime.Now;
			foreach (var answerDTO in updateQuestionBankDTO.Answers)
			{
				var answer = existingQuestion.AnswerBanks.FirstOrDefault(existingQuestion => existingQuestion.Id == answerDTO.AnswerId);
				if (answer == null)
				{
					var newAnswer = new AnswerBank
					{
						Id = Guid.NewGuid(),
						AnswerName = answerDTO.AnswerName,
						IsCorrect = answerDTO.IsCorrect,
						IsActive = answerDTO.IsActive
					};
					existingQuestion.AnswerBanks.Add(newAnswer);
				}
				if (answer != null)
				{
					answer.AnswerName = answerDTO.AnswerName;
					answer.IsCorrect = answerDTO.IsCorrect;
					answer.IsActive = answerDTO.IsActive;
				}
			}

			_questionBankRepository.Update(existingQuestion);
			await _questionBankRepository.SaveChangesAsync();

			return new UpdateQuestionBankDTO
			{
				SectionId = existingQuestion.SectionId,
				Title = existingQuestion.Title,
				Answers = existingQuestion.AnswerBanks.Select(a => new UpdateAnswerBankDTO
				{
					AnswerId = (Guid)a.Id,
					AnswerName = a.AnswerName,
					IsCorrect = a.IsCorrect,
					IsActive = a.IsActive
				}).ToList()
			};
		}

		public async Task<List<CreateQuestionBankDTO>> ReadQuestionsWithMultipleAnswersAsync(
	Stream excelStream,
	Guid sectionId,
	Guid accountId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			if (lecturer == null)
				throw new Exception("Không tìm thấy giảng viên.");

			// EPPlus license context
			ExcelPackage.License.SetNonCommercialPersonal("Your Name");

			var result = new List<CreateQuestionBankDTO>();
			var questionBanks = new List<QuestionBank>();

			using var package = new ExcelPackage(excelStream);
			var worksheet = package.Workbook.Worksheets[0];
			int rowCount = worksheet.Dimension.Rows;

			for (int row = 3; row <= rowCount; row++)
			{
				string questionText = worksheet.Cells[row, 1].Text?.Trim();
				string optionA = worksheet.Cells[row, 2].Text?.Trim();
				string optionB = worksheet.Cells[row, 3].Text?.Trim();
				string optionC = worksheet.Cells[row, 4].Text?.Trim();
				string optionD = worksheet.Cells[row, 5].Text?.Trim();
				string optionE = worksheet.Cells[row, 6].Text?.Trim();
				string optionF = worksheet.Cells[row, 7].Text?.Trim();
				string optionG = worksheet.Cells[row, 8].Text?.Trim();
				string correctOptionsText = worksheet.Cells[row, 9].Text?.Trim(); // e.g., "A,C"

				if (string.IsNullOrEmpty(questionText) || string.IsNullOrEmpty(correctOptionsText))
					continue;

				var correctOptions = correctOptionsText
					.Split(',', StringSplitOptions.RemoveEmptyEntries)
					.Select(s => s.Trim().ToUpper())
					.ToHashSet();

				var questionBank = new QuestionBank
				{
					Id = Guid.NewGuid(),
					SectionId = sectionId,
					LecturerId = lecturer.Id,
					Title = questionText,
					Description = "description",
					CreatedAt = DateTime.UtcNow,
					UpdatedAt = DateTime.UtcNow,
					IsActive = true,
					Image = null,
					AnswerBanks = new List<AnswerBank>()
				};

				// Build answers
				var answers = new List<(string Text, string Label)>
		{
			(optionA, "A"),
			(optionB, "B"),
			(optionC, "C"),
			(optionD, "D"),
			(optionE, "E"),
			(optionF, "F"),
			(optionG, "G")
		};

				foreach (var (answerText, label) in answers)
				{
					if (string.IsNullOrEmpty(answerText))
						continue;

					var answer = new AnswerBank
					{
						Id = Guid.NewGuid(),
						QuestionBankId = questionBank.Id,
						AnswerName = answerText,
						IsCorrect = correctOptions.Contains(label),
						IsActive = true,
					};

					questionBank.AnswerBanks.Add(answer);
				}

				questionBanks.Add(questionBank);

				// Map DTO for response
				result.Add(new CreateQuestionBankDTO
				{
					SectionId = sectionId,
					LecturerId = lecturer.Id,
					Title = questionBank.Title,
					Description = questionBank.Description,
					Answers = questionBank.AnswerBanks.Select(a => new CreateAnswerDTO
					{
						AnswerName = a.AnswerName,
						IsCorrect = a.IsCorrect
					}).ToList()
				});
			}

			// Bulk save once
			await _questionBankRepository.AddRangeAsync(questionBanks);
			await _questionBankRepository.SaveChangesAsync();

			return result;
		}

	}
}
