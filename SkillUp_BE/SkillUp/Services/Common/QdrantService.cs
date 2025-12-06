using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using SkillUp.BussinessObjects.DTOs.Qdrant;
using SkillUp.Configuration;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Common
{
    public class QdrantService : IQdrantService
    {
        private readonly HttpClient _httpClient;
        private readonly QdrantOptions _options;
        private readonly string _collectionBaseName;
        private readonly int _defaultVectorSize;
        private string _collectionName;
        private bool _indexesEnsured;

        public QdrantService(IHttpClientFactory httpClientFactory, IOptions<QdrantOptions> options)
        {
            _options = options.Value ?? new QdrantOptions();
            _collectionBaseName = string.IsNullOrWhiteSpace(_options.Collection)
                ? "skillup_subtitles"
                : _options.Collection;
            _defaultVectorSize = _options.DefaultVectorSize > 0 ? _options.DefaultVectorSize : 3072;
            _collectionName = BuildCollectionName(_defaultVectorSize);
            _indexesEnsured = false;
            _httpClient = httpClientFactory.CreateClient(nameof(QdrantService));

            if (_httpClient.BaseAddress is null)
            {
                _httpClient.BaseAddress = new Uri(BuildBaseAddress(_options.Endpoint));
            }

            if (!string.IsNullOrWhiteSpace(_options.ApiKey) &&
                !_httpClient.DefaultRequestHeaders.Contains("api-key"))
            {
                _httpClient.DefaultRequestHeaders.Add("api-key", _options.ApiKey);
            }

            if (_httpClient.DefaultRequestHeaders.Accept.Count == 0)
            {
                _httpClient.DefaultRequestHeaders.Accept.Add(
                    new MediaTypeWithQualityHeaderValue("application/json"));
            }
        }

        public async Task EnsureCollectionAsync(int vectorSize, CancellationToken ct = default)
        {
            await EnsureCollectionExistsIfMissingAsync(vectorSize, ct);
            await EnsurePayloadIndexesAsync(ct);
        }

        public async Task UpsertAsync(IEnumerable<QdrantVectorPoint> points, CancellationToken ct = default)
        {
            var pointList = points.ToList();
            if (pointList.Count == 0)
            {
                return;
            }

            await EnsureCollectionExistsIfMissingAsync(pointList[0].Vector.Length, ct);
            await EnsurePayloadIndexesAsync(ct);

            var name = _collectionName;
            var payload = new
            {
                points = pointList.Select(p => new
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
            float? scoreThreshold = null,
            CancellationToken ct = default)
        {
            var name = _collectionName;
            await EnsurePayloadIndexesAsync(ct);//đánh index
            var limit = topK <= 0 ? 5 : topK;
            var filter = BuildFilter(lessonId, courseId);//filter by lessonId or courseId
            var body = new Dictionary<string, object?>
            {
                ["vector"] = query,
                ["limit"] = limit,
                ["with_payload"] = true //return metadata
            };

            if (filter is not null)
            {
                body["filter"] = filter;
            }

            //send qdrant search 
            var resp = await _httpClient.PostAsJsonAsync($"collections/{name}/points/search", body, ct);
            await EnsureSuccessAsync(resp, "search", ct);//check response


            var json = await resp.Content.ReadFromJsonAsync<QdrantSearchResponse>(cancellationToken: ct)
                       ?? new QdrantSearchResponse();

            var results = json.Result
                .Select(hit => new QdrantVectorHit(
                    hit.Id,
                    hit.Score,
                    hit.Payload.Text, //text gốc
                    new QdrantVectorPayload( //metadata
                        hit.Payload.LessonId,
                        hit.Payload.CourseId,
                        hit.Payload.ChunkIndex,
                        hit.Payload.Text,
                        hit.Payload.Source)))
                .ToList();

            // Filter theo score threshold nếu có
            if (scoreThreshold.HasValue)
            {
                results = results
                    .Where(hit => hit.Score >= scoreThreshold.Value)
                    .ToList();
            }

            return results;
        }

        public async Task<long> CountVectorsAsync(
            Guid? lessonId = null,
            Guid? courseId = null,
            CancellationToken ct = default)
        {
            var name = _collectionName;
            await EnsurePayloadIndexesAsync(ct);
            var filter = BuildFilter(lessonId, courseId);
            var body = new Dictionary<string, object?>
            {
                ["exact"] = false
            };

            if (filter is not null)
            {
                body["filter"] = filter;
            }

            var resp = await _httpClient.PostAsJsonAsync($"collections/{name}/points/count", body, ct);
            if (resp.StatusCode == HttpStatusCode.NotFound)
            {
                return 0;
            }
            await EnsureSuccessAsync(resp, "count", ct);

            var result = await resp.Content.ReadFromJsonAsync<QdrantCountResponse>(cancellationToken: ct);
            return result?.Result.Count ?? 0;
        }

        public async Task<bool> LessonHasVectorsAsync(Guid lessonId, CancellationToken ct = default)
        {
            var count = await CountVectorsAsync(lessonId, null, ct);
            return count > 0;
        }

        public async Task DeleteVectorsAsync(
            Guid? lessonId = null,
            Guid? courseId = null,
            CancellationToken ct = default)
        {
            var filter = BuildFilter(lessonId, courseId);
            if (filter is null)
            {
                throw new ArgumentException("At least lessonId or courseId must be provided to delete vectors.");
            }

            var name = _collectionName;
            await EnsurePayloadIndexesAsync(ct);
            var body = new Dictionary<string, object?>
            {
                ["wait"] = true
            };

            if (filter is not null)
            {
                body["filter"] = filter;
            }

            var resp = await _httpClient.PostAsJsonAsync($"collections/{name}/points/delete", body, ct);
            if (resp.StatusCode == HttpStatusCode.NotFound)
            {
                return;
            }
            await EnsureSuccessAsync(resp, "delete", ct);
        }

        public Task DeleteVectorsByLessonAsync(Guid lessonId, CancellationToken ct = default)
            => DeleteVectorsAsync(lessonId: lessonId, courseId: null, ct: ct);

        public Task DeleteVectorsByCourseAsync(Guid courseId, CancellationToken ct = default)
            => DeleteVectorsAsync(lessonId: null, courseId: courseId, ct: ct);

        public async Task<IReadOnlyList<QdrantVectorPayload>> GetPayloadSamplesAsync(
            Guid? lessonId = null,
            Guid? courseId = null,
            int limit = 10,
            CancellationToken ct = default)
        {
            var name = _collectionName;
            await EnsurePayloadIndexesAsync(ct); //đánh index
            var filter = BuildFilter(lessonId, courseId);//filter by lessonId or courseId
            var clampedLimit = Math.Clamp(limit, 1, 50);
            var body = new Dictionary<string, object?>
            {
                ["limit"] = clampedLimit,
                ["with_payload"] = true,
                ["with_vectors"] = false
            };

            if (filter is not null)
            {
                body["filter"] = filter;
            }

            var resp = await _httpClient.PostAsJsonAsync($"collections/{name}/points/scroll", body, ct);
            if (resp.StatusCode == HttpStatusCode.NotFound)
            {
                return Array.Empty<QdrantVectorPayload>();
            }
            await EnsureSuccessAsync(resp, "scroll", ct);

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

        private static string BuildBaseAddress(string? endpoint)
        {
            var value = string.IsNullOrWhiteSpace(endpoint)
                ? "http://localhost:6333"
                : endpoint;
            return value.TrimEnd('/') + "/";
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

        private async Task EnsureCollectionExistsIfMissingAsync(int? vectorSize, CancellationToken ct)
        {
            var size = vectorSize.HasValue && vectorSize.Value > 0
                ? vectorSize.Value
                : _defaultVectorSize;

            var name = BuildCollectionName(size);
            var collectionChanged = !string.Equals(_collectionName, name, StringComparison.OrdinalIgnoreCase);

            if (collectionChanged)
            {
                _collectionName = name;
                _indexesEnsured = false;
            }

            var check = await _httpClient.GetAsync($"collections/{name}", ct);
            if (check.IsSuccessStatusCode)
            {
                return;
            }

            var body = new
            {
                vectors = new
                {
                    size,
                    distance = "Cosine"
                }
            };

            var resp = await _httpClient.PutAsJsonAsync($"collections/{name}", body, ct);
            resp.EnsureSuccessStatusCode();
            _indexesEnsured = false;
        }

        private async Task EnsurePayloadIndexesAsync(CancellationToken ct)
        {
            if (_indexesEnsured)
            {
                return;
            }

            await EnsureCollectionExistsIfMissingAsync(null, ct);
            await CreateIndexIfNeededAsync("lessonId", "uuid", ct);
            await CreateIndexIfNeededAsync("courseId", "uuid", ct);
            _indexesEnsured = true;
        }

        private async Task CreateIndexIfNeededAsync(string fieldName, string fieldType, CancellationToken ct)
        {
            var name = _collectionName;
            var body = new
            {
                field_name = fieldName,
                field_schema = new
                {
                    type = fieldType
                }
            };

            var resp = await _httpClient.PutAsJsonAsync($"collections/{name}/index", body, ct);

            if (resp.StatusCode == HttpStatusCode.Conflict)
            {
                return;
            }

            await EnsureSuccessAsync(resp, $"index:{fieldName}", ct);
        }

        private static async Task EnsureSuccessAsync(HttpResponseMessage response, string operation, CancellationToken ct)
        {
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            var details = await response.Content.ReadAsStringAsync(ct);
            throw new HttpRequestException($"Qdrant {operation} failed ({(int)response.StatusCode} {response.StatusCode}). Body: {details}");
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

