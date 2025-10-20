namespace SkillUp.BussinessObjects.DTOs.News
{
	public class TicketViewModDTO
	{
		public Guid Id { get; set; }

		public string? AccountName { get; set; }

		public string? Title { get; set; }

		public string? Contents { get; set; }

		public DateTime CreatedAt { get; set; }

		public string? Status { get; set; }

		public string? Response { get; set; }
	}
}
