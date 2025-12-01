using SkillUp.BussinessObjects.DTOs.Salary;

namespace SkillUp.Repositories.Interfaces
{
	public interface IPayrollRepository
	{
		Task<List<LecturerPayrollDto>> GetAllLecturersPayrollAsync(int month, int year);
	}
}
