using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Course
{
    public class CoursePriceDto
    {
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Giá tiền không thể là số âm")]
        public decimal Price { get; set; }
    }
}
