namespace SkillUp.BussinessObjects.DTOs
{
	public class NewsViewDTO
	{
		public Guid Id { get; set; }

		public string Email { get; set; }

		public string? Title { get; set; }

		public string? Contents { get; set; }

		public DateOnly? Date { get; set; }
	}
}
