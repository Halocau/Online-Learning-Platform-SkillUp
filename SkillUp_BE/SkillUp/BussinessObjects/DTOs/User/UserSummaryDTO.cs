namespace SkillUp.BussinessObjects.DTOs.User
{
    public class UserSummaryDTO
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string Fullname { get; set; }
        public string Status { get; set; }
        public string RoleName { get; set; }
        public string Avatar { get; set; }
    }
}
