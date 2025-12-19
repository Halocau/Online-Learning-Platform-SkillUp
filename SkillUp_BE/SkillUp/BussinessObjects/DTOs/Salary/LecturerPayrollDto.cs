namespace SkillUp.BussinessObjects.DTOs.Salary
{
	public class LecturerPayrollDto
	{
		public Guid LecturerId { get; set; }
		public string? LecturerName { get; set; }
		public string? ReceiverName { get; set; }
		public string? BankName { get; set; }
		public string? BankNumber { get; set; }

		public double TotalRevenue { get; set; } // Gross amount 
		public double PlatformFee { get; set; }  // System commission e.g. 20%

		public double LecturerIncome { get; set; }    // Amount to transfer
		public double? CurrentPercentage { get; set; } // Lecturer's percentage share

		public List<LecturerPayrollDetailsDto> PayrollDetails { get; set; } = new List<LecturerPayrollDetailsDto>();
	}

	public class LecturerPayrollDetailsDto
	{
		public Guid TransactionDetailId { get; set; }
		public Guid CourseId { get; set; }
		public string? CourseTitle { get; set; }
		public decimal CoursePrice { get; set; }
		public string? Image { get; set; }
		public string? BuyerEmail { get; set; }
		public double? Percentage { get; set; }
		public DateTime TransactionDate { get; set; }
	}
}
