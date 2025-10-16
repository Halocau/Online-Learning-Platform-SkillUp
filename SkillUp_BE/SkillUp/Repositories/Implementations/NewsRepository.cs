using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
	public class NewsRepository : INewsRepository
	{
		private readonly SkillUpContext _context;
		public NewsRepository(SkillUpContext context)
		{
			_context = context;
		}
		public async Task <IEnumerable<News>> GetAllNews()
		{
			return await _context.News.ToListAsync();
		}

		public async Task<News> GetNewsById(Guid id)
		{
			return await _context.News.FirstOrDefaultAsync(n => n.Id == id);
		}

		public async Task<News> CreateNews(News news)
		{
			_context.News.Add(news);
			await _context.SaveChangesAsync();
			return news;
		}
		public async Task<News> UpdateNews(News news)
		{
			var existingNews = await _context.News.FindAsync(news.Id);
			if (existingNews == null)
			{
				return null;
			}
			existingNews.Title = news.Title;
			existingNews.Contents = news.Contents;
			await _context.SaveChangesAsync();
			return existingNews;
		}

		public async Task<News> DeleteNews(Guid id)
		{
			var news = await _context.News.FindAsync(id);
			if (news == null)
			{
				return null;
			}
			_context.News.Remove(news);
			await _context.SaveChangesAsync();
			return news;
		}
	}
}
