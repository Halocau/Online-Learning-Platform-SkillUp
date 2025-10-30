using SkillUp.BussinessObjects.DTOs.Quiz;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface IQuizService
    {
        Task<bool> CreateQuizAsync(CreateQuizDTO dto, Guid accId);
    }
}
