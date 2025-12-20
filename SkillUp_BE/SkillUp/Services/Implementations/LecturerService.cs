using SkillUp.BussinessObjects.DTOs;
using SkillUp.BussinessObjects.DTOs.Course;
using SkillUp.BussinessObjects.DTOs.Lecturer;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class LecturerService : ILecturerService
    {
        private readonly ILecturerRepository _lecturerRepository;
        private readonly ILecturerRepository _repository;

        public LecturerService(ILecturerRepository lecturerRepository, ILecturerRepository repository)
        {
            _lecturerRepository = lecturerRepository;
            _repository = repository;
        }
        public async Task<bool> CreateLecturerAsync(Lecturer newLecturer)
        {
            // Thêm Lecturer mới vào cơ sở dữ liệu
            await _lecturerRepository.AddAsync(newLecturer);
            return await _lecturerRepository.SaveChangesAsync();
        }
        // Lấy thông tin Lecturer theo AccountId
        public async Task<LecturerDto> GetLecturerByAccountIdAsync(Guid accountId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accountId);

            if (lecturer == null)
                return null;

            return new LecturerDto
            {
                Id = lecturer.Id,
                Title = lecturer.Title,
                Profession = lecturer.Profession
            };
        }

        // Cập nhật thông tin Lecturer
        public async Task<bool> UpdateLecturerAsync(Guid accountId, LecturerUpdateDto updateDto)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accountId);

            if (lecturer == null)
                return false;

            lecturer.Title = updateDto.Title;
            lecturer.Profession = updateDto.Profession;

            await _lecturerRepository.UpdateAsync(lecturer);
            return await _lecturerRepository.SaveChangesAsync();
        }

        // Thêm Lecturer mới
        public async Task<LecturerDto> AddLecturerAsync(LecturerCreateDto createDto)
        {
            var lecturer = new Lecturer
            {
                Id = Guid.NewGuid(),
                AccountId = createDto.AccountId,
                Title = createDto.Title,
                Profession = createDto.Profession,
                Percentage = 40 
            };

            await _lecturerRepository.AddAsync(lecturer);
            await _lecturerRepository.SaveChangesAsync();

            return new LecturerDto
            {
                Title = lecturer.Title,
                Profession = lecturer.Profession
            };
        }

        // Lấy tất cả Lecturer
        public async Task<List<LecturerDto>> GetAllLecturersAsync()
        {
            var lecturers = await _lecturerRepository.GetAllLecturersAsync();

            return lecturers.Select(lecturer => new LecturerDto
            {
                Title = lecturer.Title,
                Profession = lecturer.Profession
            }).ToList();
        }



        // Cập nhật thông tin Lecturer sau khi thay đổi trạng thái đơn ứng tuyển
        public async Task<bool> UpdateLecturerInfoAsync(Guid? accountId, string? title, string? profession)
        {
            // Kiểm tra nếu accountId không có giá trị
            if (accountId == null)
            {
                return false; // Nếu accountId là null, không thể cập nhật
            }

            // Lấy Lecturer từ AccountId
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accountId.Value); // accountId là Nullable, cần lấy .Value
            if (lecturer == null)
            {
                return false; // Lecturer không tồn tại
            }

            // Cập nhật Title và Profession
            lecturer.Title = title;
            lecturer.Profession = profession;

            // Lưu thay đổi vào cơ sở dữ liệu
            await _lecturerRepository.UpdateAsync(lecturer);
            return await _lecturerRepository.SaveChangesAsync();
        }

        public async Task<LecturerProfileDto?> GetProfileByAccountIdAsync(Guid accountId)
        {
            // 1. Lấy Entity từ Repository
            var lecturer = await _repository.GetLecturerByAccountIdAsync(accountId);

            // 2. Nếu không tìm thấy (Account đó không phải là Lecturer)
            if (lecturer == null)
            {
                return null;
            }

            // 3. Map sang DTO
            return new LecturerProfileDto
            {
                Title = lecturer.Title,
                Profession = lecturer.Profession,
                BankNumber = lecturer.BankNumber,
                BankName = lecturer.BankName,
                ReceiverName = lecturer.ReceiverName


            };
        }
        public async Task<LecturerProfilePageDto> GetLecturerPublicProfileAsync(Guid accId)
        {
            var lecturer = await _lecturerRepository.GetLecturerProfileByAccountAsync(accId);

            if (lecturer == null)
            {
                throw new Exception("Không tìm thấy giảng viên này.");
            }

            var publicCourses = lecturer.Courses
                .Where(c => c.Status == "Public" && c.IsActive)
                .ToList();

            int totalStudents = publicCourses.Sum(c => c.EnrollmentCount);

            double avgRating = 0;
            if (publicCourses.Any())
            {
                var ratedCourses = publicCourses.Where(c => c.Rating > 0).ToList();
                if (ratedCourses.Any())
                {
                    avgRating = ratedCourses.Average(c => c.Rating ?? 0);
                }
            }

            return new LecturerProfilePageDto
            {
                LecturerId = lecturer.Id,
                AccountId = lecturer.AccountId,
                FullName = lecturer.Account.Fullname ?? "Unknown Lecturer",
                Avatar = lecturer.Account.Avatar,
                Description = lecturer.Account.Description,

                Title = lecturer.Title,
                Profession = lecturer.Profession,

                TotalStudents = totalStudents,
                TotalCourses = publicCourses.Count,
                AverageRating = Math.Round(avgRating, 1),

                Courses = publicCourses.Select(c => new CourseSummaryDTO
                {
                    Id = c.Id,
                    Title = c.Title,
                    Image = c.Image,
                    Price = c.Price,
                    Rating = c.Rating,
                    EnrollmentCount = c.EnrollmentCount,
                    LecturerName = lecturer.Account.Fullname,
                }).ToList()
            };
        }
        public async Task<bool> UpdateLecturerProfileAsync(Guid accountId, UpdateLecturerProfileDto request)
        {
            // 1. Tìm Lecturer theo AccountId
            var lecturer = await _repository.GetLecturerByAccountIdAsync(accountId);

            if (lecturer == null)
            {
                return false; // Không tìm thấy (Tài khoản này chưa là Lecturer)
            }

            lecturer.Title = request.Title;
            lecturer.Profession = request.Profession;
            lecturer.BankNumber = request.BankNumber;
            lecturer.BankName = request.BankName;
            lecturer.ReceiverName = request.ReceiverName;

            await _repository.UpdateAsync(lecturer);
            return await _repository.SaveChangesAsync();
        }
    }
}
