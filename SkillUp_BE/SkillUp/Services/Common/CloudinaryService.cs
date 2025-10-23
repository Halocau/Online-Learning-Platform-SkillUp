using System;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using SkillUp.Configuration;

namespace SkillUp.Services.Common
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IOptions<CloudinarySettings> config)
        {
            var account = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(IFormFile file, string? folderName = "skillup/images")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty.");

            await using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folderName,
                Transformation = new Transformation().Quality("auto").FetchFormat("auto")
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if (result.StatusCode == System.Net.HttpStatusCode.OK)
                return result.SecureUrl.ToString();

            throw new Exception($"Upload failed: {result.Error?.Message}");
        }


        public async Task<string> UploadPdfAsync(IFormFile file, string? folderName = "skillup/files")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty.");

            var isPdf = string.Equals(file.ContentType, "application/pdf", StringComparison.OrdinalIgnoreCase)
                        || file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase);

            if (!isPdf)
                throw new ArgumentException("Only PDF files are allowed.");

            await using var stream = file.OpenReadStream();
            // important: make sure stream position is at start
            if (stream.CanSeek)
                stream.Position = 0;

            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folderName,
                UseFilename = true,
                UniqueFilename = false,
                Overwrite = true
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            // extra sanity checks
            if (result == null)
                throw new Exception("Upload returned null result.");

            if (result.StatusCode == System.Net.HttpStatusCode.OK ||
                result.StatusCode == System.Net.HttpStatusCode.Created)
            {
                var pdfUrl = _cloudinary.Api.UrlImgUp
                                 .ResourceType("raw")
                                 .BuildUrl(result.PublicId + ".pdf");

                return pdfUrl;
            }

            throw new Exception($"Upload failed: {result.Error?.Message}");
        }


    }
}
