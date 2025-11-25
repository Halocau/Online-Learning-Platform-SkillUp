namespace SkillUp.Configuration
{
    public class GeminiOptions
    {
        public string ApiKey { get; set; } = string.Empty;
        public string EmbeddingModel { get; set; } = "gemini-embedding-001";
        public string ChatModel { get; set; } = "gemini-2.5-flash";
        public float Temperature { get; set; } = 0.2f;
        public int MaxOutputTokens { get; set; } = 512;
    }
}

