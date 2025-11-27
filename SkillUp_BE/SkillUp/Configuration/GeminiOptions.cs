namespace SkillUp.Configuration
{
    public class GeminiOptions
    {
        public string ApiKey { get; set; } = string.Empty;
        public string[]? ApiKeys { get; set; } // Multiple keys for fallback
        public string EmbeddingModel { get; set; } = "gemini-embedding-001";
        public string ChatModel { get; set; } = "gemini-2.5-flash";
        public float Temperature { get; set; } = 0.7f;
        public int MaxOutputTokens { get; set; } = 1600;
        public float TopP { get; set; } = 0.9f;
    }
}

