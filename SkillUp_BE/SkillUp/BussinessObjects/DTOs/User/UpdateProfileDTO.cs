using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.User
{
    public class UpdateProfileDTO
    {
        [StringLength(100)]
        public string? Fullname { get; set; }

        [StringLength(12)]
        public string? Phone { get; set; }

        public string? Gender { get; set; }

        public DateOnly? Dob { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }
    }
}
