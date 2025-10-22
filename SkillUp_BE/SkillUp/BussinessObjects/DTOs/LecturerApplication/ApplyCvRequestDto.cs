namespace SkillUp.BussinessObjects.DTOs.LecturerApplication
{
    public class ApplyCvRequestDto
    {
        public IFormFile CvFile { get; set; } = null!;
        public IFormFile DegreeFile { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Profession { get; set; } = null!;
        public string? Description { get; set; }
    }
}
