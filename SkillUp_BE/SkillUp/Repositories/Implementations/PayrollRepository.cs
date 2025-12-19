using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.Salary;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
	public class PayrollRepository : IPayrollRepository
	{
		private readonly SkillUpContext _context;
		public PayrollRepository(SkillUpContext context)
		{
			_context = context;
		}

		public async Task<List<LecturerPayrollDto>> GetAllLecturersPayrollAsync(int month, int year)
		{
			return await _context.Lecturers
				.Include(l => l.Account)
				.Select(l => new LecturerPayrollDto
				{
					LecturerId = l.Id,
					LecturerName = l.Account.Fullname,
					ReceiverName = l.ReceiverName,
					BankNumber = l.BankNumber,
					BankName = l.BankName,
					CurrentPercentage = l.Percentage,

					// Calculate Total Revenue for specific month/year
					TotalRevenue = l.Courses
						.SelectMany(c => c.TransactionDetails)
						.Where(td => td.Transaction.Status == "Success" &&
									 td.Transaction.CreatedAt.Month == month &&
									 td.Transaction.CreatedAt.Year == year)
						.Sum(td => (double?)td.Price) ?? 0,

					LecturerIncome = l.Courses
						.SelectMany(c => c.TransactionDetails)
						.Where(td => td.Transaction.Status == "Success" &&
									 td.Transaction.CreatedAt.Month == month &&
									 td.Transaction.CreatedAt.Year == year)
						.Sum(td => (double?)td.LecturerIncome) ?? 0,
				})
				.ToListAsync();
		}
	}
}
