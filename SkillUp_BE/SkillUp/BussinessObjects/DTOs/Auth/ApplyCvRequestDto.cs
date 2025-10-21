using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace SkillUp.BussinessObjects.DTOs.Auth
{
    public class ApplyCvRequestDto
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Tiêu đề là bắt buộc")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Chức danh là bắt buộc")]
        public string Profession { get; set; }
        [Required(ErrorMessage = "Mô tả là bắt buộc")]
        public string Description { get; set; }

        [Required(ErrorMessage = "CV là bắt buộc")]
        public IFormFile CvFile { get; set; }

        [Required(ErrorMessage = "Bằng cấp là bắt buộc")]
        public IFormFile DegreeFile { get; set; }
    }
}