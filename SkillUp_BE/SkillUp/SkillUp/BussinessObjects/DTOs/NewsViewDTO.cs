namespace SkillUp.BussinessObjects.DTOs
{
	public class NewsViewDTO
	{
		public Guid Id { get; set; }

		public Guid AccountId { get; set; }

		public string? Title { get; set; }

		public string? Contents { get; set; }

		public DateOnly? Date { get; set; }
	}
}
