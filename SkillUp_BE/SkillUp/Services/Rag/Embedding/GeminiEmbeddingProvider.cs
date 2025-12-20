using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<GeminiEmbeddingProvider>? _logger;
        private readonly string[] _apiKeys;
        private int _currentKeyIndex = 0;

        public GeminiEmbeddingProvider(
            IHttpClientFactory httpClientFactory,
            IOptions<GeminiOptions> options,
            ILogger<GeminiEmbeddingProvider>? logger = null)
        {
            _options = options.Value ?? new GeminiOptions();
            _logger = logger;

            // Collect all available API keys
            var keys = new List<string>();
            if (!string.IsNullOrWhiteSpace(_options.ApiKey))
            {
                keys.Add(_options.ApiKey);
            }
            if (_options.ApiKeys != null)
            {
                keys.AddRange(_options.ApiKeys.Where(k => !string.IsNullOrWhiteSpace(k)));
            }

            if (keys.Count == 0)
            {
                throw new InvalidOperationException("Gemini:ApiKey or Gemini:ApiKeys is required.");
            }

            _apiKeys = keys.Distinct().ToArray();
            _logger?.LogInformation(
                "GeminiEmbeddingProvider initialized with {KeyCount} API key(s)",
                _apiKeys.Length);

            _httpClient = httpClientFactory.CreateClient(nameof(GeminiEmbeddingProvider));
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add(ApiKeyHeader, _apiKeys[0]);

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

            // Tạo request body theo format Gemini API
            var requestBody = new
            {
                model = $"models/{model}",
                content = new
                {
                    parts = new[] { new { text } }
                }
            };

            var payload = JsonSerializer.Serialize(requestBody, _jsonOptions);
            using var httpContent = new StringContent(payload, Encoding.UTF8, "application/json");

            // Thử với các API keys (retry nếu key hiện tại bị lỗi)
            return await TryWithApiKeysAsync(endpoint, httpContent, ct);
        }

        /// <summary>
        /// Thử gọi API với các API keys khác nhau nếu key hiện tại bị lỗi (403, 429).
        /// </summary>
        private async Task<float[]> TryWithApiKeysAsync(string endpoint, HttpContent httpContent, CancellationToken ct)
        {
            var maxAttempts = _apiKeys.Length;
            Exception? lastException = null;

            for (int attempt = 0; attempt < maxAttempts; attempt++)
            {
                // Đặt API key hiện tại vào header
                SetCurrentApiKey();

                try
                {
                    var response = await _httpClient.PostAsync(endpoint, httpContent, ct);
                    var responseText = await response.Content.ReadAsStringAsync(ct);

                    if (response.IsSuccessStatusCode)
                    {
                        return ParseEmbedding(responseText);
                    }

                    // Nếu lỗi 403 hoặc 429 và còn keys khác, thử key tiếp theo
                    if (ShouldRetryWithNextKey(response.StatusCode, attempt, maxAttempts))
                    {
                        var errorMessage = ExtractErrorMessage(responseText, response.StatusCode);
                        _logger?.LogWarning(
                            "API key failed ({StatusCode}): {ErrorMessage}. Switching to next key ({Attempt}/{MaxAttempts})",
                            response.StatusCode, errorMessage, attempt + 1, maxAttempts);
                        
                        SwitchToNextKey();
                        continue;
                    }

                    // Lỗi khác hoặc hết keys, throw exception
                    var message = ExtractErrorMessage(responseText, response.StatusCode);
                    throw new HttpRequestException(message);
                }
                catch (HttpRequestException ex) when (CanRetry(attempt, maxAttempts))
                {
                    lastException = ex;
                    _logger?.LogWarning(
                        "Request failed with key {KeyIndex}: {Error}. Retrying with next key...",
                        _currentKeyIndex, ex.Message);
                    
                    SwitchToNextKey();
                }
            }

            // Tất cả keys đều thất bại
            throw lastException ?? new HttpRequestException("All API keys failed.");
        }

        private void SetCurrentApiKey()
        {
            var currentKey = _apiKeys[_currentKeyIndex];
            _httpClient.DefaultRequestHeaders.Remove(ApiKeyHeader);
            _httpClient.DefaultRequestHeaders.Add(ApiKeyHeader, currentKey);
        }

        private void SwitchToNextKey()
        {
            _currentKeyIndex = (_currentKeyIndex + 1) % _apiKeys.Length;
        }

        private bool ShouldRetryWithNextKey(System.Net.HttpStatusCode statusCode, int attempt, int maxAttempts)
        {
            return (statusCode == System.Net.HttpStatusCode.Forbidden ||
                    statusCode == System.Net.HttpStatusCode.TooManyRequests) &&
                   _apiKeys.Length > 1 &&
                   attempt < maxAttempts - 1;
        }

        private bool CanRetry(int attempt, int maxAttempts)
        {
            return attempt < maxAttempts - 1 && _apiKeys.Length > 1;
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
                if (value.ValueKind != JsonValueKind.Number) // check numeric
                {
                    throw new JsonException("Gemini embedding value is not numeric.");
                }
                list.Add(value.GetSingle());//jsonelement -> float
            }

            return list.ToArray();
        }
    }
}

