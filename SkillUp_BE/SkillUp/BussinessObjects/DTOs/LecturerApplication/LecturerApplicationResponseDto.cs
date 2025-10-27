namespace SkillUp.BussinessObjects.DTOs.LecturerApplication
{
    public class LecturerApplicationResponseDto
    {
        public Guid Id { get; set; }
        public string Cv { get; set; } = null!;
        public string Degree { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Profession { get; set; } = null!;
        public string? Description { get; set; }
        public string Status { get; set; } = null!; // Pending, Approved, Rejected
        public string? RejectReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
