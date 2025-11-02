using SkillUp.BussinessObjects.DTOs.Lesson;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class LessonService : ILessonService
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly ISectionRepository _sectionRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly ILecturerRepository _lecturerRepository;
        private readonly FtpVideoUploadService _ftpVideoUploadService;

        public LessonService(
            ILessonRepository lessonRepository,
            ISectionRepository sectionRepository,
            ICourseRepository courseRepository,
            ILecturerRepository lecturerRepository,
            FtpVideoUploadService ftpVideoUploadService)
        {
            _lessonRepository = lessonRepository;
            _sectionRepository = sectionRepository;
            _courseRepository = courseRepository;
            _lecturerRepository = lecturerRepository;
            _ftpVideoUploadService = ftpVideoUploadService;
        }

        public async Task<IEnumerable<LessonResponseDto>> GetAllLessonsAsync()
        {
            var lessons = await _lessonRepository.GetAllLessonsAsync();
            return lessons.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<LessonResponseDto>> GetActiveLessonsAsync()
        {
            var lessons = await _lessonRepository.GetActiveLessonsAsync();
            return lessons.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<LessonResponseDto>> GetLessonsBySectionIdAsync(Guid sectionId)
        {
            var section = await _sectionRepository.GetSectionByIdAsync(sectionId);
            if (section == null)
            {
                throw new Exception("Không tìm thấy section!");
            }

            var lessons = await _lessonRepository.GetLessonsBySectionIdAsync(sectionId);
            return lessons.Select(MapToResponseDto);
        }

        public async Task<LessonResponseDto?> GetLessonByIdAsync(Guid id)
        {
            var lesson = await _lessonRepository.GetLessonWithDetailsAsync(id);
            if (lesson == null)
                return null;

            return MapToResponseDto(lesson);
        }

        public async Task<LessonResponseDto> CreateLessonAsync(CreateLessonDto dto, Guid accountId)
        {
            // 1. Kiểm tra section tồn tại
            var section = await _sectionRepository.GetSectionByIdAsync(dto.SectionId);
            if (section == null)
            {
                throw new Exception("Không tìm thấy section!");
            }

            // 2. Kiểm tra quyền: giảng viên phải sở hữu course
            var course = await _courseRepository.GetCourseByIdAsync(section.CourseId);
            if (course == null)
            {
                throw new Exception("Không tìm thấy khóa học!");
            }

            var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);
            if (lecturer == null || course.LecturerId != lecturer.Id)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền tạo bài học cho khóa học này!");
            }

            // 3. Tạo Lesson
            var lesson = new Lesson
            {
                Id = Guid.NewGuid(),
                SectionId = dto.SectionId,
                Title = dto.Title,
                Type = dto.Type,
                Description = dto.Description,
                LessonOrder = dto.LessonOrder,
                IsFree = dto.IsFree,
                IsActive = true,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            await _lessonRepository.AddLessonAsync(lesson);

            // 4. Tạo Asset dựa trên Type
            var asset = new Asset
            {
                Id = Guid.NewGuid(),
                LessonId = lesson.Id,
                IsActive = true
            };

            if (dto.Type == "Video")
            {
                if (dto.VideoFile == null)
                {
                    throw new Exception("Video file là bắt buộc cho bài học loại Video!");
                }

                // Upload video lên VPS qua FTP
                var videoUrl = await _ftpVideoUploadService.UploadVideoAsync(dto.VideoFile, "lessons");
                asset.Url = videoUrl;
                asset.FileUrl = videoUrl;
            }
            else if (dto.Type == "Text")
            {
                if (string.IsNullOrEmpty(dto.Content))
                {
                    throw new Exception("Content là bắt buộc cho bài học loại Text!");
                }

                // Lưu content vào database
                asset.Contents = dto.Content;
            }

            lesson.Assets.Add(asset);

            var saved = await _lessonRepository.SaveChangesAsync();
            if (!saved)
            {
                throw new Exception("Không thể lưu bài học!");
            }

            // 5. Lấy lại lesson với đầy đủ thông tin
            var createdLesson = await _lessonRepository.GetLessonWithDetailsAsync(lesson.Id);
            return MapToResponseDto(createdLesson!);
        }

        public async Task<LessonResponseDto> UpdateLessonAsync(Guid id, UpdateLessonDto dto, Guid accountId)
        {
            // 1. Lấy lesson
            var lesson = await _lessonRepository.GetLessonWithDetailsAsync(id);
            if (lesson == null)
            {
                throw new Exception("Không tìm thấy bài học!");
            }

            // 2. Kiểm tra quyền
            var section = await _sectionRepository.GetSectionByIdAsync(lesson.SectionId);
            var course = await _courseRepository.GetCourseByIdAsync(section!.CourseId);
            var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);

            if (lecturer == null || course!.LecturerId != lecturer.Id)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa bài học này!");
            }

            // 3. Update lesson info
            lesson.Title = dto.Title;
            lesson.Description = dto.Description;
            lesson.LessonOrder = dto.LessonOrder;
            lesson.IsFree = dto.IsFree;
            lesson.UpdatedAt = DateTime.Now;

            // 4. Update asset
            var asset = lesson.Assets.FirstOrDefault();
            if (asset != null)
            {
                if (lesson.Type == "Video" && dto.VideoFile != null)
                {
                    // Xóa video cũ trên VPS nếu có
                    if (!string.IsNullOrEmpty(asset.Url))
                    {
                        await _ftpVideoUploadService.DeleteVideoAsync(asset.Url);
                    }

                    // Upload video mới lên VPS qua FTP
                    var videoUrl = await _ftpVideoUploadService.UploadVideoAsync(dto.VideoFile, "lessons");
                    asset.Url = videoUrl;
                    asset.FileUrl = videoUrl;
                }
                else if (lesson.Type == "Text" && !string.IsNullOrEmpty(dto.Content))
                {
                    // Cập nhật content
                    asset.Contents = dto.Content;
                }
            }

            _lessonRepository.UpdateLesson(lesson);
            var saved = await _lessonRepository.SaveChangesAsync();

            if (!saved)
            {
                throw new Exception("Không thể cập nhật bài học!");
            }

            var updatedLesson = await _lessonRepository.GetLessonWithDetailsAsync(id);
            return MapToResponseDto(updatedLesson!);
        }

        public async Task<bool> DeleteLessonAsync(Guid id, Guid accountId)
        {
            // 1. Lấy lesson
            var lesson = await _lessonRepository.GetLessonByIdAsync(id);
            if (lesson == null)
            {
                throw new Exception("Không tìm thấy bài học!");
            }

            // 2. Kiểm tra quyền
            var section = await _sectionRepository.GetSectionByIdAsync(lesson.SectionId);
            var course = await _courseRepository.GetCourseByIdAsync(section!.CourseId);
            var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);

            if (lecturer == null || course!.LecturerId != lecturer.Id)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xóa bài học này!");
            }

            // 3. Soft delete
            return await _lessonRepository.DeleteLessonAsync(id);
        }

        // Helper method to map Lesson to DTO
        private LessonResponseDto MapToResponseDto(Lesson lesson)
        {
            var asset = lesson.Assets?.FirstOrDefault();

            return new LessonResponseDto
            {
                Id = lesson.Id,
                SectionId = lesson.SectionId,
                SectionTitle = lesson.Section?.Title ?? string.Empty,
                Title = lesson.Title,
                Type = lesson.Type ?? "Text",
                Description = lesson.Description,
                LessonOrder = lesson.LessonOrder,
                IsFree = lesson.IsFree ?? false,
                IsActive = lesson.IsActive,
                CreatedAt = lesson.CreatedAt,
                UpdatedAt = lesson.UpdatedAt,
                VideoUrl = lesson.Type == "Video" ? asset?.Url : null,
                TextContent = lesson.Type == "Text" ? asset?.Contents : null
            };
        }
    }
}
