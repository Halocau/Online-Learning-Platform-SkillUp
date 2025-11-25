using SkillUp.BussinessObjects.DTOs.Subtitle;
using SkillUp.Configuration;

namespace SkillUp.Services.Rag.Subtitle
{
    public static class SubtitleChunker
    {
        public static IEnumerable<SubtitleChunkDto> Chunk(string text, RagOptions options)
        {
            if (string.IsNullOrWhiteSpace(text))
                yield break;

            var chunkSize = Math.Max(100, options.ChunkSize);
            var overlap = Math.Clamp(options.ChunkOverlap, 0, chunkSize - 1);
            var step = chunkSize - overlap;

            int index = 0;
            for (int start = 0; start < text.Length; start += step)
            {
                var length = Math.Min(chunkSize, text.Length - start);
                var chunkText = text.Substring(start, length);
                yield return new SubtitleChunkDto(index++, chunkText);
                if (start + length >= text.Length)
                    break;
            }
        }
    }
}

