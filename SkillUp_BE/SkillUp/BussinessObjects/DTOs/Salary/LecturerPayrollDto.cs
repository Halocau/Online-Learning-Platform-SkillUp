namespace SkillUp.BussinessObjects.DTOs.Salary
{
	public class LecturerPayrollDto
	{
		public Guid LecturerId { get; set; }
		public string? LecturerName { get; set; }
		public string? ReceiverName { get; set; }
		public string? BankName { get; set; }
		public string? BankNumber { get; set; }
		public decimal TotalRevenue { get; set; } // Gross amount 
		public decimal PlatformFee { get; set; }  // System commission e.g. 20%
		public decimal NetIncome { get; set; }    // Amount to transfer
	}
}
