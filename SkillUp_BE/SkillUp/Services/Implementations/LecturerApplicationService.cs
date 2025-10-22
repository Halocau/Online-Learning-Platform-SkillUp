using SkillUp.BussinessObjects.DTOs.Auth;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class LecturerApplicationService : ILecturerApplicationService
    {
        private readonly ILecturerApplicationRepository _lecturerApplicationRepository;
        private readonly CloudinaryService _cloudinaryService;

        public LecturerApplicationService(
            ILecturerApplicationRepository lecturerApplicationRepository,
            CloudinaryService cloudinaryService)
        {
            _lecturerApplicationRepository = lecturerApplicationRepository;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<LecturerApplication> ApplyCvAsync(ApplyCvRequestDto request, Guid accountId)
        {
            // Upload CV file
            var cvUrl = await _cloudinaryService.UploadPdfAsync(request.CvFile, "skillup/lecturers/cv");

            // Upload Degree image
            var degreeUrl = await _cloudinaryService.UploadImageAsync(request.DegreeFile, "skillup/lecturers/degrees");

            var application = new LecturerApplication
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                Cv = cvUrl,
                Degree = degreeUrl,
                Description = request.Description,
                Title = request.Title,
                Profession = request.Profession,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            return await _lecturerApplicationRepository.AddAsync(application);
        }

        public async Task<LecturerApplication> GetApplicationByAccountIdAsync(Guid accountId)
        {
            return await _lecturerApplicationRepository.GetByAccountIdAsync(accountId);
        }
    }
}