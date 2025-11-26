using SkillUp.BussinessObjects.DTOs.Asset;
using SkillUp.BussinessObjects.DTOs.Lesson;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;
using SkillUp.Services.Rag.Subtitle;
using System.ComponentModel.DataAnnotations;

namespace SkillUp.Services.Implementations
{
    public class LessonService : ILessonService
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly ISectionRepository _sectionRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly ILecturerRepository _lecturerRepository;
        private readonly FtpVideoUploadService _ftpVideoUploadService;
        private readonly CloudinaryService _cloudinaryService;
        private readonly IStudentRepository _studentRepository;
        private readonly IStudentProgressRepository _studentProgressRepository;
        private readonly QdrantService _qdrantService;
        private readonly IAiSupportBackgroundJobService _aiSupportBackgroundJobService;
        public LessonService(
            ILessonRepository lessonRepository,
            ISectionRepository sectionRepository,
            ICourseRepository courseRepository,
            ILecturerRepository lecturerRepository,
            FtpVideoUploadService ftpVideoUploadService,
            CloudinaryService cloudinaryService,
            IStudentRepository studentRepository,
            IStudentProgressRepository studentProgressRepository,
            QdrantService qdrantService,
            IAiSupportBackgroundJobService aiSupportBackgroundJobService)
        {
            _lessonRepository = lessonRepository;
            _sectionRepository = sectionRepository;
            _courseRepository = courseRepository;
            _lecturerRepository = lecturerRepository;
            _ftpVideoUploadService = ftpVideoUploadService;
            _cloudinaryService = cloudinaryService;
            _studentRepository = studentRepository;
            _studentProgressRepository = studentProgressRepository;
            _qdrantService = qdrantService;
            _aiSupportBackgroundJobService = aiSupportBackgroundJobService;
        }

        public async Task<IEnumerable<GetLessonResponseDto>> GetAllLessonsAsync()
        {
            var lessons = await _lessonRepository.GetAllLessonsAsync() ?? new List<Lesson>();
            return lessons.Select(
                lesson => new GetLessonResponseDto
                {
                    Id = lesson.Id,
                    Orders = (double)lesson.Orders,
                    Title = lesson.Title,
                    Type = lesson.Type,
                    Description = lesson.Description ?? string.Empty,
                    IsFree = lesson.IsFree ?? false,
                    IsActive = lesson.IsActive,
                    CreatedAt = lesson.CreatedAt,
                    UpdatedAt = lesson.UpdatedAt,
                    Assets = lesson.Assets?.Select(a => new AssetGetLessonResponseDto
                    {
                        Id = a.Id,
                        Url = a.Url,
                        Contents = a.Contents,
                        FileUrl = a.FileUrl,
                        IsActive = a.IsActive
                    }).ToList() ?? new List<AssetGetLessonResponseDto>()
                }
                );

        }

        public async Task<IEnumerable<GetLessonActiveResponseDto>> GetActiveLessonsAsync()
        {
            var lessons = await _lessonRepository.GetActiveLessonsAsync();
            return lessons.Select(
                lessons => new GetLessonActiveResponseDto
                {
                    Id = lessons.Id,
                    Orders = (double)lessons.Orders,
                    Title = lessons.Title,
                    Type = lessons.Type,
                    Description = lessons.Description ?? string.Empty,
                    IsFree = lessons.IsFree ?? false,
                    CreatedAt = lessons.CreatedAt,
                    UpdatedAt = lessons.UpdatedAt,
                    Assets = lessons.Assets?.Where(a => a.IsActive).Select(a => new AssetGetActiveLessonResponseDto
                    {
                        Id = a.Id,
                        Url = a.Url,
                        Contents = a.Contents,
                        FileUrl = a.FileUrl
                    }).ToList() ?? new List<AssetGetActiveLessonResponseDto>()
                }
                );
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
            ValidateCreate(dto);
            // 1. Kiểm tra section tồn tại
            var section = await _sectionRepository.GetSectionByIdAsync(dto.SectionId)
                ?? throw new Exception("Không tìm thấy section!");

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
                Orders = dto.LessonOrder,
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
            var videoCreated = false;

            if (dto.Type == "Video")
            {
                if (dto.VideoFile == null)
                {
                    throw new Exception("Video file là bắt buộc cho bài học loại Video!");
                }

                // Upload video lên VPS qua FTP
                var videoUrl = await _ftpVideoUploadService.UploadVideoAsync(dto.VideoFile, "lessons");
                asset.Url = videoUrl;
                asset.FileUrl = null; // Video không dùng FileUrl trong Asset
                videoCreated = true;
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

            // Upload tài liệu khóa học nếu có (dùng cho cả Video và Text)
            if (dto.FileUrl != null && dto.FileUrl.Length > 0)
            {
                var documentUrl = await _cloudinaryService.UploadDocumentAsync(dto.FileUrl, "skillup/lesson-documents");
                asset.FileUrl = documentUrl;
            }

            lesson.Assets.Add(asset);

            var saved = await _lessonRepository.SaveChangesAsync();
            if (!saved)
            {
                throw new Exception("Không thể lưu bài học!");
            }

            if (videoCreated && (course.IsAiSupport ?? false))
            {
                // Fire-and-forget subtitle generation
                await _aiSupportBackgroundJobService.TriggerLessonSubtitleJobAsync(lesson.Id, force: true);
            }

            // 5. Lấy lại lesson với đầy đủ thông tin
            var createdLesson = await _lessonRepository.GetLessonWithDetailsAsync(lesson.Id);
            return MapToResponseDto(createdLesson!);
        }

        private void ValidateCreate(CreateLessonDto dto)
        {
            var isVideo = dto.Type == "Video";
            var isText = dto.Type == "Text";

            if (!isVideo && !isText) throw new ValidationException("Type chỉ có thể là 'Text' hoặc 'Video'.");

            if (isVideo && (dto.VideoFile == null || dto.VideoFile.Length == 0))
                throw new ValidationException("VideoFile bắt buộc khi Type = 'Video'.");

            if (isText && string.IsNullOrEmpty(dto.Content))
                throw new ValidationException("Content bắt buộc khi Type = 'Text'.");
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
            var course = await _courseRepository.GetCourseByIdAsync(section!.CourseId);//ko dc null
            var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);

            if (lecturer == null || course!.LecturerId != lecturer.Id)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa bài học này!");
            }

            // 3. Update lesson info
            lesson.Title = dto.Title;
            lesson.Description = dto.Description;
            lesson.Orders = dto.LessonOrder;
            lesson.IsFree = dto.IsFree;
            lesson.UpdatedAt = DateTime.Now;

            // 4. Update asset
            var asset = lesson.Assets.FirstOrDefault();
            var videoChanged = false;
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
                    videoChanged = true;
                }
                else if (lesson.Type == "Text" && !string.IsNullOrEmpty(dto.Content))
                {
                    // Cập nhật content
                    asset.Contents = dto.Content;
                }

                // Upload tài liệu khóa học mới nếu có (dùng cho cả Video và Text)
                if (dto.FileUrl != null && dto.FileUrl.Length > 0)
                {
                    var documentUrl = await _cloudinaryService.UploadDocumentAsync(dto.FileUrl, "skillup/lesson-documents");
                    asset.FileUrl = documentUrl;
                }
            }

            _lessonRepository.UpdateLesson(lesson);
            var saved = await _lessonRepository.SaveChangesAsync();

            if (!saved)
            {
                throw new Exception("Không thể cập nhật bài học!");
            }

            if (videoChanged)
            {
                try
                {
                    await _qdrantService.DeleteVectorsByLessonAsync(lesson.Id);
                }
                catch
                {
                    // ignore cleanup failures to avoid blocking lesson update
                }

                if (course.IsAiSupport == true)
                {
                    await _aiSupportBackgroundJobService.TriggerLessonSubtitleJobAsync(lesson.Id, force: true);
                }
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
            if (lesson.IsActive == false)
            {
                throw new Exception("Bài học đã được xoá từ trước!");
            }
            // 2. Kiểm tra quyền
            var section = await _sectionRepository.GetSectionByIdAsync(lesson.SectionId);
            var course = await _courseRepository.GetCourseByIdAsync(section!.CourseId);
            var lecturer = await _lecturerRepository.GetLecturerByAccountIdAsync(accountId);

            if (lecturer == null || course!.LecturerId != lecturer.Id)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xóa bài học này!");
            }
            if (!lesson.IsActive) return true;
            lesson.IsActive = false;
            lesson.UpdatedAt = DateTime.Now;
            // 3. Soft delete
            if (lesson.Assets != null)
            {
                foreach (var a in lesson.Assets) a.IsActive = false;
            }

            _lessonRepository.UpdateLesson(lesson);
            return await _lessonRepository.SaveChangesAsync();
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
                Orders = (double)lesson.Orders,
                IsFree = lesson.IsFree ?? false,
                IsActive = lesson.IsActive,
                CreatedAt = lesson.CreatedAt,
                UpdatedAt = lesson.UpdatedAt,
                VideoUrl = lesson.Type == "Video" ? asset?.Url : null,
                TextContent = lesson.Type == "Text" ? asset?.Contents : null,
                FileUrl = asset?.FileUrl // Tài liệu khóa học
            };
        }

        public async Task<bool> MarkLessonAsCompletedAsync(Guid lessonId, Guid accountId)
        {
            var student = await _studentRepository.GetByAccountIdAsync(accountId);
            if (student == null) throw new Exception("Không tìm thấy sinh viên.");

            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null) throw new Exception("Không tìm thấy bài học.");

            if (lesson.Section == null)
                throw new Exception("Lỗi dữ liệu: Bài học không thuộc Section nào.");
            var existingProgress = await _studentProgressRepository.GetByStudentAndLessonAsync(student.Id, lessonId);

            if (existingProgress != null)
            {
                existingProgress.IsCompleted = true;
                existingProgress.LastViewedAt = DateTime.Now;
            }
            else
            {
                var newProgress = new StudentProgress
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    LessonId = lessonId,
                    CourseId = lesson.Section.CourseId,
                    QuizId = null,
                    IsCompleted = true,
                    LastViewedAt = DateTime.Now
                };

                await _studentProgressRepository.AddAsync(newProgress);
            }
            await _studentProgressRepository.SaveChangesAsync();

            return true;
        }
        public async Task TrackLessonViewAsync(Guid lessonId, Guid accountId)
        {
            var student = await _studentRepository.GetByAccountIdAsync(accountId);
            if (student == null) throw new Exception("Không tìm thấy sinh viên.");

            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null) throw new Exception("Không tìm thấy bài học.");
            if (lesson.Section == null) throw new Exception("Lỗi dữ liệu: Bài học không thuộc Section nào.");

            var progress = await _studentProgressRepository.GetByStudentAndLessonAsync(student.Id, lessonId);

            if (progress == null)
            {
                var newProgress = new StudentProgress
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    LessonId = lessonId,
                    CourseId = lesson.Section.CourseId,
                    QuizId = null,
                    IsCompleted = false, 
                    LastViewedAt = DateTime.Now 
                };
                await _studentProgressRepository.AddAsync(newProgress);
            }
            else
            {
                progress.LastViewedAt = DateTime.Now;
            }

            await _studentProgressRepository.SaveChangesAsync();
        }
    }
}
