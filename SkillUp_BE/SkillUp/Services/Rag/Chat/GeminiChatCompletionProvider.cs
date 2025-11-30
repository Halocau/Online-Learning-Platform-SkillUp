using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillUp.Configuration;

namespace SkillUp.Services.Rag.Chat
{
    public class GeminiChatCompletionProvider : IChatCompletionProvider
    {
        private const string BaseUrl = "https://generativelanguage.googleapis.com/v1beta";
        private const string ApiKeyHeader = "x-goog-api-key";

        private readonly HttpClient _httpClient;
        private readonly GeminiOptions _options;
        private readonly JsonSerializerOptions _jsonOptions;
        private readonly ILogger<GeminiChatCompletionProvider> _logger;
        private readonly string[] _apiKeys;
        private int _currentKeyIndex = 0;

        public GeminiChatCompletionProvider(
            IHttpClientFactory httpClientFactory,
            IOptions<GeminiOptions> options,
            ILogger<GeminiChatCompletionProvider> logger)
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
            _logger.LogInformation(
                "GeminiChatCompletionProvider initialized with {KeyCount} API key(s)",
                _apiKeys.Length);

            _httpClient = httpClientFactory.CreateClient(nameof(GeminiChatCompletionProvider));
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add(ApiKeyHeader, _apiKeys[0]);

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };
        }

        public async Task<string> GenerateResponseAsync(
            string userQuestion,
            string context,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(userQuestion))
            {
                throw new ArgumentException("User question cannot be null or empty", nameof(userQuestion));
            }

            var model = string.IsNullOrWhiteSpace(_options.ChatModel)
                ? "gemini-2.5-flash"
                : _options.ChatModel;

            var endpoint = $"{BaseUrl}/models/{model}:generateContent";

            var systemPrompt = BuildSystemPrompt(context);
            var combinedPrompt = $"{systemPrompt}\n\nCâu hỏi: {userQuestion}";
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = combinedPrompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = _options.Temperature,
                    maxOutputTokens = _options.MaxOutputTokens,
                    topP = _options.TopP
                }
            };

            var payload = JsonSerializer.Serialize(requestBody, _jsonOptions);
            using var httpContent = new StringContent(payload, Encoding.UTF8, "application/json");

            // Retry with different keys if needed
            var maxAttempts = _apiKeys.Length;
            Exception? lastException = null;

            for (int attempt = 0; attempt < maxAttempts; attempt++)
            {
                var currentKey = _apiKeys[_currentKeyIndex];
                _httpClient.DefaultRequestHeaders.Remove(ApiKeyHeader);
                _httpClient.DefaultRequestHeaders.Add(ApiKeyHeader, currentKey);

                try
                {
                    var response = await _httpClient.PostAsync(endpoint, httpContent, ct);
                    var responseText = await response.Content.ReadAsStringAsync(ct);

                    if (response.IsSuccessStatusCode)
                    {
                        return ParseResponse(responseText);
                    }

                    // Check if we should retry with another key
                    if ((response.StatusCode == System.Net.HttpStatusCode.Forbidden ||
                         response.StatusCode == System.Net.HttpStatusCode.TooManyRequests) &&
                        _apiKeys.Length > 1 && attempt < maxAttempts - 1)
                    {
                        var errorMessage = ExtractErrorMessage(responseText, response.StatusCode);
                        _logger.LogWarning(
                            "API key failed ({StatusCode}): {ErrorMessage}. Switching to another key (attempt {Attempt}/{MaxAttempts})",
                            response.StatusCode,
                            errorMessage,
                            attempt + 1,
                            maxAttempts);

                        // Switch to next key
                        _currentKeyIndex = (_currentKeyIndex + 1) % _apiKeys.Length;
                        continue;
                    }

                    // Final failure or non-retryable error
                    var message = ExtractErrorMessage(responseText, response.StatusCode);
                    throw new HttpRequestException(message);
                }
                catch (HttpRequestException ex) when (attempt < maxAttempts - 1 && _apiKeys.Length > 1)
                {
                    lastException = ex;
                    _logger.LogWarning(
                        "Request failed with key {KeyIndex}: {Error}. Retrying with another key...",
                        _currentKeyIndex,
                        ex.Message);

                    // Switch to next key
                    _currentKeyIndex = (_currentKeyIndex + 1) % _apiKeys.Length;
                }
            }

            // All keys failed
            throw lastException ?? new HttpRequestException("All API keys failed.");
        }

        private static string BuildSystemPrompt(string context)
        {
            return $@"Bạn là trợ lý AI tên là SkillUp hỗ trợ học viên học tập. Dựa trên nội dung phụ đề video bài học dưới đây, hãy trả lời câu hỏi của học viên một cách chính xác và hữu ích.

Nội dung phụ đề:
{context}

Lưu ý:
- Chỉ trả lời dựa trên nội dung phụ đề được cung cấp
- Nếu câu hỏi không liên quan đến nội dung bài học, hãy lịch sự thông báo
- Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu
- Nếu câu trả lời dài hơn ~6 câu, hãy chia thành tối đa 2 phần, dùng định dạng ""Phần 1/2: ..."" và ""Phần 2/2: ..."" để học viên dễ theo dõi";
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

        private string ParseResponse(string payload)
        {
            try
            {
                using var doc = JsonDocument.Parse(payload);
                var root = doc.RootElement;

                // Check for error in response
                if (root.TryGetProperty("error", out var error))
                {
                    var errorMessage = error.TryGetProperty("message", out var msg) 
                        ? msg.GetString() 
                        : "Unknown error from Gemini API";
                    _logger.LogError("Gemini API error: {ErrorMessage}", errorMessage);
                    throw new HttpRequestException($"Gemini API error: {errorMessage}");
                }

                if (root.TryGetProperty("candidates", out var candidates)
                    && candidates.ValueKind == JsonValueKind.Array
                    && candidates.GetArrayLength() > 0)
                {
                    var candidate = candidates[0];

                    string? finishReasonText = null;
                    bool isTruncated = false;
                    if (candidate.TryGetProperty("finishReason", out var finishReason))
                    {
                        finishReasonText = finishReason.GetString();
                        if (finishReasonText == "SAFETY")
                        {
                            _logger.LogWarning("Gemini blocked response due to safety filter.");
                            return "Xin lỗi, câu hỏi này có thể vi phạm chính sách nội dung. Vui lòng thử lại với câu hỏi khác.";
                        }
                        
                        // Kiểm tra nếu response bị cắt do đạt giới hạn token
                        if (finishReasonText == "MAX_TOKENS")
                        {
                            isTruncated = true;
                            _logger.LogWarning("Gemini response was truncated due to MAX_TOKENS limit. Consider increasing MaxOutputTokens or splitting the response.");
                        }
                    }

                    if (candidate.TryGetProperty("content", out var content))
                    {
                        if (content.TryGetProperty("parts", out var parts)
                            && parts.ValueKind == JsonValueKind.Array
                            && parts.GetArrayLength() > 0)
                        {
                            var firstPart = parts[0];
                            if (firstPart.TryGetProperty("text", out var textElement))
                            {
                                var text = textElement.GetString();
                                if (!string.IsNullOrWhiteSpace(text))
                                {
                                    // Thêm thông báo nếu response bị cắt
                                    if (isTruncated)
                                    {
                                        return text + "\n\n[Lưu ý: Câu trả lời có thể đã bị cắt do giới hạn độ dài. Nếu cần thêm thông tin, vui lòng đặt câu hỏi cụ thể hơn.]";
                                    }
                                    return text;
                                }
                            }
                        }
                    }
                }

                // Log the actual response for debugging
                _logger.LogWarning("Gemini response missing text content. Response: {Response}", payload);
                return "Không thể tạo phản hồi từ AI. Vui lòng thử lại sau.";
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse Gemini response. Payload: {Payload}", payload);
                throw new JsonException($"Gemini response parsing failed: {ex.Message}", ex);
            }
        }
    }
}

