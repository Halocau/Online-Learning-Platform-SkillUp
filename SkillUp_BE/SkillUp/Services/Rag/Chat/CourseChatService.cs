using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillUp.BussinessObjects.DTOs.Rag;
using SkillUp.Configuration;
using SkillUp.Services.Common;
using SkillUp.Services.Rag.Embedding;

namespace SkillUp.Services.Rag.Chat
{
    public class CourseChatService : ICourseChatService
    {
        private readonly IEmbeddingProvider _embeddingProvider;
        private readonly QdrantService _qdrantService;
        private readonly IChatCompletionProvider _chatProvider;
        private readonly RagOptions _ragOptions;
        private readonly ILogger<CourseChatService> _logger;

        public CourseChatService(
            IEmbeddingProvider embeddingProvider,
            QdrantService qdrantService,
            IChatCompletionProvider chatProvider,
            IOptions<RagOptions> ragOptions,
            ILogger<CourseChatService> logger)
        {
            _embeddingProvider = embeddingProvider;
            _qdrantService = qdrantService;
            _chatProvider = chatProvider;
            _ragOptions = ragOptions.Value ?? new RagOptions();
            _logger = logger;
        }

        public async Task<ChatResponseDto> ChatAsync(
            Guid courseId,
            string question,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(question))
            {
                return new ChatResponseDto
                {
                    Success = false,
                    Message = "Câu hỏi không được để trống."
                };
            }

            try
            {
                // 1. Embed câu hỏi
                var questionVector = await _embeddingProvider.EmbedAsync(question, ct);

                // 2. Search trong Qdrant với filter courseId và score threshold
                var topK = _ragOptions.TopK ?? 10;
                var scoreThreshold = _ragOptions.ScoreThreshold;
                var hits = await _qdrantService.SearchAsync(
                    query: questionVector,
                    topK: topK,
                    courseId: courseId,
                    scoreThreshold: scoreThreshold,
                    ct: ct);

                if (hits.Count == 0)
                {
                    var thresholdMessage = scoreThreshold.HasValue 
                        ? $" (score threshold: {scoreThreshold.Value:F2})" 
                        : "";
                    return new ChatResponseDto
                    {
                        Success = false,
                        Message = $"Không tìm thấy nội dung liên quan trong khóa học này. Vui lòng đảm bảo phụ đề đã được tạo cho các bài học."
                    };
                }

                // 3. Gom context từ các chunks (group theo lessonId, sort theo chunkIndex)
                var groupedHits = hits
                    .GroupBy(h => h.Payload.LessonId)
                    .SelectMany(g => g.OrderBy(h => h.Payload.ChunkIndex))
                    .ToList();

                var context = string.Join("\n\n", groupedHits.Select(h => 
                    $"[Bài học: {h.Payload.LessonId}]\n{h.Payload.Text}"));

                // 4. Gọi LLM để tạo response
                var answer = await _chatProvider.GenerateResponseAsync(question, context, ct);

                return new ChatResponseDto
                {
                    Success = true,
                    Message = answer,
                    Sources = groupedHits.Select(h => new ChatSourceDto
                    {
                        LessonId = h.Payload.LessonId,
                        ChunkIndex = h.Payload.ChunkIndex,
                        Text = h.Payload.Text,
                        Score = h.Score
                    }).ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CourseChatService for course {CourseId}", courseId);
                return new ChatResponseDto
                {
                    Success = false,
                    Message = $"Có lỗi xảy ra: {ex.Message}"
                };
            }
        }
    }
}

