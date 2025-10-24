using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.News
{
	public class NewsUpdateDTO
	{
		[Required]
		public Guid Id { get; set; }
		[Required]
		public string? Title { get; set; }
		[Required]
		public string? Contents { get; set; }
	}
}
