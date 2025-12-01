using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillUp.BussinessObjects.DTOs.Qdrant;
using SkillUp.BussinessObjects.DTOs.Subtitle;
using SkillUp.Configuration;
using SkillUp.Services.Common;
using SkillUp.Services.Rag.Embedding;

namespace SkillUp.Services.Rag.Subtitle
{
    public class SubtitleService : ISubtitleService
    {
        private readonly RagOptions _ragOptions;
        private readonly QdrantService _qdrantService;
        private readonly IEmbeddingProvider _embeddingProvider;
        private readonly ILogger<SubtitleService> _logger;

        public SubtitleService(
            IOptions<RagOptions> ragOptions,
            QdrantService qdrantService,
            IEmbeddingProvider embeddingProvider,
            ILogger<SubtitleService> logger)
        {
            _ragOptions = ragOptions.Value ?? new RagOptions();
            _qdrantService = qdrantService;
            _embeddingProvider = embeddingProvider;
            _logger = logger;
        }

        public async Task<SubtitleIndexResult> IndexLessonAsync(SubtitleIndexRequest request, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(request.SubtitleText))
            {
                _logger.LogWarning(
                    "Subtitle text is empty for lesson {LessonId}. Skipping indexing.",
                    request.LessonId);
                return new SubtitleIndexResult
                {
                    LessonId = request.LessonId,
                    ChunkCount = 0
                };
            }

            _logger.LogInformation(
                "Starting indexing for lesson {LessonId}. Text length: {TextLength} chars",
                request.LessonId,
                request.SubtitleText.Length);

            //chunk sub
            var chunkStart = DateTime.Now;
            var chunks = SubtitleChunker
                .Chunk(request.SubtitleText, _ragOptions)
                .ToList();

            var chunkDuration = DateTime.Now - chunkStart;

            _logger.LogInformation(
                "Chunked subtitle text for lesson {LessonId} into {ChunkCount} chunks in {Duration}ms",
                request.LessonId,
                chunks.Count,
                chunkDuration.TotalMilliseconds);

            var vectors = new List<QdrantVectorPoint>();
            var embeddingStart = DateTime.Now;

            foreach (var chunk in chunks)
            {
                ct.ThrowIfCancellationRequested();//Kiểm tra hủy, nếu có thì throw
                var vector = await _embeddingProvider.EmbedAsync(chunk.Text, ct);
                await _qdrantService.EnsureCollectionAsync(vector.Length, ct); //Đảm bảo collection tồn tại với dimension đúng

                var payload = new QdrantVectorPayload(
                    request.LessonId,
                    request.CourseId,
                    chunk.Index,
                    chunk.Text,
                    request.SourceVideoUrl);

                vectors.Add(new QdrantVectorPoint(Guid.NewGuid().ToString(), vector, payload));//payload chứa metadata
            }

            var embeddingDuration = DateTime.Now - embeddingStart;
            _logger.LogInformation(
                "Generated embeddings for {ChunkCount} chunks for lesson {LessonId} in {Duration}ms",
                vectors.Count,
                request.LessonId,
                embeddingDuration.TotalMilliseconds);

            if (vectors.Count > 0)
            {
                var upsertStart = DateTime.Now;
                await _qdrantService.UpsertAsync(vectors, ct);
                var upsertDuration = DateTime.Now - upsertStart;

                _logger.LogInformation(
                    "Indexed {ChunkCount} chunks into Qdrant for lesson {LessonId} in {Duration}ms. Total indexing time: {TotalDuration}ms",
                    vectors.Count,
                    request.LessonId,
                    upsertDuration.TotalMilliseconds,
                    (chunkDuration + embeddingDuration + upsertDuration).TotalMilliseconds);
            }

            return new SubtitleIndexResult
            {
                LessonId = request.LessonId,
                ChunkCount = vectors.Count,
                IndexedAt = DateTime.Now
            };
        }

        public async Task<bool> HasSubtitlesAsync(Guid lessonId, CancellationToken ct = default)
        {
            // Use search with limit 1 to check if any vectors exist for this lesson
            var dummyVector = new float[1]; 
            var results = await _qdrantService.SearchAsync(dummyVector, topK: 1, lessonId: lessonId, ct: ct);
            return results.Count > 0;
        }

        public async Task<bool> LessonHasIndexedSubtitleAsync(Guid lessonId, CancellationToken ct = default)
        {
            return await HasSubtitlesAsync(lessonId, ct);
        }
    }
}

