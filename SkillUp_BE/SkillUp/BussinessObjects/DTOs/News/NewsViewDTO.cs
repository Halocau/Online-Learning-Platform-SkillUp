namespace SkillUp.BussinessObjects.DTOs.News
{
	public class NewsViewDTO
	{
		public Guid Id { get; set; }

		public string Email { get; set; } = null!;

		public string? Title { get; set; }

		public string? Contents { get; set; }

		public DateOnly? Date { get; set; }
	}
}
