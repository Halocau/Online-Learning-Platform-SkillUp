

namespace SkillUp.BussinessObjects.DTOs.Like
{
    public class LikeCommentLessonResponseDto
    {
        public Guid CommentLessonId { get; set; }
        public int LikeCount { get; set; }
        public bool UserLikedStatus { get; set; } 
    }
}