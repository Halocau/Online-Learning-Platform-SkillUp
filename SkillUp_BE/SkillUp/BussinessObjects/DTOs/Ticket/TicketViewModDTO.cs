namespace SkillUp.BussinessObjects.DTOs.Ticket
{
	public class TicketViewModDTO
	{
		public string TicketCode { get; set; } = null!;

		public string? AccountName { get; set; }

		public string? Title { get; set; }

		public string? Contents { get; set; }

		public string? Response { get; set; }

		public DateTime CreatedAt { get; set; }

		public string? Status { get; set; }
	}
}
