namespace SkillUp.BussinessObjects.DTOs.User
{
    public class UserProfileDTO
    {
        public Guid Id { get; set; }
        public string? Email { get; set; }
        public string? Fullname { get; set; }
        public string? Phone { get; set; }
        public string? Gender { get; set; }
        public DateOnly? Dob { get; set; }
        public string? Avatar { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
