using SkillUp.BussinessObjects.DTOs.Salary;

namespace SkillUp.Services.Interfaces
{
	public interface IPayrollService
	{
		Task<List<LecturerPayrollDto>> GenerateMonthlyPayrollReportAsync(int month, int year);
	}
}
