namespace SkillUp.BussinessObjects.DTOs.Comment
{
    public class CreateCommentDto
    {
        public Guid PostId { get; set; }
        public string Contents { get; set; } = string.Empty;
        public Guid? ParentCommentId { get; set; }
    }

}
