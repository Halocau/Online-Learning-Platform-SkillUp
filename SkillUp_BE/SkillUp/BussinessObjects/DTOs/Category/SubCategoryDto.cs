namespace SkillUp.BussinessObjects.DTOs
{
    // Dùng để hiển thị (GET)
    public class SubCategoryDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; }
    }

    // Dùng khi tạo mới (POST)
    public class SubCategoryCreateRequest
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = null!;
    }

    // Dùng khi cập nhật (PUT)
    public class SubCategoryUpdateRequest
    {
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; }
    }
}
