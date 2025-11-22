using CloudinaryDotNet;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Identity.Client;
using SkillUp.BussinessObjects.DTOs.Asset;
using SkillUp.BussinessObjects.DTOs.Course;
using SkillUp.BussinessObjects.DTOs.CourseByCategoryPage;
using SkillUp.BussinessObjects.DTOs.Lecturer;
using SkillUp.BussinessObjects.DTOs.Lesson;
using SkillUp.BussinessObjects.DTOs.Quiz;
using SkillUp.BussinessObjects.DTOs.Section;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
	public class CourseService : ICourseService
	{
		private readonly ICourseRepository _courseRepository;
		private readonly ILecturerRepository _lecturerRepository;
		private readonly CloudinaryService _cloudinaryService;
		private readonly IAccountRepository _accountRepository;
		private readonly ICategoryRepository _categoryRepository;
		private readonly IEmailService _emailService;
		private readonly INotifyService _notifyService;
		public CourseService(ICourseRepository courseRepository, ILecturerRepository lecturerRepository, CloudinaryService cloudinaryService, IAccountRepository accountRepository, ICategoryRepository categoryRepository, IEmailService emailService, INotifyService notifyService)
		{
			_courseRepository = courseRepository;
			_lecturerRepository = lecturerRepository;
			_cloudinaryService = cloudinaryService;
			_accountRepository = accountRepository;
			_categoryRepository = categoryRepository;
			_emailService = emailService;
			_notifyService = notifyService;
		}

		public async Task<CourseResponseDto?> CreateDraftCourseAsync(CreateUpdateCourseDto request, Guid accId)
		{
			var imageUrl = await _cloudinaryService.UploadImageAsync(request.Image, "skillup/courses");
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accId);
			if (lecturer == null)
			{
				throw new Exception("Không tìm thấy giảng viên cho tài khoản này!");
			}

			var course = new Course
			{
				Id = Guid.NewGuid(),
				Title = request.Title,
				Description = request.Description,
				Image = imageUrl,
				SubCategoryId = request.SubCategoryId,
				LecturerId = lecturer.Id,
				Price = 0,
				EnrollmentCount = 0,
				Rating = 0,
				Status = "Draft",
				IsActive = true,
				CreatedAt = DateTime.Now,
				UpdatedAt = DateTime.Now
			};


			await _courseRepository.AddCourseAsync(course);
			var saved = await _courseRepository.SaveChangesAsync();
			if (!saved) return null;


			return new CourseResponseDto
			{
				Id = course.Id,
				Title = course.Title,
				Description = course.Description,
				Image = course.Image,
				Status = course.Status,
				LecturerId = lecturer.Id
			};
		}
		//giảng viên xóa khóa học
		public async Task<bool> DeleteCourseAsync(Guid courseId, Guid accountId)
		{

			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			if (lecturer == null)
			{
				throw new Exception("Không tìm thấy giảng viên cho tài khoản này!");
			}


			var course = await _courseRepository.GetCourseByIdAsync(courseId);
			if (course == null)
			{
				throw new Exception("Không tìm thấy khoá học!");
			}


			if (course.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không có quyền xóa khoá học này!");
			}

			course.Status = "Unpublish";
			course.UpdatedAt = DateTime.Now;

			_courseRepository.UpdateCourse(course);
			return await _courseRepository.SaveChangesAsync();
		}



		public async Task<CourseResponseDto?> UpdateCourseAsync(CreateUpdateCourseDto request, Guid courseId, Guid accountId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			if (lecturer == null)
			{
				throw new Exception("Không tìm thấy giảng viên cho tài khoản này!");
			}
			var course = await _courseRepository.GetCourseByIdAsync(courseId);
			if (course == null)
			{
				throw new Exception("Không tìm thấy khoá học!");
			}
			if (course.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa khoá học này!");
			}
			string? newImageUrl = course.Image;
			if (request.Image != null)
			{
				newImageUrl = await _cloudinaryService.UploadImageAsync(request.Image, "skillup/courses");
			}
			course.Title = request.Title;
			course.Description = request.Description;
			course.SubCategoryId = request.SubCategoryId;
			course.Image = newImageUrl;
			course.UpdatedAt = DateTime.Now;
			_courseRepository.UpdateCourse(course);
			var saved = await _courseRepository.SaveChangesAsync();
			if (!saved) return null;

			return new CourseResponseDto
			{
				Id = course.Id,
				Title = course.Title,
				Description = course.Description,
				Image = course.Image,
				Status = course.Status,
				LecturerId = lecturer.Id
			};
		}
		public async Task<bool> ToggleBanCourseAsync(Guid courseId, Guid adminAccountId)
		{

			var adminAccount = await _accountRepository.GetByIdAsync(adminAccountId);
			if (adminAccount == null)
			{
				throw new Exception("Không tìm thấy tài khoản quản trị viên!");
			}

			var isAdminOrMod = adminAccount.RoleId == 3;

			if (!isAdminOrMod)
			{
				throw new UnauthorizedAccessException("Bạn không có quyền thực hiện chức năng này!");
			}

			var course = await _courseRepository.GetCourseByIdAsync(courseId);
			if (course == null)
			{
				throw new Exception("Không tìm thấy khoá học!");
			}

			course.IsActive = !course.IsActive;
			course.UpdatedAt = DateTime.Now;

			_courseRepository.UpdateCourse(course);
			var saved = await _courseRepository.SaveChangesAsync();

			if (!saved)
			{
				throw new Exception("Lưu thay đổi thất bại.");
			}

			return course.IsActive;
		}

        public async Task<List<CourseSummaryDTO>> GetListCourseBySubCateId(int id)
        {
            var courses = await _courseRepository.GetCoursesBySubCategoryId(id);
            if (courses == null || !courses.Any())
            {
                throw new Exception("Không tìm thấy khóa học nào");
            }
            return courses.Select(course => new CourseSummaryDTO
            {
                Id = course.Id,
                Title = course.Title,
                Image = course.Image,
                Price = course.Price,
                Rating = course.Rating,
                EnrollmentCount = course.EnrollmentCount,
                LecturerName = course.Lecturer?.Account.Fullname ?? string.Empty
            }).ToList();
        }
        public async Task<List<CourseSummaryDTO>> GetListCourseByCateId(int id)
        {
            var courses = await _courseRepository.GetCoursesByCategoryId(id);
            if (courses == null || !courses.Any())
            {
                throw new Exception("Không tìm thấy khóa học nào");
            }
            return courses.Select(course => new CourseSummaryDTO
            {
                Id = course.Id,
                Title = course.Title,
                Image = course.Image,
                Price = course.Price,
                Rating = course.Rating,
                EnrollmentCount = course.EnrollmentCount,
                LecturerName = course.Lecturer?.Account.Fullname ?? string.Empty
            }).ToList();
        }

        public async Task<List<CourseSummaryDTO>> SearchCoursesAsync(string keyword, int limit)
        {
            var courses = await _courseRepository.SearchCoursesAsync(keyword, limit);
            return courses ?? new List<CourseSummaryDTO>();
        }
        // Check Authorization for Roles
        private async Task<bool> IsAuthorizedAsync(Guid accountId, int requiredRoleId)
        {
            var account = await _accountRepository.GetByIdAsync(accountId);
            if (account == null)
            {
                throw new Exception("Không tìm thấy tài khoản!");
            }
            if (account.RoleId != requiredRoleId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền thực hiện chức năng này!");
            }
            return true;
        }

		public async Task<List<CourseMorderatorResponseDto>> GetAllCourseAsync(Guid accountId)
		{
			await IsAuthorizedAsync(accountId, 3);

			var courses = await _courseRepository.GetAllCourseAsync();
			return courses.Select(course => new CourseMorderatorResponseDto
			{
				Id = course.Id,
				Title = course.Title,
				Description = course.Description,
				Price = course.Price,
				EnrollmentCount = course.EnrollmentCount,
				Rating = course.Rating,
				Status = course.Status,
				IsActive = course.IsActive,
				SubCategoryName = course.SubCategory.Name,
				LecturerName = course.Lecturer.Account.Fullname
			}).ToList();
		}

		public async Task<List<CourseLecturerResponseDto>> GetCoursesOfLecturerByAccountId(Guid accountId)
		{
			var courses = await _courseRepository.GetCoursesOfLecturerByAccountIdAsync(accountId);
			if (courses == null || courses.Count == 0)
				return new List<CourseLecturerResponseDto>();

			return courses.Select(course => new CourseLecturerResponseDto
			{
				Id = course.Id,
				Title = course.Title,
				Description = course.Description,
				Image = course.Image,
				Price = course.Price,
				EnrollmentCount = course.EnrollmentCount,
				Rating = course.Rating,
				Status = course.Status,
				IsActive = course.IsActive,
				SubCategoryName = course.SubCategory?.Name ?? "Không có danh mục",
				CategoryName = course.SubCategory?.Category?.Name ?? "Không có danh mục cha",
				CreatedAt = course.CreatedAt,
				UpdatedAt = course.UpdatedAt,
			}).ToList();
		}

		public async Task<CourseDetailDto?> GetCourseDetailsAsync(Guid courseId)
		{
			var course = await _courseRepository.GetCourseWithDetailsAsync(courseId);
			if (course == null) return null;

			var detail = new CourseDetailDto
			{
				Id = course.Id,
				Title = course.Title,
				Description = course.Description,
				Price = course.Price,
				Image = course.Image,
				EnrollmentCount = course.EnrollmentCount,
				Rating = (double)(course.Rating ?? 0),
				Status = course.Status,
				IsActive = course.IsActive,
				CreatedAt = course.CreatedAt,
				UpdatedAt = course.UpdatedAt,
				categoryId = course.SubCategory?.CategoryId ?? 0,
				subCategoryId = course.SubCategoryId,
				CategoryName = course.SubCategory?.Category?.Name ?? "",
				SubCategoryName = course.SubCategory?.Name ?? "",
				Lecturer = course.Lecturer != null ? new LecturerCourseDetailDto
				{
					FullName = course.Lecturer.Account?.Fullname ?? "",
					Avartar = course.Lecturer.Account?.Avatar ?? "default-avatar.png",
					Title = course.Lecturer.Title ?? "",
					Profession = course.Lecturer.Profession ?? ""
				} : null
			};

            detail.Sections = course.Sections.Where(l => l.IsActive).Select(section =>
            {
                // Map Lesson -> SectionItemDto (CÓ Assets)
                // Only include active lessons and their active assets
                var lessonItems = section.Lessons
                    .Where(l => l.IsActive)
                    .Select(l => new SectionItemDto
                    {
                        Kind = "Lesson",
                        Id = l.Id,
                        Orders = (double)l.Orders,
                        Title = l.Title,
                        Description = l.Description,
                        LessonType = l.Type,                 // "Video" | "Text"
                        IsFree = l.IsFree ?? false,
                        Assets = l.Assets?
                            .Where(a => a.IsActive)
                            .Select(a => new AssetCourseDetailDto
                            {
                                Url = a.Url ?? "default-url",
                                Content = a.Contents ?? "No content",
                                FileUrl = a.FileUrl ?? "default-file-url"
                            })
                            .ToList() ?? new List<AssetCourseDetailDto>(),
                        CreatedAt = l.CreatedAt,
                        UpdatedAt = l.UpdatedAt
                    });

				// Map Quiz -> SectionItemDto (KHÔNG có Assets)
				// Only include active quizzes
				var quizItems = section.Quizzes
					.Where(q => q.IsActive)
					.Select(q => new SectionItemDto
					{
						Kind = "Quiz",
						Id = q.Id,
						Orders = (double)q.Orders,
						Title = q.Title,
						Description = q.Description,
						PassPercent = q.PassPercent,
						Timer = q.Timer,
						CreatedAt = q.CreatedAt,
						UpdatedAt = q.UpdatedAt
					});

				// Gộp & sort tăng dần theo Orders
				var items = lessonItems
					.Concat(quizItems)
					.OrderBy(i => i.Orders)
					.ThenBy(i => i.Kind) // tie-break nếu Orders trùng
					.ToList();

				return new SectionCourseDetailDto
				{
					Id = section.Id,
					Orders = (double)section.Orders,
					Title = section.Title,
					Description = section.Description,
					CreatedAt = section.CreatedAt,
					UpdatedAt = section.UpdatedAt,
					Items = items
				};
			}).OrderBy(i => i.Orders)
			  .ToList();

			return detail;
		}
		public async Task<CategoryPageDto> GetCategoryPageAsync(int categoryId)
		{

			var navData = await _categoryRepository.GetByIdWithSubCategoriesAsync(categoryId);

			if (navData == null)
				throw new Exception("Không tìm thấy danh mục");

			var courses = await _courseRepository.GetCoursesByCategoryId(categoryId);
			var pageDto = new CategoryPageDto
			{
				MainCategory = new CategorySimpleDto { Id = navData.Id, Name = navData.Name },
				SubCategories = navData.SubCategories.Select(s => new CategorySimpleDto
				{ Id = s.Id, Name = s.Name }).ToList(),

				Courses = courses.Select(course => new CourseSummaryDTO
				{
					Id = course.Id,
					Title = course.Title,
					Image = course.Image,
					Price = course.Price,
					Rating = course.Rating,
					EnrollmentCount = course.EnrollmentCount,
					LecturerName = course.Lecturer?.Account.Fullname ?? string.Empty,
					SubCategoryId = course.SubCategoryId
				}).ToList()
			};

			return pageDto;
		}
		public async Task<bool> SetCoursePriceAsync(Guid courseId, CoursePriceDto request, Guid accountId)
		{

			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			if (lecturer == null)
			{
				throw new Exception("Không tìm thấy giảng viên cho tài khoản này!");
			}

			var course = await _courseRepository.GetCourseByIdAsync(courseId);
			if (course == null)
			{
				throw new Exception("Không tìm thấy khoá học!");
			}

			if (course.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không có quyền đặt giá cho khoá học này!");
			}

			course.Price = request.Price;
			course.OriginalPrice = request.Price;
			course.UpdatedAt = DateTime.Now;
			_courseRepository.UpdateCourse(course);
			return await _courseRepository.SaveChangesAsync();
		}
		public async Task<bool> PublishCourseForReviewAsync(Guid courseId, Guid accountId)
		{
			var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
			if (lecturer == null)
			{
				throw new Exception("Không tìm thấy giảng viên cho tài khoản này!");
			}

			var course = await _courseRepository.GetCourseWithDetailsAsync(courseId);
			if (course == null)
			{
				throw new Exception("Không tìm thấy khoá học!");
			}


			if (course.LecturerId != lecturer.Id)
			{
				throw new UnauthorizedAccessException("Bạn không có quyền xuất bản khoá học này!");
			}
			if (course.Status == "Pending")
			{
				throw new Exception("Khóa học này đang chờ được duyệt.");
			}
			if (course.Status == "Public")
			{
				throw new Exception("Khóa học này đã được xuất bản.");
			}

			if (string.IsNullOrWhiteSpace(course.Title) ||
				string.IsNullOrWhiteSpace(course.Description) ||
				course.SubCategoryId <= 0)
			{
				throw new Exception("Vui lòng hoàn thành thông tin cơ bản (tiêu đề, mô tả, danh mục) trước khi xuất bản.");
			}

			if (course.OriginalPrice == null)
			{
				throw new Exception("Vui lòng đặt giá cho khóa học trước khi xuất bản.");
			}

			if (!course.Sections.Any(s => s.IsActive))
			{
				throw new Exception("Khóa học phải có ít nhất một chương (section) đang hoạt động.");
			}
			bool hasContent = course.Sections
				.Where(s => s.IsActive)
				.Any(s => s.Lessons.Any(l => l.IsActive) || s.Quizzes.Any(q => q.IsActive));

			if (!hasContent)
			{
				throw new Exception("Khóa học phải có ít nhất một bài học (lesson) hoặc bài kiểm tra (quiz) đang hoạt động.");
			}
			course.Status = "Pending";
			course.UpdatedAt = DateTime.Now;

			_courseRepository.UpdateCourse(course);
			return await _courseRepository.SaveChangesAsync();
		}

		public async Task<bool> PublishCourseForModerator(Guid courseId, Guid accountId, bool decision, string reason)
		{
			var account = await _accountRepository.GetByIdAsync(accountId);
			if (account.RoleId != 3)
				throw new UnauthorizedAccessException("Bạn không có quyền thực hiện chức năng này!");
			var course = await _courseRepository.GetCourseByIdAsync(courseId);
			if (course == null)
			{
				throw new Exception("Không tìm thấy khoá học!");
			}
			if (course.Status != "Pending")
			{
				throw new Exception("Chỉ có thể duyệt các khoá học đang ở trạng thái chờ duyệt.");
			}
			course.Status = decision ? "Public" : "Draft";
			course.UpdatedAt = DateTime.Now;
			var lecturerAccount = await _accountRepository.GetByIdAsync(course.Lecturer.AccountId);
			if (course.Status == "Public")
			{
				await _emailService.SendCoursePublishedEmailAsync(lecturerAccount.Email, lecturerAccount.Fullname ?? "N/A", course.Title, course.Id.ToString());
				await _notifyService.CreateNotificationAsync(lecturerAccount.Id, "Khóa học đã được duyệt", $"Khóa học '{course.Title}' của bạn đã được duyệt và xuất bản thành công.");

			}
			else
			{
				await _emailService.SendCourseRejectedEmailAsync(lecturerAccount.Email, lecturerAccount.Fullname ?? "N/A", course.Title, reason, course.Id.ToString());
				await _notifyService.CreateNotificationAsync(lecturerAccount.Id, "Khóa học bị từ chối", $"Khóa học '{course.Title}' của bạn đã bị từ chối duyệt. Lý do: {reason}");
			}
			_courseRepository.UpdateCourse(course);
			return await _courseRepository.SaveChangesAsync();
		}

		public async Task<List<CourseStudentEnrollDTO>> GetEnrolledCoursesByAccountIdAsync(Guid accountId)
		{
			var enrolledCourses = await _courseRepository.GetEnrolledCoursesByAccountIdAsync(accountId);
			return enrolledCourses;
		}

	}
}
