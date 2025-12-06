namespace SkillUp.BussinessObjects.DTOs.Subtitle
{
    public class SubtitleChunkDto
    {
        public SubtitleChunkDto(int index, string text, TimeSpan? start = null, TimeSpan? end = null)
        {
            Index = index;
            Text = text;
            Start = start;
            End = end;
        }

        public int Index { get; set; }
        public string Text { get; set; }
        public TimeSpan? Start { get; set; }
        public TimeSpan? End { get; set; }
    }
}

