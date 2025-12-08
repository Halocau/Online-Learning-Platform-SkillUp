using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.DTOs.GenSub
{
    public class GenSubResultDto
    {
        /// <summary>
        /// Subtitle format returned by GenSub (text, vtt, srt).
        /// </summary>
        public string Format { get; set; } = "text";

        /// <summary>
        /// Optional filename provided by the GenSub API (from Content-Disposition).
        /// </summary>
        public string? FileName { get; set; }

        /// <summary>
        /// UTF-8 text content (only populated when the format is text-based).
        /// </summary>
        public string? TextContent { get; set; }

        /// <summary>
        /// Raw bytes of the subtitle file (useful for storing VTT/SRT).
        /// </summary>
        public byte[] Data { get; set; } = Array.Empty<byte>();

        /// <summary>
        /// Response headers from GenSub (diagnostics/metrics).
        /// </summary>
        public Dictionary<string, string> Headers { get; set; } = new();
    }
}

