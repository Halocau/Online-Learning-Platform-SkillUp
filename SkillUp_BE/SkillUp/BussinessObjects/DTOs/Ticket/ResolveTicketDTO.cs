using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Ticket
{
	public class ResolveTicketDTO
	{
		[Required]
		public string Code{ get; set; }
		[Required]
		public bool Decision { get; set; }
		[Required]
		public string Response { get; set; }
	}
}
