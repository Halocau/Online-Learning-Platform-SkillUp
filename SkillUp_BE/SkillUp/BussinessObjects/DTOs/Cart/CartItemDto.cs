using SkillUp.BussinessObjects.DTOs.Course;

namespace SkillUp.BussinessObjects.DTOs.Cart
{
    public class CartItemDto
    {
        public Guid Id { get; set; }
        public Guid CourseId { get; set; }
        public decimal Price { get; set; }
        public CourseCartDto Course { get; set; }
    }
}
