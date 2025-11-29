namespace SkillUp.BussinessObjects.DTOs.PurchaseHistory
{
    public class PurchaseHistoryDto
    {
        public Guid TransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } 
        public string Status { get; set; }      
        public string? Description { get; set; }

        public List<PurchasedCourseDto> Courses { get; set; } = new();
    }
    public class PurchasedCourseDto
    {
        public Guid CourseId { get; set; }
        public string CourseTitle { get; set; }
        public string CourseImage { get; set; }
        public decimal PricePaid { get; set; }
        public string LecturerName { get; set; } = "Unknown";
        public double Rating { get; set; } 
    }
}
