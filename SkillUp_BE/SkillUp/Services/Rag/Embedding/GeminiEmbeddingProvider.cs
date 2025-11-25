using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using SkillUp.Configuration;

namespace SkillUp.Services.Rag.Embedding
{
    public class GeminiEmbeddingProvider : IEmbeddingProvider
    {
        private const string BaseUrl = "https://generativelanguage.googleapis.com/v1beta";
        private const string ApiKeyHeader = "x-goog-api-key";

        private readonly HttpClient _httpClient;
        private readonly GeminiOptions _options;
        private readonly JsonSerializerOptions _jsonOptions;

        public GeminiEmbeddingProvider(IHttpClientFactory httpClientFactory, IOptions<GeminiOptions> options)
        {
            _options = options.Value ?? new GeminiOptions();
            if (string.IsNullOrWhiteSpace(_options.ApiKey))
            {
                throw new InvalidOperationException("Gemini:ApiKey is required.");
            }

            _httpClient = httpClientFactory.CreateClient(nameof(GeminiEmbeddingProvider));
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add(ApiKeyHeader, _options.ApiKey);

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };
        }

        public async Task<float[]> EmbedAsync(string text, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                throw new ArgumentException("Text cannot be null or empty", nameof(text));
            }

            var model = string.IsNullOrWhiteSpace(_options.EmbeddingModel)
                ? "gemini-embedding-001"
                : _options.EmbeddingModel;

            var endpoint = $"{BaseUrl}/models/{model}:embedContent";
            var requestBody = new
            {
                model = $"models/{model}",
                content = new
                {
                    parts = new[]
                    {
                        new { text }
                    }
                }
            };

            var payload = JsonSerializer.Serialize(requestBody, _jsonOptions);
            using var httpContent = new StringContent(payload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(endpoint, httpContent, ct);
            var responseText = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                var message = ExtractErrorMessage(responseText, response.StatusCode);
                throw new HttpRequestException(message);
            }

            return ParseEmbedding(responseText);
        }

        private static string ExtractErrorMessage(string payload, System.Net.HttpStatusCode statusCode)
        {
            if (string.IsNullOrWhiteSpace(payload))
            {
                return $"Gemini API returned {statusCode}";
            }

            try
            {
                using var doc = JsonDocument.Parse(payload);
                if (doc.RootElement.TryGetProperty("error", out var error))
                {
                    if (error.TryGetProperty("message", out var messageElement))
                    {
                        return $"Gemini API error ({statusCode}): {messageElement.GetString()}";
                    }
                }
            }
            catch (JsonException)
            {
                // ignore parsing errors
            }

            return $"Gemini API returned {statusCode}: {payload}";
        }

        private static float[] ParseEmbedding(string payload)
        {
            using var doc = JsonDocument.Parse(payload);
            var root = doc.RootElement;

            if (root.TryGetProperty("embedding", out var embedding))
            {
                return ExtractValues(embedding);
            }

            if (root.TryGetProperty("embeddings", out var embeddingsArray)
                && embeddingsArray.ValueKind == JsonValueKind.Array
                && embeddingsArray.GetArrayLength() > 0)
            {
                return ExtractValues(embeddingsArray[0]);
            }

            throw new JsonException("Gemini response missing embedding values.");
        }

        private static float[] ExtractValues(JsonElement embeddingElement)
        {
            if (!embeddingElement.TryGetProperty("values", out var valuesElement)
                || valuesElement.ValueKind != JsonValueKind.Array)
            {
                throw new JsonException("Gemini embedding values missing.");
            }

            var list = new List<float>();
            foreach (var value in valuesElement.EnumerateArray())
            {
                if (value.ValueKind != JsonValueKind.Number)
                {
                    throw new JsonException("Gemini embedding value is not numeric.");
                }
                list.Add(value.GetSingle());
            }

            return list.ToArray();
        }
    }
}

