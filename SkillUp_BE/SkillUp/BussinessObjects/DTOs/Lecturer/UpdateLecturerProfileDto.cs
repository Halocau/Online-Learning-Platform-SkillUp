using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Lecturer
{
    public class UpdateLecturerProfileDto
    {
        [StringLength(100, ErrorMessage = "Title không được quá 100 ký tự")]
        public string? Title { get; set; }

        [StringLength(100, ErrorMessage = "Profession không được quá 100 ký tự")]
        public string? Profession { get; set; }

        // --- CẬP NHẬT TẠI ĐÂY ---
        [RegularExpression(@"^\d+$", ErrorMessage = "Số tài khoản ngân hàng chỉ được phép chứa các ký tự số.")]
        [StringLength(20, MinimumLength = 1, ErrorMessage = "Số tài khoản phải từ 1 đến 20 số.")] 
        public string? BankNumber { get; set; }

        public string? BankName { get; set; }

        public string? ReceiverName { get; set; }
    }
}