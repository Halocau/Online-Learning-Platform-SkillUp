namespace SkillUp.BussinessObjects.DTOs.News
{
	public class NewsCreateDTO
	{
		public string? Title { get; set; }

		public string? Contents { get; set; }

		public DateOnly? Date { get; set; }
	}
}
