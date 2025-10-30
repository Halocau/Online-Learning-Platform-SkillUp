namespace SkillUp.BussinessObjects.DTOs.Comment
{
    public class UpdateCommentDto
    {
        public Guid CommentId { get; set; }
        public string Contents { get; set; } = string.Empty;
    }
}
