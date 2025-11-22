namespace SkillUp.BussinessObjects.DTOs.Banner
{
	public class BannerViewDTO
	{
		public int Id { get; set; }

		public string? Image { get; set; }

		public string? Hyperlink { get; set; }

		public bool IsActive { get; set; }

		public string Title { get; set; } = null!;

		public string? Description { get; set; }

		public string? Email { get; set; }
	}
}
