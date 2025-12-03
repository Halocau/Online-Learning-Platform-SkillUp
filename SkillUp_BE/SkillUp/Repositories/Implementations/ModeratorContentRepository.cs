using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.ContentModeration;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class ModeratorContentRepository : IModeratorContentRepository
    {
        private readonly SkillUpContext _context;

        public ModeratorContentRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<ModeratorContentDashboardDto> GetDashboardDataAsync()
        {
            var totalNews = await _context.News.CountAsync();
            var totalPosts = await _context.Posts.CountAsync();
            var totalCategories = await _context.Categories.CountAsync();
            var totalBanners = await _context.Banners.CountAsync();

            // Đếm báo cáo bình luận chưa giải quyết
            var unresolvedCommentPostReports = await _context.CommentReportPosts
                .CountAsync(cr => cr.Status == "Pending");

            // Đếm báo cáo bình luận đã giải quyết
            var resolvedCommentPostReports = await _context.CommentReportPosts
                .CountAsync(cr => cr.Status == "Rejected" || cr.Status == "Accepted");

            // Đếm báo cáo bình luận bài học đã giải quyết
            var resolvedCommentLessonReports = await _context.CommentReportLessons
                .CountAsync(cr => cr.Status == "Rejected" || cr.Status == "Accepted");

            var unresolvedCommentLessonReports = await _context.CommentReportLessons
                .CountAsync(cr => cr.Status == "Pending");

            // Lấy danh sách khóa học đã công khai
            var publishedCoursesList = await _context.Courses
                .Include(c => c.Lecturer)
                .ThenInclude(l => l.Account)
                .Where(c => c.Status == "Public")
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CourseItemDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Image = c.Image,
                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    LecturerName = c.Lecturer.Account.Fullname
                })
                .ToListAsync();

            // Lấy danh sách khóa học đang chờ duyệt
            var pendingCoursesList = await _context.Courses
                .Include(c => c.Lecturer)
                .ThenInclude(l => l.Account)
                .Where(c => c.Status == "Pending")
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CourseItemDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Image = c.Image,
                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    LecturerName = c.Lecturer.Account.Fullname
                })
                .ToListAsync();

            // Lấy danh sách khóa học chưa xuất bản
            var unpublishedCoursesList = await _context.Courses
                .Include(c => c.Lecturer)
                .ThenInclude(l => l.Account)
                .Where(c => c.Status == "Draft" || c.Status == "Unpublish")
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CourseItemDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Image = c.Image,
                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    LecturerName = c.Lecturer.Account.Fullname
                })
                .ToListAsync();

            // Lấy danh sách báo cáo khóa học chưa xử lý
            var unprocessedCourseReportsList = await _context.ReportCourses
                .Include(rc => rc.Course)
                .Include(rc => rc.Student)
                .ThenInclude(s => s.Account)
                .Where(rc => rc.Status == "Pending")
                .OrderByDescending(rc => rc.CreatedAt)
                .Select(rc => new CourseReportItemDto
                {
                    Id = rc.Id,
                    CourseId = rc.CourseId,
                    CourseTitle = rc.Course.Title,
                    CourseImage = rc.Course.Image,
                    Description = rc.Description ?? string.Empty,
                    Status = rc.Status,
                    CreatedAt = rc.CreatedAt ?? DateTime.MinValue,
                    StudentName = rc.Student.Account.Fullname
                })
                .ToListAsync();

            return new ModeratorContentDashboardDto
            {
                TotalNews = totalNews,
                TotalPosts = totalPosts,
                TotalUnresolvedCommentReports = unresolvedCommentPostReports + unresolvedCommentLessonReports,
                TotalResolvedCommentReports = resolvedCommentPostReports + resolvedCommentLessonReports,
                TotalCategories = totalCategories,
                TotalBanners = totalBanners,
                CourseStatistics = new CourseStatisticsDto
                {
                    Publish = publishedCoursesList.Count,
                    Pending = pendingCoursesList.Count,
                    Unpublish = unpublishedCoursesList.Count,
                    ReportCourse = unprocessedCourseReportsList.Count,
                    PublishedCourses = publishedCoursesList,
                    PendingApprovalCourses = pendingCoursesList,
                    UnpublishedCourses = unpublishedCoursesList,
                    UnprocessedCourseReports = unprocessedCourseReportsList
                }
            };
        }
    }
}

