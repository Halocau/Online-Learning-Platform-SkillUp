namespace SkillUp.BussinessObjects.DTOs.PayOS
{
    public class CoursePaymentResponseDto
    {
        public string? CheckoutUrl { get; set; }
        public string? OrderCode { get; set; }
        public string? Message { get; set; }
        public bool Success { get; set; }
    }
}
