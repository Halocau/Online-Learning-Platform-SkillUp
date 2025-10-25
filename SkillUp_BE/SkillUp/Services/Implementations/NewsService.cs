using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
	public class NewsService : INewsService
	{
		private readonly INewsRepository _newsRepository;
		public NewsService(INewsRepository newsRepository)
		{
			_newsRepository = newsRepository;
		}
		public async Task<IEnumerable<News>> GetAllNews()
		{
			return await _newsRepository.GetAllNews();
		}

		public async Task<News> GetNewsById(Guid id)
		{
			return await _newsRepository.GetNewsById(id);
		}
		public async Task<News> CreateNews(News news)
		{
			return await _newsRepository.CreateNews(news);
		}

		public async Task<News> UpdateNews(News news)
		{
			var existingNews =  await _newsRepository.GetNewsById(news.Id);
			if (existingNews == null)
			{
				return null;
			}
			existingNews.Title = news.Title;
			existingNews.Contents = news.Contents;
			existingNews.Date = news.Date;

			return await _newsRepository.UpdateNews(existingNews);
		}

		public async Task<News> DeleteNews(Guid id)
		{
			var existingNews = await _newsRepository.GetNewsById(id);
			if (existingNews == null)
			{
				return null;
			}
			return await _newsRepository.DeleteNews(existingNews);

		}
	}
}