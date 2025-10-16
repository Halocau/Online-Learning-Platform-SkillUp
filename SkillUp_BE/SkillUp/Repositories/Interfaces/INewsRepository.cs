using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
	public interface INewsRepository
	{
		Task <IEnumerable<News>> GetAllNews();
		Task<News> GetNewsById(Guid id);
		Task<News> CreateNews(News news);
		Task<News> UpdateNews(News news);
		Task<News> DeleteNews(Guid id);
	}
}
