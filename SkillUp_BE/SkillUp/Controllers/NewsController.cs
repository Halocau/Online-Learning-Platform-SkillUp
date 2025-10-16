using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using SkillUp.BussinessObjects.DTOs.News;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class NewsController : ControllerBase
	{
		private readonly INewsService _newsService;
		public NewsController(INewsService newsService)
		{
			_newsService = newsService;
		}
		[HttpGet("all-news")]
		public async Task<IActionResult> GetAllNews()
		{
			var news = await _newsService.GetAllNews();
			var newsDTO = news.Select(n => new NewsViewDTO
			{
				Id = n.Id,
				Email = n.Email,
				Title = n.Title,
				Contents = n.Contents,
				Date = n.Date
			}).ToList();
			/*if (newsDTO == null || !newsDTO.Any())
			{
				return NotFound("No news found.");
			}*/

			return Ok(newsDTO);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetNewsById(Guid id)
			{
			var news = await _newsService.GetNewsById(id);
			if (news == null)
			{
				return NotFound($"News with ID {id} not found.");
			}
			var newsDTO = new NewsViewDTO
			{
				Id = news.Id,
				Email = news.Email,
				Title = news.Title,
				Contents = news.Contents,
				Date = news.Date
			};
			return Ok(newsDTO);
		}

		[HttpPost("create-news")]
		public async Task<IActionResult> CreateNews([FromForm] NewsCreateDTO newsCreateDTO)
		{
			if (newsCreateDTO == null)
			{
				return BadRequest("News data is null.");
			}
			var news = new News
			{
				Id = Guid.NewGuid(),
				Email = "placeholding@gmail.com",
				Title = newsCreateDTO.Title,
				Contents = newsCreateDTO.Contents,
				Date = DateOnly.FromDateTime(DateTime.Now)
			};
			var createdNews = await _newsService.CreateNews(news);
			var newsDTO = new NewsViewDTO
			{
				Id = createdNews.Id,
				Email = createdNews.Email,
				Title = createdNews.Title,
				Contents = createdNews.Contents,
				Date = DateOnly.FromDateTime(DateTime.Now)
			};
			return CreatedAtAction(nameof(GetNewsById), new { id = newsDTO.Id }, newsDTO);
		}

		[HttpPut("update-news")]
		public async Task<IActionResult> UpdateNews([FromForm] NewsViewDTO newsViewDTO)
		{
			if (newsViewDTO == null || newsViewDTO.Id == Guid.Empty)
			{
				return BadRequest("Invalid news data.");
			}
			var news = new News
			{
				Id = newsViewDTO.Id,
				Email = "newsViewDTO.Email",
				Title = newsViewDTO.Title,
				Contents = newsViewDTO.Contents,
				Date = newsViewDTO.Date
			};
			var updatedNews = await _newsService.UpdateNews(news);
			if (updatedNews == null)
			{
				return NotFound($"News with ID {newsViewDTO.Id} not found.");
			}
			var newsDTO = new NewsViewDTO
			{
				Id = updatedNews.Id,
				Email = "updatedNews.Email",
				Title = updatedNews.Title,
				Contents = updatedNews.Contents,
				Date = updatedNews.Date
			};
			return Ok(newsDTO);
		}

		[HttpDelete("delete-news/{id}")]
		public async Task<IActionResult> DeleteNews(Guid id)
		{
			var deletedNews = await _newsService.DeleteNews(id);
			if (deletedNews == null)
			{
				return NotFound($"News with ID {id} not found.");
			}

			return NoContent();
		}
	}
}
