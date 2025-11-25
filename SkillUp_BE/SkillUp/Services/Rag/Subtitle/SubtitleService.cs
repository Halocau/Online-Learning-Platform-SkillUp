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

        public SubtitleService(
            IOptions<RagOptions> ragOptions,
            QdrantService qdrantService,
            IEmbeddingProvider embeddingProvider)
        {
            _ragOptions = ragOptions.Value ?? new RagOptions();
            _qdrantService = qdrantService;
            _embeddingProvider = embeddingProvider;
        }

        public async Task<SubtitleIndexResult> IndexLessonAsync(SubtitleIndexRequest request, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(request.SubtitleText))
            {
                return new SubtitleIndexResult
                {
                    LessonId = request.LessonId,
                    ChunkCount = 0
                };
            }

            var chunks = SubtitleChunker
                .Chunk(request.SubtitleText, _ragOptions)
                .ToList();

            var vectors = new List<QdrantVectorPoint>();

            foreach (var chunk in chunks)
            {
                ct.ThrowIfCancellationRequested();
                var vector = await _embeddingProvider.EmbedAsync(chunk.Text, ct);
                await _qdrantService.EnsureCollectionAsync(vector.Length, ct);

                var payload = new QdrantVectorPayload(
                    request.LessonId,
                    request.CourseId,
                    chunk.Index,
                    chunk.Text,
                    request.SourceVideoUrl);

                vectors.Add(new QdrantVectorPoint(Guid.NewGuid().ToString(), vector, payload));
            }

            if (vectors.Count > 0)
            {
                await _qdrantService.UpsertAsync(vectors, ct);
            }

            return new SubtitleIndexResult
            {
                LessonId = request.LessonId,
                ChunkCount = vectors.Count,
                IndexedAt = DateTime.Now
            };
        }
    }
}

