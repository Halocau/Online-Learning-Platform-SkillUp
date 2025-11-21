namespace SkillUp.BussinessObjects.DTOs.Voucher
{
	public class ViewVoucherDTO
	{
		public Guid Id { get; set; }
		public Guid? CourseId { get; set; }

		public int VoucherType { get; set; }

		public string CouponCode { get; set; } = null!;

		public DateTime? StartTime { get; set; }

		public DateTime? EndTime { get; set; }

		public decimal Price { get; set; }

		public bool IsActive { get; set; }
		
		// Thêm thông tin percentage để frontend có thể tính discount
		public int? Percentage { get; set; }
	}
}
