namespace SkillUp.BussinessObjects.DTOs.LecturerApplication
{
    public class UpdateStatusRequestDto
    {
        public bool Status { get; set; } // true = Accepted, false = Rejected
        public string Reason { get; set; } // lý do từ chối
    }
}
