using CloudinaryDotNet;
using Microsoft.Identity.Client;
using Newtonsoft.Json;
using OfficeOpenXml;
using OfficeOpenXml.Configuration;
using SkillUp.BussinessObjects.DTOs.Question;
using SkillUp.BussinessObjects.DTOs.QuestionBank;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
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
		private readonly CloudinaryService _cloudinaryService;
		private readonly ISectionRepository _sectionRepository;
		public QuestionBankService(IQuestionBankRepository questionBankRepository, ICurrentUserService currentUserService, ILecturerRepository lecturerRepository, ICourseRepository courseRepository, CloudinaryService cloudinaryService, ISectionRepository sectionRepository)
		{
			_questionBankRepository = questionBankRepository;
			_currentUserService = currentUserService;
			_lecturerRepository = lecturerRepository;
			_courseRepository = courseRepository;
			_cloudinaryService = cloudinaryService;
			_sectionRepository = sectionRepository;
		}
		public async Task<DetailQuestionBankDTO> CreateQuestionBankAsync(CreateQuestionBankDTO createQuestionBankDTO, Guid accountId, Guid courseId, string? imageUrl)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			var course = await _courseRepository.GetCourseByIdAsync(courseId);

			if (lecturer == null || course!.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không phải là giảng viên của khoá học này");
			}

			if (string.IsNullOrWhiteSpace(createQuestionBankDTO.Type))
			{
				throw new Exception("Loại câu hỏi (Type) không được để trống.");
			}

			int correctAnswersCount = createQuestionBankDTO.Answers.Count(a => a.IsCorrect == true);

			if (createQuestionBankDTO.Type == "SingleChoice")
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
			else if (createQuestionBankDTO.Type == "MultiChoice")
			{
				if (correctAnswersCount == 0)
				{
					throw new Exception("Câu hỏi chọn nhiều (MultiChoice) phải có ít nhất 1 đáp án đúng.");
				}
			}
			else
			{
				throw new Exception($"Loại câu hỏi '{createQuestionBankDTO.Type}' không hợp lệ.");
			}

			var answerList = createQuestionBankDTO.Answers;

			QuestionBank questionBank = new QuestionBank
			{
				Id = Guid.NewGuid(),
				SectionId = createQuestionBankDTO.SectionId,
				LecturerId = lecturer.Id,
				Title = createQuestionBankDTO.Title,
				Description = createQuestionBankDTO.Description,
				CreatedAt = DateTime.Now,
				UpdatedAt = DateTime.Now,
				Image = imageUrl,
				Type = createQuestionBankDTO.Type,
				IsHidden = false,
				IsActive = true
			};
			foreach (var answerDto in answerList)
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
				Image = questionBank.Image,
				Type = questionBank.Type,
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
				Image = questionBank.Image,
				Type = questionBank.Type,
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
				Image = q.Image,
				Type = q.Type,
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

		public async Task<List<SectionQuestionBankDTO>> GetQuestionBanksByCourseIdAsync(Guid accountId, Guid courseId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			var course = await _courseRepository.GetCourseByIdAsync(courseId);
			if (lecturer == null || course!.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không phải là giảng viên của khoá học này");
			}

			var sections = await _sectionRepository.GetByCourseIdAsync(courseId);
			var questionBanks = await _questionBankRepository.GetByCourseId(courseId);

			var sectionDTOs = sections.Select(s => new SectionQuestionBankDTO
			{
				Id = s.Id,
				CourseId = s.CourseId,
				Title = s.Title,
				Description = s.Description,
				CreatedAt = s.CreatedAt,
				UpdatedAt = s.UpdatedAt,
				IsActive = s.IsActive,
				Orders = s.Orders,
				QuestionBanks = questionBanks
					.Where(q => q.SectionId == s.Id)
					.Select(q => new DetailQuestionBankDTO
					{
						Id = (Guid)q.Id,
						SectionId = q.SectionId,
						LecturerId = q.LecturerId,
						Title = q.Title,
						Description = q.Description,
						CreatedAt = q.CreatedAt,
						UpdatedAt = q.UpdatedAt,
						IsActive = q.IsActive,
						Image = q.Image,
						Type = q.Type,
						Answers = q.AnswerBanks.Select(a => new AnswerBankDetailDTO
						{
							AnswerId = (Guid)a.Id,
							AnswerName = a.AnswerName,
							IsCorrect = a.IsCorrect,
							IsActive = a.IsActive,
						}).ToList()
					}).ToList()
			}).ToList();
			return sectionDTOs;
		}

		public async Task<UpdateQuestionBankDTO> UpdateQuestionBank(UpdateQuestionBankDTO updateQuestionBankDTO, Guid questionBankId, Guid accountId, Guid courseId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			var course = await _courseRepository.GetCourseByIdAsync(courseId);
			if (lecturer == null || course!.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không phải là giảng viên của khoá học này");
			}

			if (string.IsNullOrWhiteSpace(updateQuestionBankDTO.Type))
			{
				throw new Exception("Loại câu hỏi (Type) không được để trống.");
			}

			int correctAnswersCount = updateQuestionBankDTO.Answers.Count(a => a.IsCorrect == true);

			if (updateQuestionBankDTO.Type == "SingleChoice")
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
			else if (updateQuestionBankDTO.Type == "MultiChoice")
			{
				if (correctAnswersCount == 0)
				{
					throw new Exception("Câu hỏi chọn nhiều (MultiChoice) phải có ít nhất 1 đáp án đúng.");
				}
			}
			else
			{
				throw new Exception($"Loại câu hỏi '{updateQuestionBankDTO.Type}' không hợp lệ.");
			}

			var existingQuestion = await _questionBankRepository.GetByIdAsync(questionBankId);
			if (existingQuestion == null)
			{
				throw new Exception("Không tìm thấy câu hỏi!");
			}
			existingQuestion.SectionId = updateQuestionBankDTO.SectionId;
			existingQuestion.Title = updateQuestionBankDTO.Title;
			existingQuestion.Type = updateQuestionBankDTO.Type;
			existingQuestion.Image = updateQuestionBankDTO.Image;
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

		public async Task<List<CreateQuestionBankResponseDTO>> ReadQuestionsWithMultipleAnswersAsync(
	Stream excelStream,
	Guid sectionId,
	Guid accountId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			if (lecturer == null)
				throw new Exception("Không tìm thấy giảng viên.");

			// EPPlus license context
			ExcelPackage.License.SetNonCommercialPersonal("Your Name");

			var result = new List<CreateQuestionBankResponseDTO>();
			var questionBanks = new List<QuestionBank>();

			using var package = new ExcelPackage(excelStream);
			var worksheet = package.Workbook.Worksheets[0];
			int rowCount = worksheet.Dimension.Rows;

			for (int row = 3; row <= rowCount; row++)
			{
				string questionText = worksheet.Cells[row, 1].Text?.Trim();
				// Get answer options
				var answerCols = new Dictionary<string, string>
				{
					{ "A", worksheet.Cells[row, 2].Text?.Trim() },
					{ "B", worksheet.Cells[row, 3].Text?.Trim() },
					{ "C", worksheet.Cells[row, 4].Text?.Trim() },
					{ "D", worksheet.Cells[row, 5].Text?.Trim() },
					{ "E", worksheet.Cells[row, 6].Text?.Trim() },
					{ "F", worksheet.Cells[row, 7].Text?.Trim() },
					{ "G", worksheet.Cells[row, 8].Text?.Trim() }
				};
				string correctOptionsText = worksheet.Cells[row, 9].Text?.Trim(); // e.g., "A,C"

				if (string.IsNullOrEmpty(questionText) || string.IsNullOrEmpty(correctOptionsText))
					continue;

				var correctOptions = correctOptionsText
					.Split(',', StringSplitOptions.RemoveEmptyEntries)
					.Select(s => s.Trim().ToUpper())
					.ToHashSet();

				// Validate correct options
				foreach (var opt in correctOptions)
				{
					if (!answerCols.ContainsKey(opt))
						throw new Exception($"Row {row}: Đáp án đúng '{opt}' không hợp lệ (chỉ A-G).");
				}

				var questionBank = new QuestionBank
				{
					Id = Guid.NewGuid(),
					SectionId = sectionId,
					LecturerId = lecturer.Id,
					Title = questionText,
					Description = "description",
					CreatedAt = DateTime.Now,
					UpdatedAt = DateTime.Now,
					IsActive = true,
					IsHidden = false,
					Image = null,
					Type = (correctOptions.Count > 1 ? "MultiChoice" : "SingleChoice"),
					AnswerBanks = new List<AnswerBank>()
				};

				// Build answer list
				foreach (var kv in answerCols)
				{
					string key = kv.Key;
					string text = kv.Value;

					if (string.IsNullOrWhiteSpace(text))
						continue;

					questionBank.AnswerBanks.Add(new AnswerBank
					{
						Id = Guid.NewGuid(),
						QuestionBankId = questionBank.Id,
						AnswerName = text.Trim(),
						IsCorrect = correctOptions.Contains(key),
						IsActive = true
					});
				}

				questionBanks.Add(questionBank);

				// Map DTO for response
				result.Add(new CreateQuestionBankResponseDTO
				{
					SectionId = sectionId,
					LecturerId = lecturer.Id,
					Title = questionBank.Title,
					Description = questionBank.Description,
					Type = questionBank.Type,
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
