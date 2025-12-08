using SkillUp.BussinessObjects.DTOs.Rag;

namespace SkillUp.Services.Rag.Chat
{
    public interface ICourseChatService
    {
        Task<ChatResponseDto> ChatAsync(
            Guid courseId,
            string question,
            CancellationToken ct = default);
    }
}

