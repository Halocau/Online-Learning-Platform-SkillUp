using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Dtos.Section;
using SkillUp.BussinessObjects.DTOs.Section;
using SkillUp.BussinessObjects.Models;
//using SkillUp.Data.Repositories;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Bussiness.Services
{
	public class SectionService : ISectionService
	{
		private readonly ISectionRepository _sectionRepository;
		private readonly ILessonRepository _lessonRepository;
		private readonly IQuizRepository _quizRepository;
		private readonly SkillUp1Context _context;

		public SectionService(ISectionRepository sectionRepository, ILessonRepository lessonRepository, IQuizRepository quizRepository, SkillUp1Context context)
		{
			_sectionRepository = sectionRepository;
			_lessonRepository = lessonRepository;
			_quizRepository = quizRepository;
			_context = context;
		}


		private SectionDto MapToDto(Section section)
		{
			return new SectionDto
			{
				Id = section.Id,
				CourseId = section.CourseId,
				Title = section.Title,
				Description = section.Description,
				CreatedAt = section.CreatedAt,
				IsActive = section.IsActive,
				Orders = section.Orders
			};
		}

		public async Task<SectionDto> CreateSectionAsync(SectionCreateDto createDto)
		{
			// (Code từ trước... không đổi)
			var section = new Section
			{
				Id = Guid.NewGuid(),
				CourseId = createDto.CourseId,
				Title = createDto.Title,
				Description = createDto.Description,
				CreatedAt = DateTime.Now,
				UpdatedAt = DateTime.Now,
				IsActive = true,
				Orders = createDto.Orders
			};
			var createdSection = await _sectionRepository.CreateAsync(section);
			return MapToDto(createdSection);
		}

		public async Task<SectionDto?> GetSectionByIdAsync(Guid id)
		{
			var section = await _sectionRepository.GetByIdAsync(id);
			if (section == null)
			{
				return null; // Controller sẽ trả về 404
			}
			return MapToDto(section);
		}

		public async Task<IEnumerable<SectionDto>> GetSectionsByCourseIdAsync(Guid courseId)
		{
			var sections = await _sectionRepository.GetByCourseIdAsync(courseId);
			return sections.Select(MapToDto); // Chuyển List<Section> thành List<SectionDto>
		}

		public async Task<SectionDto?> UpdateSectionAsync(Guid id, SectionUpdateDto updateDto)
		{
			// SỬA: Dùng FindByIdAsync để cho phép sửa section đã bị vô hiệu hóa
			var section = await _sectionRepository.FindByIdAsync(id);
			if (section == null)
			{
				return null;
			}

			section.Title = updateDto.Title;
			section.Description = updateDto.Description;
			section.UpdatedAt = DateTime.UtcNow;

			var updatedSection = await _sectionRepository.UpdateAsync(section);
			return MapToDto(updatedSection);
		}

		public async Task<bool> DeleteSectionAsync(Guid id)
		{
			// SỬA: Dùng FindByIdAsync để tìm (kể cả nó đang active hay inactive)
			var section = await _sectionRepository.FindByIdAsync(id);
			if (section == null)
			{
				return false; // Không tìm thấy section
			}
			// Nếu đã xóa rồi thì thôi
			if (section.IsActive == false)
			{
				return true; // Vẫn báo thành công
			}

			section.IsActive = false;
			section.UpdatedAt = DateTime.UtcNow;

			await _sectionRepository.UpdateAsync(section);
			return true;
		}
		public async Task<SectionDto?> RestoreSectionAsync(Guid id)
		{
			// Dùng FindByIdAsync để tìm section đã bị xóa
			var section = await _sectionRepository.FindByIdAsync(id);
			if (section == null)
			{
				return null; // Không tìm thấy
			}

			// Nếu đã khôi phục rồi thì thôi
			if (section.IsActive == true)
			{
				return MapToDto(section);
			}

			// Thực hiện khôi phục
			section.IsActive = true;
			section.UpdatedAt = DateTime.UtcNow;

			var updatedSection = await _sectionRepository.UpdateAsync(section);
			return MapToDto(updatedSection);
		}

		public async Task ReorderSectionContentAsync(Guid sectionId, List<ReorderItemDTO> updates)
		{
			// 1. Start Transaction
			// Even if using Repositories, explicit transactions are safer for multi-table updates
			using var transaction = _context.Database.BeginTransaction();

			try
			{
				// 2. Separate the inputs
				var lessonUpdates = updates.Where(u => u.Type == "Lesson").ToList();
				var quizUpdates = updates.Where(u => u.Type == "Quiz").ToList();

				// 3. Process Lessons
				if (lessonUpdates.Any())
				{
					var ids = lessonUpdates.Select(u => u.Id).ToList();
					// Call Repository
					var lessons = await _lessonRepository.GetLessonsByIdsAndSectionAsync(ids, sectionId);

					foreach (var update in lessonUpdates)
					{
						var lesson = lessons.FirstOrDefault(l => l.Id == update.Id);
						if (lesson != null)
						{
							lesson.Orders = update.Orders;
							// EF Core tracks this change automatically
						}
					}
				}

				// 4. Process Quizzes
				if (quizUpdates.Any())
				{
					var ids = quizUpdates.Select(u => u.Id).ToList();
					// Call Repository
					var quizzes = await _quizRepository.GetQuizzesByIdsAndSectionAsync(ids, sectionId);

					foreach (var update in quizUpdates)
					{
						var quiz = quizzes.FirstOrDefault(q => q.Id == update.Id);
						if (quiz != null)
						{
							quiz.Orders = update.Orders;
						}
					}
				}

				// 5. Commit Changes
				// If using UnitOfWork: await _unitOfWork.CompleteAsync();
				// If using direct Context (common with Repositories):
				await _context.SaveChangesAsync();
				await transaction.CommitAsync();
			}
			catch (Exception)
			{
				await transaction.RollbackAsync();
				throw; // Re-throw to let Controller handle the error response
			}
		}

		public async Task ReorderSectionsAsync(Guid courseId, List<ReorderSectionDTO> updates)
		{
			using var transaction = _context.Database.BeginTransaction();
			try
			{
				// 1. Extract IDs
				var ids = updates.Select(u => u.Id).ToList();

				// 2. Fetch Entities securely
				var sectionsDb = await _sectionRepository.GetSectionsByIdsAndCourseAsync(ids, courseId);

				// 3. Update Loop
				foreach (var update in updates)
				{
					var section = sectionsDb.FirstOrDefault(s => s.Id == update.Id);
					if (section != null)
					{
						// Update the integer. EF Core tracks this automatically.
						section.Orders = update.Orders;
					}
				}

				// 4. Save & Commit
				await _context.SaveChangesAsync();
				await transaction.CommitAsync();
			}
			catch (Exception)
			{
				await transaction.RollbackAsync();
				throw;
			}
		}
	}
}