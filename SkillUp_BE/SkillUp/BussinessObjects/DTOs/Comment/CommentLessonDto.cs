// File: /BussinessObjects/DTOs/Comment/CommentLessonDto.cs
// (Giống CommentPostDto)
namespace SkillUp.BussinessObjects.DTOs.Comment
{
    public class CommentLessonDto
    {
        public Guid Id { get; set; }
        public Guid LessonId { get; set; } // Đổi từ PostId
        public string Contents { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid AccountId { get; set; }
        public string AccountName { get; set; }
        public Guid? ParentCommentId { get; set; }
        public bool IsActive { get; set; }
        public int LikeCount { get; set; }
    }
}