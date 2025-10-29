using CloudinaryDotNet;
using SkillUp.BussinessObjects.DTOs.Course;
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
        public CourseService(ICourseRepository courseRepository, ILecturerRepository lecturerRepository , CloudinaryService cloudinaryService , IAccountRepository accountRepository)
        {
            _courseRepository = courseRepository;
            _lecturerRepository = lecturerRepository;
            _cloudinaryService = cloudinaryService;
            _accountRepository = accountRepository;
        }
        public async Task<CourseResponseDto?> CreateDraftCourseAsync(CreateUpdateCourseDto request , Guid accId)
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
    }
}
