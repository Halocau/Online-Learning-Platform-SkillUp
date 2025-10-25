using CloudinaryDotNet;
using SkillUp.BussinessObjects.DTOs.Course;
using SkillUp.BussinessObjects.Models;
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
        public CourseService(ICourseRepository courseRepository, ILecturerRepository lecturerRepository , CloudinaryService cloudinaryService )
        {
            _courseRepository = courseRepository;
            _lecturerRepository = lecturerRepository;
            _cloudinaryService = cloudinaryService;
        }
        public async Task<CourseResponseDto?> CreateDraftCourseAsync(CreateCourseDto request , Guid accId)
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
                IsActive = false,
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

    }
}
