using System.Net.Http.Json;
using Microsoft.Extensions.Options;
using SkillUp.BussinessObjects.DTOs.Qdrant;
using SkillUp.Configuration;

namespace SkillUp.Services.Common
{
    public class QdrantService
    {
        private readonly HttpClient _httpClient;
        private readonly QdrantOptions _options;
        private string? _activeCollection;

        public QdrantService(IHttpClientFactory httpClientFactory, IOptions<QdrantOptions> options)
        {
            _options = options.Value ?? new QdrantOptions();
            _httpClient = httpClientFactory.CreateClient(nameof(QdrantService));
            _httpClient.BaseAddress = new Uri(_options.Endpoint.TrimEnd('/') + "/");
        }

        public async Task EnsureCollectionAsync(int vectorSize, CancellationToken ct = default)
        {
            var name = BuildCollectionName(vectorSize);
            _activeCollection = name;

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
            var name = _activeCollection ?? _options.Collection;
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
            var name = _activeCollection ?? _options.Collection;
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

        private string BuildCollectionName(int vectorSize)
        {
            var baseName = string.IsNullOrWhiteSpace(_options.Collection)
                ? "skillup_subtitles"
                : _options.Collection;
            return $"{baseName}_{vectorSize}";
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
}

