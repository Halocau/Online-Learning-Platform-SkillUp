namespace SkillUp.BussinessObjects.DTOs.LecturerApplication
{
    public class ApplyCvRequestDto
    {
        public IFormFile CvFile { get; set; } = null!;
        public List<IFormFile> DegreeFile { get; set; } = new List<IFormFile>(); 
        public string Title { get; set; } = null!;
        public string Profession { get; set; } = null!;
        public string? Description { get; set; }
    }
}
