namespace SkillUp.BussinessObjects.DTOs.Banner
{
	public class BannerUpdateDTO
	{
		public int Id { get; set; }

		public string? Hyperlink { get; set; }

		public bool IsActive { get; set; }

		public string Title { get; set; } = null!;

		public string? Description { get; set; }
	}
}
