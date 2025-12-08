namespace SkillUp.Services.Rag.Embedding
{
    public interface IEmbeddingProvider
    {
        Task<float[]> EmbedAsync(string text, CancellationToken ct = default);
    }
}

