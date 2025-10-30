using System;

namespace SkillUp.BussinessObjects.DTOs.Comment
{
    public class LikeCommentDto
    {
        public int Id { get; set; }
        public Guid CommentPostId { get; set; }
        public Guid AccountId { get; set; }
        public bool Status { get; set; }
    }
}
