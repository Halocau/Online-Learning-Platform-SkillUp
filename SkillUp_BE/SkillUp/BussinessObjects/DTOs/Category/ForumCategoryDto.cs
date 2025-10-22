    namespace SkillUp.BussinessObjects.DTOs.Category
    {
        public class ForumCategoryDto
        {
            //[JsonIgnore] // ẩn trong request body Swagger
            public int Id { get; set; } // Khi tạo mới có thể để 0
            public string Name { get; set; } = null!;
            public bool IsActive { get; set; }
        }
    }
