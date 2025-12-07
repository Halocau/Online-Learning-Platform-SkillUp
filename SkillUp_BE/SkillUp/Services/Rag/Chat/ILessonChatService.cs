using SkillUp.BussinessObjects.DTOs.Rag;

namespace SkillUp.Services.Rag.Chat
{
    public interface ILessonChatService
    {
        Task<ChatResponseDto> ChatAsync(
            Guid lessonId,
            string question,
            CancellationToken ct = default);
    }
}

