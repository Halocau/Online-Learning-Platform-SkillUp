namespace SkillUp.BussinessObjects.DTOs.Voucher
{
	public class ValidateVoucherDTO
	{
		public string CouponCode { get; set; } = null!;
		public List<Guid> CourseIds { get; set; } = new List<Guid>();
		public decimal TotalPrice { get; set; }
	}

	public class ValidateVoucherResponseDTO
	{
		public bool IsValid { get; set; }
		public string Message { get; set; } = null!;
		public ViewVoucherDTO? Voucher { get; set; }
		public decimal DiscountAmount { get; set; }
	}
}

