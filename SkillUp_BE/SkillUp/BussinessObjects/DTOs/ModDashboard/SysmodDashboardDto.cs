namespace SkillUp.BussinessObjects.DTOs.ModDashboard
{
	public class SysmodDashboardDto
	{
		public int ActiveLecturerCount { get; set; }
		public int InactiveLecturerCount { get; set; }
		public int BannedLecturerCount { get; set; }
		public int ActiveStudentCount { get; set; }
		public int InactiveStudentCount { get; set; }
		public int BannedStudentCount { get; set; }

		public int PendingTicketCount { get; set; }
		public int SolvedTicketCount { get; set; }

		public int PendingLecturerApplicationCount { get; set; }
		public int LecturerApplicationAcceptedCount { get; set; }
		public int LecturerApplicationRejectedCount { get; set; }
	}
}
