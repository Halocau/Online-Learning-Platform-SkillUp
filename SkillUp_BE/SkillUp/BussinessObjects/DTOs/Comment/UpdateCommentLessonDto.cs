// File: /BussinessObjects/DTOs/Comment/UpdateCommentLessonDto.cs
// (Giống UpdateCommentDto)
namespace SkillUp.BussinessObjects.DTOs.Comment
{
    public class UpdateCommentLessonDto
    {
        public Guid CommentId { get; set; }
        public string Contents { get; set; }
    }
}