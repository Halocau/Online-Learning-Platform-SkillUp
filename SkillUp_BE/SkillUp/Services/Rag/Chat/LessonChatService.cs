using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillUp.BussinessObjects.DTOs.Rag;
using SkillUp.Configuration;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;
using SkillUp.Services.Rag.Embedding;

namespace SkillUp.Services.Rag.Chat
{
    public class LessonChatService : ILessonChatService
    {
        private readonly IEmbeddingProvider _embeddingProvider;
        private readonly IQdrantService _qdrantService;
        private readonly IChatCompletionProvider _chatProvider;
        private readonly RagOptions _ragOptions;
        private readonly ILogger<LessonChatService> _logger;

        public LessonChatService(
            IEmbeddingProvider embeddingProvider,
            IQdrantService qdrantService,
            IChatCompletionProvider chatProvider,
            IOptions<RagOptions> ragOptions,
            ILogger<LessonChatService> logger)
        {
            _embeddingProvider = embeddingProvider;
            _qdrantService = qdrantService;
            _chatProvider = chatProvider;
            _ragOptions = ragOptions.Value ?? new RagOptions();
            _logger = logger;
        }

        public async Task<ChatResponseDto> ChatAsync(
            Guid lessonId,
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

                // 2. Search trong Qdrant với filter lessonId và score threshold
                var topK = _ragOptions.TopK ?? 5;
                var scoreThreshold = _ragOptions.ScoreThreshold;
                
                _logger.LogInformation(
                    "Searching Qdrant for lesson {LessonId} with vector size {VectorSize}, topK={TopK}, scoreThreshold={ScoreThreshold}",
                    lessonId, questionVector.Length, topK, scoreThreshold);
                
                var hits = await _qdrantService.SearchAsync(
                    query: questionVector,
                    topK: topK,
                    lessonId: lessonId,
                    scoreThreshold: scoreThreshold,
                    ct: ct);

                _logger.LogInformation(
                    "Qdrant search returned {HitCount} hits for lesson {LessonId}",
                    hits.Count, lessonId);

                if (hits.Count == 0)
                {
                    _logger.LogWarning(
                        "No hits found for lesson {LessonId} with question: {Question} (threshold: {Threshold})",
                        lessonId, question, scoreThreshold);
                    return new ChatResponseDto
                    {
                        Success = true, // Trả về true để không báo lỗi 400
                        Message = "Xin lỗi, tôi không tìm thấy thông tin liên quan đến câu hỏi của bạn trong bài học này. Vui lòng thử đặt câu hỏi cụ thể hơn về nội dung bài học."
                    };
                }

                // 3. Gom context từ các chunks (sort theo chunkIndex để giữ thứ tự)
                var sortedHits = hits
                    .OrderBy(h => h.Payload.ChunkIndex)
                    .ToList();

                var context = string.Join("\n\n", sortedHits.Select(h => h.Payload.Text));
                
                _logger.LogInformation(
                    "Generated context from {HitCount} chunks (total {ContextLength} chars) for lesson {LessonId}. Calling LLM...",
                    sortedHits.Count, context.Length, lessonId);

                // 4. Gọi LLM để tạo response
                var answer = await _chatProvider.GenerateResponseAsync(question, context, ct);
                
                _logger.LogInformation(
                    "LLM generated response for lesson {LessonId} (answer length: {AnswerLength} chars)",
                    lessonId, answer?.Length ?? 0);

                return new ChatResponseDto
                {
                    Success = true,
                    Message = answer,
                    Sources = sortedHits.Select(h => new ChatSourceDto
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
                _logger.LogError(ex, "Error in LessonChatService for lesson {LessonId}", lessonId);
                return new ChatResponseDto
                {
                    Success = false,
                    Message = $"Có lỗi xảy ra: {ex.Message}"
                };
            }
        }
    }
}

