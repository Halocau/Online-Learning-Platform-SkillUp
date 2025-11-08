// File: /BussinessObjects/DTOs/Comment/CreateCommentLessonDto.cs
// (Giống CreateCommentDto)
namespace SkillUp.BussinessObjects.DTOs.Comment
{
    public class CreateCommentLessonDto
    {
        public Guid LessonId { get; set; } // Đổi từ PostId
        public string Contents { get; set; }
        public Guid? ParentCommentId { get; set; }
    }
}