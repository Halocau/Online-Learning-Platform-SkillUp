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

        public GeminiChatCompletionProvider(
            IHttpClientFactory httpClientFactory,
            IOptions<GeminiOptions> options,
            ILogger<GeminiChatCompletionProvider> logger)
        {
            _options = options.Value ?? new GeminiOptions();
            if (string.IsNullOrWhiteSpace(_options.ApiKey))
            {
                throw new InvalidOperationException("Gemini:ApiKey is required.");
            }

            _httpClient = httpClientFactory.CreateClient(nameof(GeminiChatCompletionProvider));
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add(ApiKeyHeader, _options.ApiKey);
            _logger = logger;

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

            var response = await _httpClient.PostAsync(endpoint, httpContent, ct);
            var responseText = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                var message = ExtractErrorMessage(responseText, response.StatusCode);
                throw new HttpRequestException(message);
            }

            return ParseResponse(responseText);
        }

        private static string BuildSystemPrompt(string context)
        {
            return $@"Bạn là trợ lý AI hỗ trợ học viên học tập. Dựa trên nội dung phụ đề video bài học dưới đây, hãy trả lời câu hỏi của học viên một cách chính xác và hữu ích.

Nội dung phụ đề:
{context}

Lưu ý:
- Chỉ trả lời dựa trên nội dung phụ đề được cung cấp
- Nếu câu hỏi không liên quan đến nội dung bài học, hãy lịch sự thông báo
- Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu";
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
                    
                    // Check finishReason
                    if (candidate.TryGetProperty("finishReason", out var finishReason))
                    {
                        var reason = finishReason.GetString();
                        if (reason != "STOP" && reason != null)
                        {
                            _logger.LogWarning("Gemini response blocked or incomplete. FinishReason: {FinishReason}", reason);
                            if (reason == "SAFETY")
                            {
                                return "Xin lỗi, câu hỏi của bạn có thể vi phạm chính sách nội dung. Vui lòng thử lại với câu hỏi khác.";
                            }
                            if (reason == "MAX_TOKENS")
                            {
                                return "Câu trả lời quá dài. Vui lòng hỏi câu hỏi cụ thể hơn.";
                            }
                            return "Không thể tạo phản hồi đầy đủ. Vui lòng thử lại.";
                        }
                    }

                    string? finishReasonText = null;
                    if (candidate.TryGetProperty("finishReason", out var finishReason))
                    {
                        finishReasonText = finishReason.GetString();
                        if (finishReasonText == "SAFETY")
                        {
                            _logger.LogWarning("Gemini blocked response due to safety filter.");
                            return "Xin lỗi, câu hỏi này có thể vi phạm chính sách nội dung. Vui lòng thử lại với câu hỏi khác.";
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
                                    if (!string.IsNullOrEmpty(finishReasonText) && finishReasonText != "STOP")
                                    {
                                        if (finishReasonText == "MAX_TOKENS")
                                        {
                                            return $"{text.Trim()}\n\n_(Phản hồi đã được cắt ngắn do vượt giới hạn. Vui lòng hỏi cụ thể hơn nếu cần thêm thông tin.)_";
                                        }

                                        _logger.LogWarning("Gemini finishReason={FinishReason}", finishReasonText);
                                        return text.Trim();
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

