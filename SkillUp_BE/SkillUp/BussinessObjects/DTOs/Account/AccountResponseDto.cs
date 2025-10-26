using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace SkillUp.BussinessObjects.DTOs.Account
{
    public class AccountResponseDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string? Fullname { get; set; }
        public string? Phone { get; set; }
        public string? Gender { get; set; }
        public DateOnly? Dob { get; set; }
        public string? Avatar { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = null!;
        public int? RoleId { get; set; }
    }

}
