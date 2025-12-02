namespace SkillUp.Configuration
{
    public class RagOptions
    {
        public int ChunkSize { get; set; } = 800;
        public int ChunkOverlap { get; set; } = 120;
        public int? TopK { get; set; } = 5;
        public float? ScoreThreshold { get; set; } = 0.5f;
    }
}

