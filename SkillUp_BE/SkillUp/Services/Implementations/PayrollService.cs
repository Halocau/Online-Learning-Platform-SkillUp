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

			foreach (var record in payrollList)
			{
				if (record.TotalRevenue > 0)
				{
					record.PlatformFee = record.TotalRevenue - record.LecturerIncome;
				}
				else
				{
					record.PlatformFee = 0;
				}
			}

			// Sort by income before returning
			return payrollList.OrderByDescending(x => x.LecturerIncome).ToList();
		}
	}
}
