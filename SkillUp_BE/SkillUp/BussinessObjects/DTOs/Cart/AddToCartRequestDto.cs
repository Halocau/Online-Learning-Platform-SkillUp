namespace SkillUp.BussinessObjects.DTOs.Cart
{
    public class AddToCartRequestDto
    {
        public Guid CourseId { get; set; } 
        public decimal Price { get; set; }
    }
}
