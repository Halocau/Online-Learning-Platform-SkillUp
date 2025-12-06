namespace SkillUp.BussinessObjects.DTOs.Rag
{
    public class ChatResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<ChatSourceDto>? Sources { get; set; }
    }

    public class ChatSourceDto
    {
        public Guid? LessonId { get; set; }
        public int ChunkIndex { get; set; }
        public string Text { get; set; } = string.Empty;
        public float Score { get; set; }
    }
}

