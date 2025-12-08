namespace SkillUp.BussinessObjects.DTOs
{
    // Dùng cho Create và Update
    public class VoucherTypeRequest
    {
        public string Name { get; set; } = null!;
        public int Percentage { get; set; }
    }
}