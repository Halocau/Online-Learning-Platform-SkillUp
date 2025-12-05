namespace SkillUp.BussinessObjects.DTOs.ContentModeration
{

    public class ModeratorContentDashboardDto
    {
        public int TotalNews { get; set; }
        public int TotalPosts { get; set; }
        public int TotalUnresolvedCommentReports { get; set; }
        public int TotalResolvedCommentReports { get; set; }
        public int TotalCategories { get; set; }
        public int TotalBanners { get; set; }
        public CourseStatisticsDto CourseStatistics { get; set; } = new CourseStatisticsDto();
    }

    public class CourseStatisticsDto
    {
        public int Publish { get; set; }
        public int Pending { get; set; }
        public int Unpublish { get; set; }
        public int ReportCourse { get; set; }
        public List<CourseItemDto> PublishedCourses { get; set; } = new List<CourseItemDto>();
        public List<CourseItemDto> PendingApprovalCourses { get; set; } = new List<CourseItemDto>();
        public List<CourseItemDto> UnpublishedCourses { get; set; } = new List<CourseItemDto>();
        public List<CourseReportItemDto> UnprocessedCourseReports { get; set; } = new List<CourseReportItemDto>();
    }

    public class CourseItemDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Image { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string LecturerName { get; set; }
    }

    public class CourseReportItemDto
    {
        public Guid Id { get; set; }
        public Guid CourseId { get; set; }
        public string CourseTitle { get; set; }
        public string CourseImage { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string StudentName { get; set; }
    }
}

