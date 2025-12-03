using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.ModDashboard;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using System.Net.NetworkInformation;

namespace SkillUp.Repositories.Implementations
{
	public class SysModDashRepository : ISysModDashRepository
	{
		private readonly SkillUpContext _context;
		public SysModDashRepository(SkillUpContext context)
		{
			_context = context;
		}

		public async Task<SysmodDashboardDto> GetDashboardStatisticsAsync()
		{
			// User Statistics (Lecturers & Students)
			var userStats = await _context.Accounts
				.GroupBy(x => 1) // Fake GroupBy to allow multiple aggregations
				.Select(g => new
				{
					ActiveLecturers = g.Count(u => u.RoleId == 4 && u.Status == "Active"),
					InactiveLecturers = g.Count(u => u.RoleId == 4 && u.Status == "InActive"),
					BannedLecturers = g.Count(u => u.RoleId == 4 && u.Status == "Banned"),

					ActiveStudents = g.Count(u => u.RoleId == 5 && u.Status == "Active"),
					InactiveStudents = g.Count(u => u.RoleId == 5 && u.Status == "InActive"),
					BannedStudents = g.Count(u => u.RoleId == 5 && u.Status == "Banned"),
				})
				.FirstOrDefaultAsync();

			// Ticket Statistics
			var ticketStats = await _context.Tickets
				.GroupBy(x => 1)
				.Select(g => new
				{
					Pending = g.Count(t => t.Status == "Pending"),
					Solved = g.Count(t => t.Status == "Accepted" || t.Status == "Rejected")
				})
				.FirstOrDefaultAsync();

			//Application Statistics
			var appStats = await _context.LecturerApplications
				.GroupBy(x => 1)
				.Select(g => new
				{
					Pending = g.Count(a => a.Status == "Pending"),
					Accepted = g.Count(a => a.Status == "Accepted"),
					Rejected = g.Count(a => a.Status == "Rejected")
				})
				.FirstOrDefaultAsync();

			return new SysmodDashboardDto
			{
				ActiveLecturerCount = userStats?.ActiveLecturers ?? 0,
				InactiveLecturerCount = userStats?.InactiveLecturers ?? 0,
				BannedLecturerCount = userStats?.BannedLecturers ?? 0,
				ActiveStudentCount = userStats?.ActiveStudents ?? 0,
				InactiveStudentCount = userStats?.InactiveStudents ?? 0,
				BannedStudentCount = userStats?.BannedStudents ?? 0,

				PendingTicketCount = ticketStats?.Pending ?? 0,
				SolvedTicketCount = ticketStats?.Solved ?? 0,

				PendingLecturerApplicationCount = appStats?.Pending ?? 0,
				LecturerApplicationAcceptedCount = appStats?.Accepted ?? 0,
				LecturerApplicationRejectedCount = appStats?.Rejected ?? 0,
			};
		}
	}
}
