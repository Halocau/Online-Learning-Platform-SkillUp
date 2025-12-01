using SkillUp.BussinessObjects.DTOs.Salary;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
	public class PayrollService : IPayrollService
	{
		private readonly IPayrollRepository _payrollRepository;
		public PayrollService(IPayrollRepository payrollRepository)
		{
			_payrollRepository = payrollRepository;
		}
		public async Task<List<LecturerPayrollDto>> GenerateMonthlyPayrollReportAsync(int month, int year)
		{
			var payrollList = await _payrollRepository.GetAllLecturersPayrollAsync(month, year);
			// Define the platform fee (e.g., 40%)
			decimal feePercentage = 0.40m;
			foreach (var record in payrollList)
			{
				if (record.TotalRevenue > 0)
				{
					record.PlatformFee = record.TotalRevenue * feePercentage;
					record.NetIncome = record.TotalRevenue - record.PlatformFee;
				}
				else
				{
					record.PlatformFee = 0;
					record.NetIncome = 0;
				}
			}
			// Sort by income before returning
			return payrollList.OrderByDescending(x => x.NetIncome).ToList();
		}
	}
}
