namespace SkillUp.Services.Rag.Chat
{
    public interface IChatCompletionProvider
    {
        Task<string> GenerateResponseAsync(
            string userQuestion,
            string context,
            CancellationToken ct = default);
    }
}

