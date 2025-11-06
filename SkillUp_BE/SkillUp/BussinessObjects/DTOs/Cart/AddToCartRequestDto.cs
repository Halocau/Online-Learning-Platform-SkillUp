using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Cart
{
    public class AddToCartRequestDto
    {
        [Required]
        public Guid CourseId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Price không hợp lệ.")]
        public decimal Price { get; set; } = 0;
    }
}
