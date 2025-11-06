using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Cart
{
    public class BulkAddToCartRequestDto
    {
        [Required]
        public List<AddToCartRequestDto> Items { get; set; } = new();
    }
}
