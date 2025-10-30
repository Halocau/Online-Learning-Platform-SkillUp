using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IQuestionBankRepository
    {
        Task CreateAsync(QuestionBank question);
    }
}
