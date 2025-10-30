using System;

namespace SkillUp.BussinessObjects.DTOs.Comment
{
    public class CreateLikeCommentDto
    {
        public Guid CommentPostId { get; set; }
        // Không cần AccountId — server lấy từ token
    }
}
