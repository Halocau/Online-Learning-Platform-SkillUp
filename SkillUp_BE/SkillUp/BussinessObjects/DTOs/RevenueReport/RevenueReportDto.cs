namespace SkillUp.BussinessObjects.DTOs.RevenueReport
{
    public class RevenueReportDto
    {
        public decimal TotalLifetimeEarnings { get; set; }
        public List<RevenueChartDto> RevenueChart { get; set; }
        public List<CourseRevenueDto> CourseRevenues { get; set; }
    }

    public class RevenueChartDto
    {
        public string Label { get; set; }
        public decimal Revenue { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CourseRevenueDto
    {
        public Guid CourseId { get; set; }
        public string Title { get; set; }
        public string Image { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalSales { get; set; }
    }

}
