using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.News
{
	public class NewsCreateDTO
	{
		[Required]
		public string? Title { get; set; }

		[Required]
		public string? Contents { get; set; }
	}
}
