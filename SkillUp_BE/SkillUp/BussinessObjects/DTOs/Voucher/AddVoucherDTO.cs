namespace SkillUp.BussinessObjects.DTOs.Voucher
{
	public class AddVoucherDTO
	{
		public Guid? CourseId { get; set; }

		public int VoucherType { get; set; }

		public string CouponCode { get; set; } = null!;

		public DateTime? StartTime { get; set; }

		public DateTime? EndTime { get; set; }

		public decimal Price { get; set; }
	}
}
