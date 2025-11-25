using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
	public class NewsRepository : INewsRepository
	{
		private readonly SkillUp1Context _context;
		public NewsRepository(SkillUp1Context context)
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
			_context.News.Update(news);
			await _context.SaveChangesAsync();
			return news;
		}

		public async Task<News> DeleteNews(News news)
		{
			_context.News.Remove(news);
			await _context.SaveChangesAsync();
			return news;
		}
	}
}
