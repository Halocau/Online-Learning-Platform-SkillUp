using SkillUp.BussinessObjects.Models;

namespace SkillUp.BussinessObjects.DTOs.Common
{
    // Class này dùng để trả về kết quả từ Repository
    public class LikeInteractionResult
    {
        // Bản thân đối tượng Like (với Status: true/false)
        public LikeCommentPost Like { get; set; }

        // Cờ (flag) này là chìa khóa: true nếu đây là lần đầu tiên
        public bool IsFirstLike { get; set; }
    }
}