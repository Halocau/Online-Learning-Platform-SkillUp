using Microsoft.Identity.Client;
using SkillUp.BussinessObjects.DTOs.QuestionBank;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
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
		public async Task<CreateQuestionBankDTO> CreateQuestionBankAsync(CreateQuestionBankDTO createQuestionBankDTO, Guid accountId, Guid courseId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			var course =  await _courseRepository.GetCourseByIdAsync(courseId);

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
			await _questionBankRepository.CreateAsync(questionBank);
			await _questionBankRepository.SaveChangesAsync();

			return new CreateQuestionBankDTO
			{
				SectionId = questionBank.SectionId,
				LecturerId = questionBank.LecturerId,
				Title = questionBank.Title,
				Description = questionBank.Description,
				CreatedAt = questionBank.CreatedAt,
				UpdatedAt = questionBank.UpdatedAt
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

		public async Task<ViewQuestionBankDTO> GetQuestionBankByIdAsync(Guid id, Guid accountId, Guid courseId)
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

			return new ViewQuestionBankDTO
			{
				Id = (Guid)questionBank.Id,
				SectionId = questionBank.SectionId,
				LecturerId = questionBank.LecturerId,
				Title = questionBank.Title,
				Description = questionBank.Description,
				CreatedAt = questionBank.CreatedAt,
				UpdatedAt = questionBank.UpdatedAt,
				IsActive = questionBank.IsActive
			};
		}

		public async Task<List<ViewQuestionBankDTO>> GetQuestionBanksBySectionIdAsync(Guid sectionId, Guid accountId, Guid courseId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			var course = await _courseRepository.GetCourseByIdAsync(courseId);
			if (lecturer == null || course!.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không phải là giảng viên của khoá học này");
			}
			var questionBanks = await _questionBankRepository.GetBySectionId(sectionId);
			var questionBankDTOs = questionBanks.Select(q => new ViewQuestionBankDTO
			{
				Id = (Guid)q.Id,
				SectionId = q.SectionId,
				LecturerId = q.LecturerId,
				Title = q.Title,
				Description = q.Description,
				CreatedAt = q.CreatedAt,
				UpdatedAt = q.UpdatedAt,
				IsActive = q.IsActive
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
			existingQuestion.Description = updateQuestionBankDTO.Description;
			existingQuestion.UpdatedAt = DateTime.Now;

			_questionBankRepository.Update(existingQuestion);
			await _questionBankRepository.SaveChangesAsync();

			return new UpdateQuestionBankDTO
			{
				SectionId = existingQuestion.SectionId,
				Title = existingQuestion.Title,
				Description = existingQuestion.Description,
				UpdatedAt = existingQuestion.UpdatedAt
			};
		}
	}
}
