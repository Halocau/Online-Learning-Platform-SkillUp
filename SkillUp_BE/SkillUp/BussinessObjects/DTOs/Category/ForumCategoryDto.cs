using System.Text.Json.Serialization;

namespace SkillUp.BussinessObjects.DTOs.Category
    {
        public class ForumCategoryDto
        {
             public int Id { get; set; } 
            public string Name { get; set; } = null!;
            public bool IsActive { get; set; }
        }
    }
