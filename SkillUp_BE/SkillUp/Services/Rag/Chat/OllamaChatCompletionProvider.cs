using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SkillUp.Configuration;

namespace SkillUp.Services.Rag.Chat
{
    public class OllamaChatCompletionProvider : IChatCompletionProvider
    {
        private readonly HttpClient _httpClient;
        private readonly OllamaOptions _options;
        private readonly JsonSerializerOptions _jsonOptions;
        private readonly ILogger<OllamaChatCompletionProvider> _logger;

        public OllamaChatCompletionProvider(
            IHttpClientFactory httpClientFactory,
            IOptions<OllamaOptions> options,
            ILogger<OllamaChatCompletionProvider> logger)
        {
            _options = options.Value ?? new OllamaOptions();
            _logger = logger;

            var baseUrl = string.IsNullOrWhiteSpace(_options.BaseUrl)
                ? "http://localhost:11434"
                : _options.BaseUrl.TrimEnd('/');

            _httpClient = httpClientFactory.CreateClient(nameof(OllamaChatCompletionProvider));
            _httpClient.BaseAddress = new Uri(baseUrl + "/");
            _httpClient.Timeout = TimeSpan.FromMinutes(5); // Ollama có thể mất thời gian để xử lý

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
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

            var systemPrompt = BuildSystemPrompt(context);

            var requestBody = new
            {
                model = string.IsNullOrWhiteSpace(_options.ChatModel)
                    ? "llama2:7b-chat-q4_0"
                    : _options.ChatModel,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userQuestion }
                },
                stream = false,
                options = new
                {
                    temperature = _options.Temperature,
                    top_p = _options.TopP,
                    num_predict = _options.MaxTokens
                }
            };

            try
            {
                using var response = await _httpClient.PostAsJsonAsync(
                    "/api/chat",
                    requestBody,
                    _jsonOptions,
                    ct);

                var payload = await response.Content.ReadAsStringAsync(ct);

                if (!response.IsSuccessStatusCode)
                {
                    var error = ExtractErrorMessage(payload, response.StatusCode);
                    throw new HttpRequestException(error);
                }

                return ParseResponse(payload);
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ollama chat completion failed");
                throw;
            }
        }

        private static string BuildSystemPrompt(string context)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Bạn là trợ lý AI tên là SkillUp hỗ trợ học viên học tập.");
            builder.AppendLine("Dựa trên nội dung phụ đề video bài học dưới đây, hãy trả lời câu hỏi của học viên một cách chính xác và hữu ích.");
            builder.AppendLine();
            builder.AppendLine("Nội dung phụ đề:");
            builder.AppendLine(context ?? string.Empty);
            builder.AppendLine();
            builder.AppendLine("Lưu ý:");
            builder.AppendLine("- Chỉ trả lời dựa trên nội dung phụ đề được cung cấp");
            builder.AppendLine("- Nếu câu hỏi không liên quan đến nội dung bài học, hãy lịch sự thông báo");
            builder.AppendLine("- Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu");
            builder.AppendLine("- Trả lời liền mạch, không chia thành nhiều phần");
            builder.AppendLine("- Không sử dụng markdown formatting như **bold** hoặc ký tự đặc biệt để làm nổi bật");

            return builder.ToString();
        }

        private string ParseResponse(string payload)
        {
            if (string.IsNullOrWhiteSpace(payload))
            {
                return "Xin lỗi, không nhận được phản hồi từ mô hình.";
            }

            try
            {
                using var doc = JsonDocument.Parse(payload);
                var root = doc.RootElement;

                if (root.TryGetProperty("message", out var message))
                {
                    if (message.TryGetProperty("content", out var contentElement))
                    {
                        var text = contentElement.GetString();
                        if (!string.IsNullOrWhiteSpace(text))
                        {
                            return text;
                        }
                    }
                }

                if (root.TryGetProperty("error", out var error))
                {
                    var msg = error.TryGetProperty("message", out var em)
                        ? em.GetString()
                        : error.ToString();
                    throw new HttpRequestException($"Ollama API error: {msg}");
                }
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse Ollama response");
                throw new HttpRequestException("Không thể phân tích phản hồi từ Ollama.");
            }

            return "Xin lỗi, không tìm thấy nội dung trả lời phù hợp.";
        }

        private static string ExtractErrorMessage(string payload, System.Net.HttpStatusCode statusCode)
        {
            if (string.IsNullOrWhiteSpace(payload))
            {
                return $"Ollama API returned {statusCode}";
            }

            try
            {
                using var doc = JsonDocument.Parse(payload);
                var root = doc.RootElement;

                if (root.TryGetProperty("error", out var error))
                {
                    if (error.ValueKind == JsonValueKind.String)
                    {
                        return $"Ollama API error ({statusCode}): {error.GetString()}";
                    }

                    if (error.TryGetProperty("message", out var message))
                    {
                        return $"Ollama API error ({statusCode}): {message.GetString()}";
                    }
                }
            }
            catch (JsonException)
            {
                // ignore
            }

            return $"Ollama API returned {statusCode}: {payload}";
        }
    }
}


