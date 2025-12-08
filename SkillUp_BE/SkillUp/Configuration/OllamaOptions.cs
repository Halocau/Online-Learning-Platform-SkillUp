namespace SkillUp.Configuration
{
    public class OllamaOptions
    {
        public string BaseUrl { get; set; } = "http://localhost:11434";
        public string ChatModel { get; set; } = "mrjacktung/phogpt-4b-chat-gg";
        public double Temperature { get; set; } = 0.4;
        public double TopP { get; set; } = 0.9;
        public int MaxTokens { get; set; } = 512;
    }
}


