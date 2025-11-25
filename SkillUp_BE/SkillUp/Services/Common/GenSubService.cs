using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using SkillUp.BussinessObjects.DTOs.GenSub;
using SkillUp.Configuration;

namespace SkillUp.Services.Common
{
    public class GenSubService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly GenSubOptions _options;
        private readonly ILogger<GenSubService> _logger;

        public GenSubService(
            IHttpClientFactory httpClientFactory,
            IOptions<GenSubOptions> options,
            ILogger<GenSubService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _options = options.Value ?? new GenSubOptions();
            _logger = logger;
        }

        public async Task<GenSubResultDto> GenerateFromUrlAsync(
            string videoUrl,
            string? format = null,
            bool? aiCorrect = null,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(videoUrl))
            {
                throw new ArgumentException("VideoUrl is required", nameof(videoUrl));
            }

            var fmt = string.IsNullOrWhiteSpace(format) ? _options.DefaultFormat : format!;
            if (fmt != "text" && fmt != "vtt" && fmt != "srt")
            {
                throw new ArgumentException("Format must be text, vtt, or srt", nameof(format));
            }

            var client = _httpClientFactory.CreateClient(nameof(GenSubService));
            client.BaseAddress = new Uri(_options.BaseUrl.TrimEnd('/') + "/");

            var query = new Dictionary<string, string?>
            {
                ["videoUrl"] = videoUrl,
                ["fmt"] = fmt,
                ["ai_correct"] = (aiCorrect ?? _options.AiCorrection) ? "true" : "false",
            };

            var requestUri = QueryHelpers.AddQueryString("api/gensub-url", query!);

            using var request = new HttpRequestMessage(HttpMethod.Post, requestUri);
            var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorPayload = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("GenSub returned {StatusCode}: {Body}", response.StatusCode, errorPayload);
                throw new InvalidOperationException($"GenSub request failed with status {response.StatusCode}");
            }

            var payload = await response.Content.ReadAsByteArrayAsync(cancellationToken);
            var headers = CollectHeaders(response);

            string? contentDispositionFileName = response.Content.Headers.ContentDisposition?.FileName?.Trim('"');
            string? textContent = null;

            if (fmt.Equals("text", StringComparison.OrdinalIgnoreCase))
            {
                textContent = Encoding.UTF8.GetString(payload);
            }

            return new GenSubResultDto
            {
                Format = fmt,
                FileName = contentDispositionFileName,
                TextContent = textContent,
                Data = payload,
                Headers = headers
            };
        }

        private static Dictionary<string, string> CollectHeaders(HttpResponseMessage response)
        {
            var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            foreach (var header in response.Headers)
            {
                dict[header.Key] = string.Join(",", header.Value);
            }

            foreach (var header in response.Content.Headers)
            {
                dict[header.Key] = string.Join(",", header.Value);
            }

            return dict;
        }
    }
}

