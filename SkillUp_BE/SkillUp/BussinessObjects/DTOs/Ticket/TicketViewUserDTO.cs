namespace SkillUp.BussinessObjects.DTOs.Ticket
{
	public class TicketViewUserDTO
	{
		public string? Title { get; set; }

		public string? Contents { get; set; }

		public DateTime CreatedAt { get; set; }

		public string? Status { get; set; }

		public string? Response { get; set; }

		public string TicketCode { get; set; } = null!;
	}
}
