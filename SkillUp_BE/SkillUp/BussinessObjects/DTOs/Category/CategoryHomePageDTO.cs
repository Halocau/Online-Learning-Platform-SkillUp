namespace SkillUp.BussinessObjects.DTOs.Category
{
    public class CategoryHomePageDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<SubCategoryHomePageDTO> SubCategories { get; set; }
    }
}
