namespace SkillUp.BussinessObjects.DTOs.Banner
{
	public class BannerCreateDTO
	{

		public string? Hyperlink { get; set; }

		public bool IsActive { get; set; }

		public string Title { get; set; } = null!;

		public string? Description { get; set; }
	}
}
