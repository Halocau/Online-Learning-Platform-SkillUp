using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillUp.Configuration;

namespace SkillUp.Services.Rag.Embedding
{
    public class OllamaEmbeddingProvider : IEmbeddingProvider
    {
        private readonly HttpClient _httpClient;
        private readonly OllamaOptions _options;
        private readonly JsonSerializerOptions _jsonOptions;
        private readonly ILogger<OllamaEmbeddingProvider> _logger;

        public OllamaEmbeddingProvider(
            IHttpClientFactory httpClientFactory,
            IOptions<OllamaOptions> options,
            ILogger<OllamaEmbeddingProvider> logger)
        {
            _options = options.Value ?? new OllamaOptions();
            _logger = logger;

            var baseUrl = string.IsNullOrWhiteSpace(_options.BaseUrl)
                ? "http://localhost:11434"
                : _options.BaseUrl.TrimEnd('/');

            _httpClient = httpClientFactory.CreateClient(nameof(OllamaEmbeddingProvider));
            _httpClient.BaseAddress = new Uri(baseUrl + "/");
            _httpClient.Timeout = TimeSpan.FromMinutes(2); // Embedding thường nhanh hơn chat

            // JSON options for parsing response (case insensitive)
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
                // Không dùng CamelCase vì Ollama API yêu cầu lowercase property names
            };
        }

        public async Task<float[]> EmbedAsync(string text, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                throw new ArgumentException("Text cannot be null or empty", nameof(text));
            }

            var model = string.IsNullOrWhiteSpace(_options.EmbeddingModel)
                ? "nomic-embed-text"
                : _options.EmbeddingModel;

            // Ollama API yêu cầu property names là lowercase (model, input)
            var requestBody = new
            {
                model = model,
                input = text
            };

            try
            {
                // Giữ nguyên property names (không dùng CamelCase) vì Ollama yêu cầu lowercase
                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = null
                };
                
                using var response = await _httpClient.PostAsJsonAsync(
                    "/api/embed",
                    requestBody,
                    jsonOptions,
                    ct);

                var payload = await response.Content.ReadAsStringAsync(ct);

                if (!response.IsSuccessStatusCode)
                {
                    var error = ExtractErrorMessage(payload, response.StatusCode);
                    _logger.LogError("Ollama embedding API returned {StatusCode}: {Error}", response.StatusCode, error);
                    throw new HttpRequestException(error);
                }

                return ParseEmbedding(payload);
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ollama embedding failed for text length {TextLength}", text.Length);
                throw;
            }
        }

        /// <summary>
        /// Parse embedding vector từ JSON response của Ollama API.
        /// Hỗ trợ các format: "embedding", "embeddings", hoặc array trực tiếp.
        /// </summary>
        private static float[] ParseEmbedding(string payload)
        {
            if (string.IsNullOrWhiteSpace(payload))
            {
                throw new JsonException("Ollama embedding response is empty");
            }

            try
            {
                using var doc = JsonDocument.Parse(payload);
                var root = doc.RootElement;

                // Format 1: Single embedding array
                if (root.TryGetProperty("embedding", out var embeddingElement))
                {
                    return ExtractValues(embeddingElement);
                }

                // Format 2: Array of embeddings (lấy phần tử đầu tiên)
                if (root.TryGetProperty("embeddings", out var embeddingsElement)
                    && embeddingsElement.ValueKind == JsonValueKind.Array
                    && embeddingsElement.GetArrayLength() > 0)
                {
                    return ExtractValues(embeddingsElement[0]);
                }

                // Format 3: Root element là array trực tiếp
                if (root.ValueKind == JsonValueKind.Array)
                {
                    return ExtractValues(root);
                }

                throw new JsonException("Ollama response missing embedding array.");
            }
            catch (JsonException ex)
            {
                throw new JsonException($"Failed to parse Ollama embedding response: {ex.Message}", ex);
            }
        }

        private static float[] ExtractValues(JsonElement embeddingElement)
        {
            if (embeddingElement.ValueKind != JsonValueKind.Array)
            {
                throw new JsonException("Ollama embedding is not an array.");
            }

            var list = new List<float>();
            foreach (var value in embeddingElement.EnumerateArray())
            {
                if (value.ValueKind != JsonValueKind.Number)
                {
                    throw new JsonException("Ollama embedding value is not numeric.");
                }
                list.Add(value.GetSingle());
            }

            if (list.Count == 0)
            {
                throw new JsonException("Ollama embedding array is empty.");
            }

            return list.ToArray();
        }

        private static string ExtractErrorMessage(string payload, System.Net.HttpStatusCode statusCode)
        {
            if (string.IsNullOrWhiteSpace(payload))
            {
                return $"Ollama embedding API returned {statusCode}";
            }

            try
            {
                using var doc = JsonDocument.Parse(payload);
                var root = doc.RootElement;

                if (root.TryGetProperty("error", out var error))
                {
                    var msg = error.ValueKind == JsonValueKind.String
                        ? error.GetString()
                        : error.TryGetProperty("message", out var em) ? em.GetString() : error.ToString();
                    return $"Ollama embedding API error ({statusCode}): {msg}";
                }
            }
            catch (JsonException)
            {
                // ignore parsing errors
            }

            return $"Ollama embedding API returned {statusCode}: {payload}";
        }
    }
}

