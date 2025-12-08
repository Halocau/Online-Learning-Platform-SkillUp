namespace SkillUp.BussinessObjects.DTOs
{

    public class VoucherTypeResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int Percentage { get; set; }
        public bool IsActive { get; set; }
    }
}