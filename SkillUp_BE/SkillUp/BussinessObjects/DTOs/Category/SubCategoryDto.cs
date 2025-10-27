
using System.Text.Json.Serialization;
namespace SkillUp.BussinessObjects.DTOs
{
    public class SubCategoryDto
    {
        [JsonIgnore]
        public int Id { get; set; }               // Dùng khi update, delete, view
        public int CategoryId { get; set; }       // Liên kết đến Category
        //public string? CategoryName { get; set; } // Tên Category cha (nếu cần hiển thị)
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; }        // Trạng thái kích hoạt
    }
}
