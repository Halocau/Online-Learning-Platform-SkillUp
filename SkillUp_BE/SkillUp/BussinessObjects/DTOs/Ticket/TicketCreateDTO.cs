using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Ticket
{
	public class TicketCreateDTO
	{
		[Required]
		public string? Title { get; set; }

		[Required]
		public string? Contents { get; set; }
	}
}
