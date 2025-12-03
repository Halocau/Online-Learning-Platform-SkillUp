namespace SkillUp.Services.Common
{
    public interface ICloudinaryService
    {
        Task<string> UploadImageAsync(IFormFile file, string? folderName = "skillup/images");
        Task<string> UploadPdfAsync(IFormFile file, string? folderName = "skillup/files");
        Task<string> UploadDocumentAsync(IFormFile file, string? folderName = "skillup/lesson-documents");
    }
}
