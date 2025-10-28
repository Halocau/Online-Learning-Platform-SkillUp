namespace SkillUp.BussinessObjects.DTOs.Course
{
    public class CourseSummaryDTO
    {
        public System.Guid Id { get; set; }
        public string Title { get; set; }
        public string Image { get; set; }
        public decimal? Price { get; set; }
        public double? Rating { get; set; }
        public int EnrollmentCount { get; set; }
        public string LecturerName { get; set; }
    }
}
