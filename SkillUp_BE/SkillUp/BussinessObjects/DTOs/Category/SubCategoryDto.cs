// Trong thư mục Models hoặc một thư mục DTOs mới
namespace SkillUp.BussinessObjects.Dtos
{
    public class SubCategoryDto
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; }
    }
}