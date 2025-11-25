using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using SkillUp.BussinessObjects.DTOs.Qdrant;
using SkillUp.Configuration;

namespace SkillUp.Services.Common
{
    public class QdrantService
    {
        private readonly HttpClient _httpClient;
        private readonly QdrantOptions _options;
        private readonly string _collectionBaseName;
        private readonly int _defaultVectorSize;
        private string _collectionName;

        public QdrantService(IHttpClientFactory httpClientFactory, IOptions<QdrantOptions> options)
        {
            _options = options.Value ?? new QdrantOptions();
            _collectionBaseName = string.IsNullOrWhiteSpace(_options.Collection)
                ? "skillup_subtitles"
                : _options.Collection;
            _defaultVectorSize = _options.DefaultVectorSize > 0 ? _options.DefaultVectorSize : 3072;
            _collectionName = BuildCollectionName(_defaultVectorSize);
            _httpClient = httpClientFactory.CreateClient(nameof(QdrantService));
            _httpClient.BaseAddress = new Uri(_options.Endpoint.TrimEnd('/') + "/");
        }

        public async Task EnsureCollectionAsync(int vectorSize, CancellationToken ct = default)
        {
            var name = BuildCollectionName(vectorSize);
            _collectionName = name;

            var check = await _httpClient.GetAsync($"collections/{name}", ct);
            if (check.IsSuccessStatusCode)
            {
                return;
            }

            var body = new
            {
                vectors = new
                {
                    size = vectorSize,
                    distance = "Cosine"
                }
            };

            var resp = await _httpClient.PutAsJsonAsync($"collections/{name}", body, ct);
            resp.EnsureSuccessStatusCode();
        }

        public async Task UpsertAsync(IEnumerable<QdrantVectorPoint> points, CancellationToken ct = default)
        {
            var name = _collectionName;
            var payload = new
            {
                points = points.Select(p => new
                {
                    id = p.Id,
                    vector = p.Vector,
                    payload = new
                    {
                        text = p.Payload.Text,
                        lessonId = p.Payload.LessonId,
                        courseId = p.Payload.CourseId,
                        chunkIndex = p.Payload.ChunkIndex,
                        source = p.Payload.Source
                    }
                })
            };

            var resp = await _httpClient.PutAsJsonAsync($"collections/{name}/points?wait=true", payload, ct);
            resp.EnsureSuccessStatusCode();
        }

        public async Task<IReadOnlyList<QdrantVectorHit>> SearchAsync(
            float[] query,
            int topK,
            Guid? lessonId = null,
            Guid? courseId = null,
            CancellationToken ct = default)
        {
            var name = _collectionName;
            var body = new
            {
                vector = query,
                top = topK,
                with_payload = true,
                filter = BuildFilter(lessonId, courseId)
            };

            var resp = await _httpClient.PostAsJsonAsync($"collections/{name}/points/search", body, ct);
            resp.EnsureSuccessStatusCode();

            var json = await resp.Content.ReadFromJsonAsync<QdrantSearchResponse>(cancellationToken: ct)
                       ?? new QdrantSearchResponse();

            return json.Result
                .Select(hit => new QdrantVectorHit(
                    hit.Id,
                    hit.Score,
                    hit.Payload.Text,
                    new QdrantVectorPayload(
                        hit.Payload.LessonId,
                        hit.Payload.CourseId,
                        hit.Payload.ChunkIndex,
                        hit.Payload.Text,
                        hit.Payload.Source)))
                .ToList();
        }

        public async Task<long> CountVectorsAsync(
            Guid? lessonId = null,
            Guid? courseId = null,
            CancellationToken ct = default)
        {
            var name = _collectionName;
            var filter = BuildFilter(lessonId, courseId);
            var body = new
            {
                filter,
                exact = false
            };

            var resp = await _httpClient.PostAsJsonAsync($"collections/{name}/points/count", body, ct);
            if (resp.StatusCode == HttpStatusCode.NotFound)
            {
                return 0;
            }
            resp.EnsureSuccessStatusCode();

            var result = await resp.Content.ReadFromJsonAsync<QdrantCountResponse>(cancellationToken: ct);
            return result?.Result.Count ?? 0;
        }

        public async Task<bool> LessonHasVectorsAsync(Guid lessonId, CancellationToken ct = default)
        {
            var count = await CountVectorsAsync(lessonId, null, ct);
            return count > 0;
        }

        public async Task<IReadOnlyList<QdrantVectorPayload>> GetPayloadSamplesAsync(
            Guid? lessonId = null,
            Guid? courseId = null,
            int limit = 10,
            CancellationToken ct = default)
        {
            var name = _collectionName;
            var filter = BuildFilter(lessonId, courseId);
            var clampedLimit = Math.Clamp(limit, 1, 50);
            var body = new
            {
                filter,
                limit = clampedLimit,
                with_payload = true,
                with_vectors = false
            };

            var resp = await _httpClient.PostAsJsonAsync($"collections/{name}/points/scroll", body, ct);
            if (resp.StatusCode == HttpStatusCode.NotFound)
            {
                return Array.Empty<QdrantVectorPayload>();
            }
            resp.EnsureSuccessStatusCode();

            var result = await resp.Content.ReadFromJsonAsync<QdrantScrollResponse>(cancellationToken: ct)
                         ?? new QdrantScrollResponse();

            return result.Result.Points
                .Select(p => new QdrantVectorPayload(
                    p.Payload.LessonId,
                    p.Payload.CourseId,
                    p.Payload.ChunkIndex,
                    p.Payload.Text,
                    p.Payload.Source))
                .OrderBy(p => p.ChunkIndex)
                .ToList();
        }

        private string BuildCollectionName(int vectorSize)
        {
            var size = vectorSize > 0 ? vectorSize : _defaultVectorSize;
            return $"{_collectionBaseName}_{size}";
        }

        private static object? BuildFilter(Guid? lessonId, Guid? courseId)
        {
            var must = new List<object>();

            if (lessonId.HasValue)
            {
                must.Add(new
                {
                    key = "lessonId",
                    match = new { value = lessonId.Value }
                });
            }

            if (courseId.HasValue)
            {
                must.Add(new
                {
                    key = "courseId",
                    match = new { value = courseId.Value }
                });
            }

            if (must.Count == 0)
            {
                return null;
            }

            return new { must };
        }
    }

    internal class QdrantCountResponse
    {
        public QdrantCountResult Result { get; set; } = new();
    }

    internal class QdrantCountResult
    {
        public long Count { get; set; }
    }

    internal sealed class QdrantScrollResponse
    {
        [JsonPropertyName("result")]
        public QdrantScrollResult Result { get; set; } = new();
    }

    internal sealed class QdrantScrollResult
    {
        [JsonPropertyName("points")]
        public List<QdrantScrollPoint> Points { get; set; } = new();
    }

    internal sealed class QdrantScrollPoint
    {
        [JsonPropertyName("payload")]
        public QdrantPayloadDocument Payload { get; set; } = new();
    }
}

