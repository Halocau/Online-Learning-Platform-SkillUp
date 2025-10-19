using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using SkillUp.BussinessObjects.DTOs.News;
using SkillUp.BussinessObjects.Models;
using SkillUp.ExceptionHandling;

namespace SkillUp.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class NewsController : ControllerBase
	{
		private readonly INewsService _newsService;
		private readonly ICurrentUserService _currentUserService;
		public NewsController(INewsService newsService, ICurrentUserService currentUserService)
		{
			_newsService = newsService;
			_currentUserService = currentUserService;
		}
		[HttpGet("all-news")]
		public async Task<IActionResult> GetAllNews()
		{
			try
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
				if (newsDTO == null || !newsDTO.Any())
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không có tin tức nào!",
						data = new List<object>()
					});
				}

				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy tin tức thành công!",
					data = new List<object>(newsDTO)
				});
			} catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetNewsById(Guid id)
		{
			try
			{
				var news = await _newsService.GetNewsById(id);
				if (news == null)
				{
					return NotFound($"Không tìm thấy tin tức!");
				}
				var newsDTO = new NewsViewDTO
				{
					Id = news.Id,
					Email = news.Email,
					Title = news.Title,
					Contents = news.Contents,
					Date = news.Date
				};
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy tin tức thành công!",
					data = new List<object> { newsDTO }
				});
			} catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpPost("create-news")]
		public async Task<IActionResult> CreateNews([FromForm] NewsCreateDTO newsCreateDTO)
		{
			try
			{
				if (newsCreateDTO == null)
				{
					return BadRequest("Thông tin không hợp lệ!");
				}
				var news = new News
				{
					Id = Guid.NewGuid(),
					Email = "_currentUserService.Email",
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
				return Ok(new APIReturn
				{
					code = 201,
					message = "Tạo tin tức thành công!",
					data = new List<object> { newsDTO }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpPut("update-news")]
		public async Task<IActionResult> UpdateNews([FromForm] NewsUpdateDTO newsUpdateDTO)
		{
			try
			{
				if (newsUpdateDTO == null || newsUpdateDTO.Id == Guid.Empty)
				{
					return BadRequest("Thông tin không hợp lệ!");
				}
				var news = new News
				{
					Id = newsUpdateDTO.Id,
					Email = _currentUserService.Email,
					Title = newsUpdateDTO.Title,
					Contents = newsUpdateDTO.Contents,
					Date = DateOnly.FromDateTime(DateTime.Now)
				};
				var updatedNews = await _newsService.UpdateNews(news);
				if (updatedNews == null)
				{
					return NotFound($"Không tìm thấy tin tức!");
				}
				var newsDTO = new NewsViewDTO
				{
					Id = updatedNews.Id,
					Email = updatedNews.Email,
					Title = updatedNews.Title,
					Contents = updatedNews.Contents,
					Date = updatedNews.Date
				};
				return Ok(new APIReturn
				{
					code = 200,
					message = "Cập nhật tin tức thành công!",
					data = new List<object> { newsDTO }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpDelete("delete-news/{id}")]
		public async Task<IActionResult> DeleteNews(Guid id)
		{
			var deletedNews = await _newsService.DeleteNews(id);
			if (deletedNews == null)
			{
				return NotFound($"Không tìm thấy tin tức!");
			}

			return Ok(new APIReturn
			{
				code = 200,
				message = "Xóa tin tức thành công!",
				data = new List<object>()
			});
		}
	}
}
