namespace SkillUp.BussinessObjects.DTOs.LecturerApplication
{
    public class UpdateCvRequestDto
    {
        public IFormFile? CvFile { get; set; }
        public IFormFile? DegreeFile { get; set; }
        public string? Title { get; set; }
        public string? Profession { get; set; }
        public string? Description { get; set; }
    }
}
